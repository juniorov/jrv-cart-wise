import {
  collection,
  addDoc,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toCrc } from '@/apps/cart-wise/utils/currency'

const productsRef = collection(db, 'cartwise_products')

export async function getProducts() {
  const snapshot = await getDocs(query(productsRef, orderBy('name')))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createProduct({ name, category = null, unit, detailedPrice = false }) {
  const docRef = await addDoc(productsRef, {
    name,
    category,
    unit,
    detailedPrice,
    createdAt: serverTimestamp(),
    prices: {},
  })
  return docRef.id
}

export async function updateProduct(productId, { name, category, unit, detailedPrice }) {
  await updateDoc(doc(db, 'cartwise_products', productId), { name, category, unit, detailedPrice })
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, 'cartwise_products', productId))
}

export async function setProductPrice(productId, businessId, price, currency, packageQty = null) {
  await updateDoc(doc(db, 'cartwise_products', productId), {
    [`prices.${businessId}`]: { price, currency, packageQty, updatedAt: serverTimestamp() },
  })
}

export async function deleteProductPrice(productId, businessId) {
  await updateDoc(doc(db, 'cartwise_products', productId), {
    [`prices.${businessId}`]: deleteField(),
  })
}

/**
 * Resuelve la entrada (negocio) más barata de un producto, convirtiendo a CRC solo para
 * comparar. Si el producto tiene `detailedPrice` activo, compara por precio normalizado
 * (precio / packageQty) en vez de precio bruto, para poder comparar correctamente
 * presentaciones distintas entre negocios (ej. 3kg vs 2.2kg). Devuelve null si no hay precios.
 */
export function getCheapestEntry(product, usdToCrc) {
  const entries = Object.entries(product.prices ?? {})
  if (entries.length === 0) return null

  return entries.reduce((cheapest, [businessId, entry]) => {
    const crcPrice = toCrc(entry.price, entry.currency, usdToCrc)
    const comparablePrice =
      product.detailedPrice && entry.packageQty ? crcPrice / entry.packageQty : crcPrice
    if (!cheapest || comparablePrice < cheapest.comparablePrice) {
      return { businessId, ...entry, comparablePrice }
    }
    return cheapest
  }, null)
}

/**
 * Filtra productos por nombre (contiene, insensible a mayúsculas) y los ordena por
 * precio más barato ascendente, convirtiendo a CRC solo para comparar.
 */
export async function searchProducts(term, usdToCrc) {
  const products = await getProducts()
  const normalizedTerm = term.trim().toLowerCase()

  return products
    .filter((product) => product.name.toLowerCase().includes(normalizedTerm))
    .map((product) => ({ ...product, cheapest: getCheapestEntry(product, usdToCrc) }))
    .sort((a, b) => {
      if (!a.cheapest) return 1
      if (!b.cheapest) return -1
      return a.cheapest.comparablePrice - b.cheapest.comparablePrice
    })
}

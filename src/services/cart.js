import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { getCheapestEntry } from '@/services/products'

function requireUid() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Debes iniciar sesión para usar el carrito.')
  return uid
}

function cartRef(uid) {
  return collection(db, 'users', uid, 'cart')
}

export async function addToCart(productId) {
  const uid = requireUid()
  await setDoc(doc(cartRef(uid), productId), {
    productId,
    addedAt: serverTimestamp(),
  })
}

export async function removeFromCart(productId) {
  const uid = requireUid()
  await deleteDoc(doc(cartRef(uid), productId))
}

/**
 * Para cada producto del carrito, resuelve el negocio con el precio más bajo
 * al momento de la consulta (no el que tenía al agregarlo).
 */
export async function getCartWithCheapestBusiness(usdToCrc) {
  const uid = requireUid()
  const cartSnapshot = await getDocs(cartRef(uid))

  const items = await Promise.all(
    cartSnapshot.docs.map(async (cartDoc) => {
      const productId = cartDoc.id
      const productSnapshot = await getDoc(doc(db, 'products', productId))
      if (!productSnapshot.exists()) return null

      const product = productSnapshot.data()
      const cheapest = getCheapestEntry(product, usdToCrc)

      return {
        productId,
        productName: product.name,
        unit: product.unit,
        detailedPrice: product.detailedPrice,
        cheapest,
      }
    }),
  )

  return items.filter(Boolean)
}

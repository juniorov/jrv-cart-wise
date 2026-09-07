import { ref } from 'vue'
import { SEED_PRODUCTS } from '../data/seedProducts.js'

const STORAGE_KEY = 'spray_mix_products_v1'

const products = ref([])
let initialized = false

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products.value))
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      products.value = JSON.parse(raw)
      return
    } catch {
      // localStorage corrupto: cae al seed de abajo
    }
  }
  products.value = SEED_PRODUCTS.map((p) => ({ ...p }))
  persist()
}

function addProduct(product) {
  products.value.push({ id: crypto.randomUUID(), ...product })
  persist()
}

function updateProduct(id, changes) {
  const index = products.value.findIndex((p) => p.id === id)
  if (index === -1) return
  products.value[index] = { ...products.value[index], ...changes }
  persist()
}

function deleteProduct(id) {
  products.value = products.value.filter((p) => p.id !== id)
  persist()
}

export function useProducts() {
  if (!initialized) {
    initialized = true
    load()
  }
  return { products, addProduct, updateProduct, deleteProduct }
}

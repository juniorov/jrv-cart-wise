import { ref } from 'vue'

const CACHE_KEY = 'global_exchange_er_cache_v2'
const API_URL = 'https://open.er-api.com/v6/latest/USD'

// Shared reactive state (singleton)
const rates = ref(null)
const lastUpdate = ref(null)
const nextUpdate = ref(null)
const loading = ref(false)
const error = ref(null)
const isOnline = ref(navigator.onLine)

let initialized = false

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    rates.value = data.rates
    lastUpdate.value = data.timestamp
    nextUpdate.value = data.nextUpdate
    return true
  } catch {
    return false
  }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      rates: data.rates,
      timestamp: Date.now(),
      nextUpdate: data.time_next_update_unix * 1000,
    }))
  } catch {
    // Storage quota exceeded, ignore
  }
}

function isCacheValid() {
  return nextUpdate.value && Date.now() < nextUpdate.value && rates.value !== null
}

async function fetchRates(force = false) {
  if (!force && isCacheValid()) return
  if (!isOnline.value) return

  loading.value = true
  error.value = null

  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.result !== 'success') throw new Error('API error')

    rates.value = data.rates
    lastUpdate.value = Date.now()
    nextUpdate.value = data.time_next_update_unix * 1000
    saveCache(data)
  } catch (e) {
    error.value = 'No se pudo obtener el tipo de cambio. Usando datos guardados.'
    loadCache()
  } finally {
    loading.value = false
  }
}

function convert(amount, fromCode, toCode) {
  if (!rates.value || amount === null || amount === undefined) return null
  const fromRate = rates.value[fromCode]
  const toRate = rates.value[toCode]
  if (!fromRate || !toRate) return null
  // All rates are relative to USD: convert via USD as pivot
  return (parseFloat(amount) / fromRate) * toRate
}

export function useExchangeRate() {
  if (!initialized) {
    initialized = true
    loadCache()
    fetchRates()

    window.addEventListener('online', () => {
      isOnline.value = true
      fetchRates()
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })
  }

  return { rates, lastUpdate, nextUpdate, loading, error, isOnline, fetchRates, convert }
}

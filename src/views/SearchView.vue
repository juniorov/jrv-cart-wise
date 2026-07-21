<script setup>
import { onMounted, ref, watch } from 'vue'
import { getBusinesses } from '@/services/businesses'
import { searchProducts } from '@/services/products'
import { addToCart } from '@/services/cart'
import { useSettingsStore } from '@/stores/settings'
import { formatDetailedPrice, formatPrice } from '@/utils/currency'
import { detailedPrice, unitSuffix } from '@/utils/units'

const settingsStore = useSettingsStore()
const term = ref('')
const results = ref([])
const businesses = ref([])
const loading = ref(false)
const addedIds = ref(new Set())

function businessName(businessId) {
  return businesses.value.find((b) => b.id === businessId)?.name ?? businessId
}

async function runSearch() {
  loading.value = true
  try {
    results.value = await searchProducts(term.value, settingsStore.usdToCrc ?? 1)
  } finally {
    loading.value = false
  }
}

async function handleAddToCart(productId) {
  await addToCart(productId)
  addedIds.value = new Set(addedIds.value).add(productId)
}

watch(term, runSearch)

onMounted(async () => {
  if (!settingsStore.loaded) await settingsStore.load()
  businesses.value = await getBusinesses()
  await runSearch()
})
</script>

<template>
  <h1 class="h4 mb-3">Buscar productos</h1>

  <div class="mb-3">
    <input
      v-model="term"
      type="search"
      class="form-control"
      placeholder="Buscar por nombre…"
      autofocus
    />
  </div>

  <div
    v-if="!settingsStore.usdToCrc"
    class="alert alert-warning py-2"
  >
    No hay tipo de cambio configurado. Los precios en USD no se podrán comparar correctamente
    hasta que lo definas en Ajustes.
  </div>

  <div v-if="loading" class="text-muted">Buscando…</div>
  <div v-else-if="results.length === 0" class="text-muted">No se encontraron productos.</div>
  <ul v-else class="list-group">
    <li
      v-for="product in results"
      :key="product.id"
      class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <div>
        <div class="fw-semibold">{{ product.name }}</div>
        <div v-if="product.cheapest" class="small text-muted">
          <i class="bi bi-shop me-1"></i>{{ businessName(product.cheapest.businessId) }} —
          <span class="fw-semibold text-success">
            {{ formatPrice(product.cheapest.price, product.cheapest.currency) }}
            {{ unitSuffix(product.unit) }}
          </span>
          <template
            v-for="detail in [
              product.detailedPrice ? detailedPrice(product.cheapest, product.unit) : null,
            ]"
            :key="`detail-${product.id}`"
          >
            <span v-if="detail" style="font-size: var(--font-size-xs)">
              ({{ formatDetailedPrice(detail.amount, detail.currency) }}{{ detail.suffix }})
            </span>
          </template>
        </div>
        <div v-else class="small text-muted">Sin precios registrados.</div>
      </div>
      <button
        class="btn btn-sm"
        :class="addedIds.has(product.id) ? 'btn-success' : 'btn-outline-primary'"
        :disabled="!product.cheapest"
        @click="handleAddToCart(product.id)"
      >
        <i class="bi" :class="addedIds.has(product.id) ? 'bi-check-lg' : 'bi-cart-plus'"></i>
        {{ addedIds.has(product.id) ? 'Agregado' : 'Agregar al carrito' }}
      </button>
    </li>
  </ul>
</template>

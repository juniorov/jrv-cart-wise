<script setup>
import { onMounted, ref } from 'vue'
import { getBusinesses } from '@/apps/cart-wise/services/businesses'
import { getCartWithCheapestBusiness, removeFromCart } from '@/apps/cart-wise/services/cart'
import { useSettingsStore } from '@/apps/cart-wise/stores/settings'
import { formatDetailedPrice, formatPrice } from '@/apps/cart-wise/utils/currency'
import { detailedPrice, unitSuffix } from '@/apps/cart-wise/utils/units'

const settingsStore = useSettingsStore()
const items = ref([])
const businesses = ref([])
const loading = ref(true)

function businessName(businessId) {
  return businesses.value.find((b) => b.id === businessId)?.name ?? businessId
}

async function loadCart() {
  loading.value = true
  if (!settingsStore.loaded) await settingsStore.load()
  const [cartItems, businessList] = await Promise.all([
    getCartWithCheapestBusiness(settingsStore.usdToCrc ?? 500),
    getBusinesses(),
  ])
  items.value = cartItems
  businesses.value = businessList
  loading.value = false
}

async function handleRemove(productId) {
  await removeFromCart(productId)
  await loadCart()
}

onMounted(loadCart)
</script>

<template>
  <h1 class="h4 mb-3">Carrito</h1>

  <div v-if="loading" class="text-muted">Cargando…</div>
  <div v-else-if="items.length === 0" class="text-muted">
    Tu carrito está vacío. Agregá productos desde el buscador.
  </div>
  <ul v-else class="list-group">
    <li
      v-for="item in items"
      :key="item.productId"
      class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <div>
        <div class="fw-semibold">{{ item.productName }}</div>
        <div v-if="item.cheapest" class="small text-muted">
          <i class="bi bi-shop me-1"></i>{{ businessName(item.cheapest.businessId) }} —
          <span class="fw-semibold text-success">
            {{ formatPrice(item.cheapest.price, item.cheapest.currency) }}
            {{ unitSuffix(item.unit) }}
          </span>
          <template
            v-for="detail in [
              item.detailedPrice ? detailedPrice(item.cheapest, item.unit) : null,
            ]"
            :key="`detail-${item.productId}`"
          >
            <span v-if="detail" style="font-size: var(--font-size-xs)">
              ({{ formatDetailedPrice(detail.amount, detail.currency) }}{{ detail.suffix }})
            </span>
          </template>
        </div>
        <div v-else class="small text-danger">Este producto ya no tiene precios registrados.</div>
      </div>
      <button
        class="btn btn-sm btn-outline-danger"
        title="Quitar del carrito"
        @click="handleRemove(item.productId)"
      >
        <i class="bi bi-trash"></i>
      </button>
    </li>
  </ul>
</template>

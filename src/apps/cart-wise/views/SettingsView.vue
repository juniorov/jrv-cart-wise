<script setup>
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '@/apps/cart-wise/stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(true)

const SOURCE_LABELS = {
  gometa: 'apis.gometa.org',
  paginasweb: 'tipodecambio.paginasweb.cr',
  default: 'valor por defecto (sin conexión a las fuentes)',
}

async function refresh() {
  loading.value = true
  try {
    await settingsStore.refresh()
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-md-6 col-lg-4">
      <h1 class="h4 mb-3">Ajustes</h1>
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <label class="form-label">Tipo de cambio (¢ por $1)</label>

          <div v-if="loading" class="text-muted">Obteniendo tipo de cambio…</div>
          <div v-else class="d-flex align-items-center gap-2">
            <span class="fs-4 fw-semibold">₡{{ settingsStore.usdToCrc }}</span>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary ms-auto"
              title="Actualizar"
              :disabled="loading"
              @click="refresh"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <div v-if="!loading" class="text-muted small mt-1">
            Fuente: {{ SOURCE_LABELS[settingsStore.source] ?? settingsStore.source }}
          </div>

          <p class="text-muted small mt-3 mb-0">
            Se obtiene automáticamente al abrir la app (apis.gometa.org, con
            tipodecambio.paginasweb.cr como respaldo si falla; si ambas fallan se usa ₡500 por
            defecto). Se usa únicamente para comparar precios entre negocios que cobran en
            monedas distintas — el precio mostrado siempre es el original de cada negocio.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

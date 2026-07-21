<script setup>
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const usdToCrc = ref('')
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  await settingsStore.load()
  usdToCrc.value = settingsStore.usdToCrc ?? ''
})

async function handleSubmit() {
  saving.value = true
  saved.value = false
  try {
    await settingsStore.save(Number(usdToCrc.value))
    saved.value = true
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-md-6 col-lg-4">
      <h1 class="h4 mb-3">Ajustes</h1>
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <label class="form-label" for="usdToCrc">Tipo de cambio (¢ por $1)</label>
          <form class="d-flex gap-2" @submit.prevent="handleSubmit">
            <input
              id="usdToCrc"
              v-model="usdToCrc"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              placeholder="Ej: 520"
              required
            />
            <button type="submit" class="btn btn-primary" :disabled="saving">Guardar</button>
          </form>
          <div v-if="saved" class="text-success small mt-2">
            <i class="bi bi-check-circle-fill me-1"></i>Tipo de cambio actualizado.
          </div>
          <p class="text-muted small mt-3 mb-0">
            Se usa únicamente para comparar precios entre negocios que cobran en monedas
            distintas. El precio mostrado siempre es el original de cada negocio.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

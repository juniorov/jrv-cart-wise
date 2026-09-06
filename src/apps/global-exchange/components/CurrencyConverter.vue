<script setup>
import { ref, computed, watch } from 'vue'
import { useExchangeRate } from '../composables/useExchangeRate.js'
import { CURRENCIES, REGION_LABELS, REGION_COLORS } from '../data/currencies.js'

const { rates, lastUpdate, loading, error, isOnline, fetchRates, convert } = useExchangeRate()

const STORAGE_KEY = 'global_exchange_converter_prefs_v1'
const DEFAULTS = { fromCurrency: 'USD', targetCurrencies: ['EUR', 'BRL', 'CRC'] }

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    return {
      fromCurrency: parsed.fromCurrency || DEFAULTS.fromCurrency,
      targetCurrencies: Array.isArray(parsed.targetCurrencies) && parsed.targetCurrencies.length
        ? parsed.targetCurrencies
        : DEFAULTS.targetCurrencies,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

function savePrefs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    fromCurrency: fromCurrency.value,
    targetCurrencies: targetCurrencies.value,
  }))
}

function clearPrefs() {
  localStorage.removeItem(STORAGE_KEY)
  fromCurrency.value = DEFAULTS.fromCurrency
  targetCurrencies.value = [...DEFAULTS.targetCurrencies]
}

const prefs = loadPrefs()
const amount = ref(100)
const fromCurrency = ref(prefs.fromCurrency)
const targetCurrencies = ref(prefs.targetCurrencies)
const showCurrencySelector = ref(false)

// Persist on every change
watch(fromCurrency, savePrefs)
watch(targetCurrencies, savePrefs, { deep: true })

const availableCurrencies = computed(() => {
  if (!rates.value) return CURRENCIES
  return CURRENCIES.filter(c => rates.value[c.code] !== undefined)
})

const groupedCurrencies = computed(() => {
  const groups = {}
  availableCurrencies.value.forEach(c => {
    if (!groups[c.region]) groups[c.region] = []
    groups[c.region].push(c)
  })
  return groups
})

const results = computed(() => {
  if (!rates.value || !amount.value) return []
  return targetCurrencies.value
    .filter(code => code !== fromCurrency.value)
    .map(code => {
      const currency = CURRENCIES.find(c => c.code === code)
      if (!currency) return null
      const converted = convert(amount.value, fromCurrency.value, code)
      return { ...currency, amount: converted }
    })
    .filter(r => r !== null && r.amount !== null)
})

const fromCurrencyInfo = computed(() =>
  CURRENCIES.find(c => c.code === fromCurrency.value)
)

const formattedLastUpdate = computed(() => {
  if (!lastUpdate.value) return null
  const diff = Date.now() - lastUpdate.value
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  if (hours < 24) return `hace ${hours}h`
  return new Date(lastUpdate.value).toLocaleDateString('es')
})

function formatAmount(value, code) {
  if (value === null || value === undefined) return '—'
  const noDecimals = ['JPY', 'KRW', 'PYG', 'CLP']
  const decimals = noDecimals.includes(code) ? 0 : 2
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatInputAmount(value) {
  if (!value) return ''
  const noDecimals = ['JPY', 'KRW', 'PYG', 'CLP']
  const decimals = noDecimals.includes(fromCurrencyInfo.value?.code) ? 0 : 2
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function toggleCurrency(code) {
  if (code === fromCurrency.value) return
  const idx = targetCurrencies.value.indexOf(code)
  if (idx >= 0) {
    targetCurrencies.value.splice(idx, 1)
  } else {
    targetCurrencies.value.push(code)
  }
}

function toggleAll() {
  const all = availableCurrencies.value.map(c => c.code)
  if (targetCurrencies.value.length === all.length) {
    targetCurrencies.value = []
  } else {
    targetCurrencies.value = [...all]
  }
}

function resetAll() {
  clearPrefs()
  amount.value = 100
}

const allSelected = computed(() =>
  targetCurrencies.value.length === availableCurrencies.value.length
)

const regionColor = (region) => REGION_COLORS[region] || '#6c757d'
</script>

<template>
  <!-- Status Bar -->
  <div class="status-bar d-flex align-items-center gap-2 px-3 py-2">
    <span class="status-dot" :class="isOnline ? 'status-dot--online' : 'status-dot--offline'"></span>
    <span class="status-text small">{{ isOnline ? 'En línea' : 'Sin conexión' }}</span>
    <span v-if="formattedLastUpdate" class="ms-auto text-muted small">
      <i class="bi bi-clock me-1"></i>{{ formattedLastUpdate }}
    </span>
  </div>

  <div class="container py-3">

    <!-- Error -->
    <div v-if="error" class="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
      <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
      <span class="small">{{ error }}</span>
    </div>

    <!-- ===== RESULTS (TOP) ===== -->
    <section class="results-section mb-3">

      <!-- Loading skeleton -->
      <div v-if="loading && !rates" class="row g-3">
        <div v-for="i in targetCurrencies.length || 3" :key="i" class="col-12">
          <div class="result-skeleton placeholder-glow">
            <div class="d-flex align-items-center gap-3 p-3">
              <div class="placeholder rounded-circle" style="width:48px;height:48px;flex-shrink:0"></div>
              <div class="flex-grow-1">
                <div class="placeholder col-5 mb-1" style="height:1rem"></div>
                <div class="placeholder col-3" style="height:0.8rem"></div>
              </div>
              <div class="placeholder col-3" style="height:2rem"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- No rates + no connection -->
      <div v-else-if="!rates" class="text-center py-5 text-muted">
        <i class="bi bi-wifi-off display-4 d-block mb-3"></i>
        <p class="mb-0">Sin conexión a internet.<br>Conéctate para obtener los tipos de cambio.</p>
      </div>

      <!-- No targets selected -->
      <div v-else-if="rates && targetCurrencies.length === 0" class="empty-state text-center py-4">
        <i class="bi bi-currency-exchange display-4 d-block mb-3 text-muted"></i>
        <p class="text-muted mb-3">Selecciona las monedas<br>a las que quieres convertir</p>
        <button
          class="btn btn-primary btn-lg"
          @click="showCurrencySelector = true"
        >
          <i class="bi bi-plus-lg me-2"></i>Elegir monedas
        </button>
      </div>

      <!-- Results list -->
      <div v-else-if="results.length > 0">
        <p class="results-label text-muted small mb-2 px-1">
          {{ formatInputAmount(amount) }} <strong>{{ fromCurrencyInfo?.flag }} {{ fromCurrency }}</strong> equivale a:
        </p>
        <div class="d-flex flex-column gap-2">
          <div
            v-for="result in results"
            :key="result.code"
            class="result-row"
            :style="{ '--region-color': regionColor(result.region) }"
          >
            <div class="result-row__left d-flex align-items-center gap-3">
              <span class="result-row__flag" aria-hidden="true">{{ result.flag }}</span>
              <div>
                <div class="result-row__code fw-bold">{{ result.code }}</div>
                <div class="result-row__name text-muted">{{ result.name }}</div>
              </div>
            </div>
            <div class="result-row__amount">{{ formatAmount(result.amount, result.code) }}</div>
          </div>
        </div>
      </div>

    </section>

    <!-- ===== CONVERTER FORM (BOTTOM) ===== -->
    <div class="card converter-card shadow-sm">
      <div class="card-body p-3">

        <!-- Amount -->
        <div class="mb-3">
          <label for="amount-input" class="form-label fw-semibold text-muted small text-uppercase letter-spacing">
            Monto
          </label>
          <div class="input-group input-group-lg">
            <span class="input-group-text flag-prefix" aria-hidden="true">
              {{ fromCurrencyInfo?.flag || '💱' }}
            </span>
            <input
              id="amount-input"
              v-model.number="amount"
              type="number"
              inputmode="decimal"
              min="0"
              step="any"
              class="form-control amount-input"
              placeholder="100"
              aria-label="Monto a convertir"
            />
            <span class="input-group-text code-suffix fw-semibold text-muted">
              {{ fromCurrency }}
            </span>
          </div>
        </div>

        <!-- From Currency -->
        <div class="mb-3">
          <label for="from-select" class="form-label fw-semibold text-muted small text-uppercase letter-spacing">
            Moneda de origen
          </label>
          <select id="from-select" v-model="fromCurrency" class="form-select form-select-lg">
            <template v-for="(currencies, region) in groupedCurrencies" :key="region">
              <optgroup :label="REGION_LABELS[region]">
                <option v-for="c in currencies" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.code }} — {{ c.name }}
                </option>
              </optgroup>
            </template>
          </select>
        </div>

        <!-- Toggle currency selector -->
        <button
          class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between mb-3"
          style="min-height:48px"
          @click="showCurrencySelector = !showCurrencySelector"
          :aria-expanded="showCurrencySelector"
        >
          <span>
            <i class="bi bi-grid me-2"></i>
            Monedas seleccionadas
            <span class="badge bg-primary ms-2">{{ targetCurrencies.length }}</span>
          </span>
          <i class="bi" :class="showCurrencySelector ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <!-- Currency selector (collapsible) -->
        <div v-show="showCurrencySelector" class="currency-selector-panel mb-3">
          <div class="d-flex gap-2 mb-3">
            <button @click="toggleAll" class="btn btn-sm btn-outline-primary flex-grow-1" style="min-height:40px">
              {{ allSelected ? 'Quitar todo' : 'Seleccionar todo' }}
            </button>
            <button @click="resetAll" class="btn btn-sm btn-outline-secondary" style="min-height:40px">
              Limpiar todo
            </button>
          </div>

          <template v-for="(currencies, region) in groupedCurrencies" :key="region">
            <div class="region-group mb-3">
              <div class="region-label mb-2">{{ REGION_LABELS[region] }}</div>
              <div class="currency-grid">
                <button
                  v-for="c in currencies"
                  :key="c.code"
                  type="button"
                  class="currency-chip"
                  :class="{
                    'currency-chip--selected': targetCurrencies.includes(c.code),
                    'currency-chip--from': c.code === fromCurrency
                  }"
                  :disabled="c.code === fromCurrency"
                  :aria-pressed="targetCurrencies.includes(c.code)"
                  :aria-label="`${c.name} (${c.code})`"
                  @click="toggleCurrency(c.code)"
                >
                  <span aria-hidden="true">{{ c.flag }}</span>
                  <span class="currency-chip__code">{{ c.code }}</span>
                  <i v-if="targetCurrencies.includes(c.code)" class="bi bi-check2 currency-chip__check" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Refresh -->
        <button
          @click="fetchRates(true)"
          :disabled="!isOnline || loading"
          class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
          style="min-height:48px"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <i v-else class="bi bi-arrow-clockwise" aria-hidden="true"></i>
          {{ loading ? 'Actualizando...' : 'Actualizar tipos de cambio' }}
        </button>

      </div>
    </div>

  </div>
</template>

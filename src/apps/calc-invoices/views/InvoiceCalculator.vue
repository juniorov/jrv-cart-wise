<script setup>
import { computed, onMounted, ref } from 'vue'
import { getUsdToCrcRate } from '../services/exchangeRate.js'

const currency = ref('CRC')
const workAmount = ref(null)
const commissionType = ref('fixed')
const myCommissionValue = ref(null)

const exchangeRate = ref(null)
const isEstimatedRate = ref(false)
const loading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  loading.value = true
  const { rate, estimated } = await getUsdToCrcRate()
  exchangeRate.value = rate
  isEstimatedRate.value = estimated
  if (estimated) {
    errorMessage.value = 'Error al obtener tipo de cambio. Usando valor estimado de 510 CRC.'
  }
  loading.value = false
})

const currencySymbol = computed(() => (currency.value === 'CRC' ? '₡' : '$'))
const workAmountPlaceholder = computed(() => (currency.value === 'CRC' ? '61000.00' : '120.00'))
const commissionLabel = computed(() =>
  commissionType.value === 'fixed' ? 'Mi comisión (monto fijo):' : 'Mi comisión (porcentaje):',
)
const commissionSymbol = computed(() => {
  if (commissionType.value !== 'fixed') return '%'
  return currency.value === 'CRC' ? '₡' : '$'
})
const commissionPlaceholder = computed(() => {
  if (commissionType.value !== 'fixed') return '8.33'
  return currency.value === 'CRC' ? '5000.00' : '10.00'
})

const breakdown = computed(() => {
  if (!exchangeRate.value) return null

  const workAmountValue = parseFloat(workAmount.value) || 0
  const commissionValue = parseFloat(myCommissionValue.value) || 0

  const myCommission =
    commissionType.value === 'fixed' ? commissionValue : (workAmountValue * commissionValue) / 100

  const desiredNet = workAmountValue + myCommission

  let fixedFee = 0
  let fixedFeeLabel = ''
  if (currency.value === 'CRC') {
    fixedFee = 0.35 * exchangeRate.value
    fixedFeeLabel = `$0.35 USD = ₡${fixedFee.toFixed(2)}`
  } else {
    fixedFee = 0.35
    fixedFeeLabel = '$0.35 USD'
  }

  const platformCommissionRate = 0.039
  const ivaRate = 0.0177
  const totalPercentageRate = platformCommissionRate + ivaRate

  const totalToCharge = (desiredNet + fixedFee) / (1 - totalPercentageRate)
  const platformCommission = totalToCharge * platformCommissionRate
  const iva = totalToCharge * ivaRate
  const totalDeductions = platformCommission + iva + fixedFee

  return {
    workAmount: workAmountValue,
    myCommission,
    desiredNet,
    fixedFee,
    fixedFeeLabel,
    platformCommission,
    iva,
    totalDeductions,
    totalToCharge,
  }
})

function fmt(value) {
  return `${currencySymbol.value}${value.toFixed(2)}`
}
</script>

<template>
  <div class="calc-card">
    <h1>💰 Calculadora de Cobros</h1>
    <p class="subtitle">Calcula cuánto debes cobrar incluyendo todas las comisiones</p>

    <div class="input-group">
      <label>Moneda del cobro:</label>
      <select v-model="currency">
        <option value="CRC">Colones (₡ CRC)</option>
        <option value="USD">Dólares ($ USD)</option>
      </select>
    </div>

    <div class="input-group">
      <label for="workAmount">Costo del trabajo/servicio:</label>
      <div class="input-wrapper">
        <span class="currency-symbol">{{ currencySymbol }}</span>
        <input
          id="workAmount"
          v-model="workAmount"
          type="number"
          :placeholder="workAmountPlaceholder"
          step="0.01"
          min="0"
        />
      </div>
    </div>

    <div class="input-group">
      <label>Tipo de comisión personal:</label>
      <select v-model="commissionType">
        <option value="fixed">Monto Fijo</option>
        <option value="percentage">Porcentaje (%)</option>
      </select>
    </div>

    <div class="input-group">
      <label for="myCommission">{{ commissionLabel }}</label>
      <div class="input-wrapper">
        <span class="currency-symbol">{{ commissionSymbol }}</span>
        <input
          id="myCommission"
          v-model="myCommissionValue"
          type="number"
          :placeholder="commissionPlaceholder"
          step="0.01"
          min="0"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Obteniendo tipo de cambio...</div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <div class="result-card">
      <div class="result-label">Monto total a cobrar:</div>
      <div class="result-value">{{ breakdown ? fmt(breakdown.totalToCharge) : `${currencySymbol}0.00` }}</div>

      <div class="breakdown">
        <div class="breakdown-row">
          <span>Costo del trabajo:</span>
          <span>{{ breakdown ? fmt(breakdown.workAmount) : `${currencySymbol}0.00` }}</span>
        </div>
        <div class="breakdown-row">
          <span>Tu comisión:</span>
          <span>{{ breakdown ? fmt(breakdown.myCommission) : `${currencySymbol}0.00` }}</span>
        </div>
        <div class="breakdown-row highlight">
          <span><strong>Subtotal neto deseado:</strong></span>
          <span><strong>{{ breakdown ? fmt(breakdown.desiredNet) : `${currencySymbol}0.00` }}</strong></span>
        </div>
        <div class="breakdown-row breakdown-row--sep">
          <span>Comisión plataforma (3.9%):</span>
          <span>{{ breakdown ? fmt(breakdown.platformCommission) : `${currencySymbol}0.00` }}</span>
        </div>
        <div class="breakdown-row">
          <span>IVA (1.77%):</span>
          <span>{{ breakdown ? fmt(breakdown.iva) : `${currencySymbol}0.00` }}</span>
        </div>
        <div class="breakdown-row">
          <span>Cargo fijo ({{ breakdown ? breakdown.fixedFeeLabel : '$0.35 USD' }}):</span>
          <span>{{ breakdown ? fmt(breakdown.fixedFee) : `${currencySymbol}0.00` }}</span>
        </div>
        <div class="breakdown-row total">
          <span>Total deducciones:</span>
          <span>{{ breakdown ? fmt(breakdown.totalDeductions) : `${currencySymbol}0.00` }}</span>
        </div>
      </div>
    </div>

    <div class="info-box">
      <strong>📌 Tipo de cambio actual:</strong>
      {{ exchangeRate ? exchangeRate.toFixed(2) : 'Cargando...' }}{{ isEstimatedRate ? ' (estimado)' : '' }}
      CRC por USD<br />
      <strong>💡 Fórmula:</strong> El monto a cobrar se calcula para que después de todas las
      deducciones recibas exactamente tu monto neto deseado (trabajo + tu comisión).
    </div>
  </div>
</template>

<style scoped>
.calc-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  margin: 20px auto;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
}

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  color: #555;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 15px;
  color: #667eea;
  font-weight: 600;
  font-size: 18px;
  z-index: 1;
}

input,
select {
  width: 100%;
  padding: 15px 15px 15px 35px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
  outline: none;
}

select {
  padding-left: 15px;
  cursor: pointer;
}

input:focus,
select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.result-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
  color: white;
}

.result-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.result-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
}

.breakdown {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 15px;
  backdrop-filter: blur(10px);
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.breakdown-row--sep {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.breakdown-row.total {
  margin-bottom: 0;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 15px;
}

.breakdown-row.highlight {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 5px;
  margin-top: 5px;
}

.info-box {
  background: #f8f9ff;
  border-left: 4px solid #667eea;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 13px;
  color: #555;
}

.loading {
  text-align: center;
  padding: 10px;
  color: #667eea;
  font-size: 14px;
}

.error {
  background: #fee;
  border-left: 4px solid #e55;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 13px;
  color: #c33;
}
</style>

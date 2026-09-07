<script setup>
import { computed, ref } from 'vue'

const subtotal = ref('')
const tax = ref('')
const personas = ref('')

const porcentajesRapidos = [15, 18, 20, 25]
const porcentajeSeleccionado = ref(20)
const porcentajePersonalizado = ref('')
const usandoPersonalizado = ref(false)

const showError = ref(false)

function elegirPorcentaje(valor) {
  usandoPersonalizado.value = false
  porcentajePersonalizado.value = ''
  porcentajeSeleccionado.value = valor
}

function usarPersonalizado() {
  usandoPersonalizado.value = true
}

const porcentajeActivo = computed(() => {
  if (usandoPersonalizado.value) {
    const valor = parseFloat(porcentajePersonalizado.value)
    return isNaN(valor) ? 0 : valor
  }
  return porcentajeSeleccionado.value
})

const subtotalNum = computed(() => parseFloat(subtotal.value))
const taxNum = computed(() => {
  const valor = parseFloat(tax.value)
  return isNaN(valor) || valor < 0 ? 0 : valor
})
const personasNum = computed(() => {
  const valor = parseInt(personas.value, 10)
  return isNaN(valor) || valor < 1 ? 1 : valor
})

const subtotalValido = computed(() => !isNaN(subtotalNum.value) && subtotalNum.value > 0)

const resultado = computed(() => {
  if (!subtotalValido.value) return null

  const propina = subtotalNum.value * (porcentajeActivo.value / 100)
  const total = subtotalNum.value + taxNum.value + propina
  const porPersona = total / personasNum.value

  return {
    propina: propina.toFixed(2),
    total: total.toFixed(2),
    porPersona: porPersona.toFixed(2),
    mostrarSplit: personasNum.value > 1,
  }
})

function handleInput() {
  showError.value = subtotal.value !== '' && !subtotalValido.value
}
</script>

<template>
  <div class="calc-card">
    <h1>💵 Calculadora de Propina (USA)</h1>
    <p class="intro">
      Calcula fácil cuánto dejar de propina y cuánto pagar en total cuando comes en un
      restaurante en Estados Unidos.
    </p>

    <div class="input-group">
      <label for="subtotal">Subtotal de la cuenta (antes de impuestos)</label>
      <input
        id="subtotal"
        v-model="subtotal"
        type="number"
        placeholder="Ej: 50.00"
        step="0.01"
        min="0"
        @input="handleInput"
      />
      <span class="error" :class="{ visible: showError }">
        Por favor ingresa un monto válido
      </span>
    </div>

    <div class="input-group">
      <label for="tax">Impuesto / Tax (opcional)</label>
      <input id="tax" v-model="tax" type="number" placeholder="Ej: 4.00" step="0.01" min="0" />
      <span class="hint">Es el "tax" que ya aparece en tu factura, antes de la propina.</span>
    </div>

    <div class="input-group">
      <label>¿Cuánto de propina quieres dejar?</label>
      <div class="porcentaje-botones">
        <button
          v-for="p in porcentajesRapidos"
          :key="p"
          type="button"
          class="pct-btn"
          :class="{ active: !usandoPersonalizado && porcentajeSeleccionado === p }"
          @click="elegirPorcentaje(p)"
        >
          {{ p }}%
        </button>
        <input
          v-model="porcentajePersonalizado"
          type="number"
          class="pct-custom"
          :class="{ active: usandoPersonalizado }"
          placeholder="Otro %"
          step="1"
          min="0"
          @focus="usarPersonalizado"
          @input="usarPersonalizado"
        />
      </div>
    </div>

    <div class="input-group">
      <label for="personas">¿Entre cuántas personas? (opcional)</label>
      <input
        id="personas"
        v-model="personas"
        type="number"
        placeholder="Ej: 4"
        step="1"
        min="1"
      />
    </div>

    <div class="resultado" :class="{ visible: resultado }">
      <div class="resultado-fila">
        <span class="etiqueta">Propina a dejar</span>
        <span class="valor">${{ resultado ? resultado.propina : '0.00' }}</span>
      </div>
      <div class="resultado-fila destacada">
        <span class="etiqueta">Total a pagar</span>
        <span class="valor">${{ resultado ? resultado.total : '0.00' }}</span>
      </div>
      <div v-if="resultado && resultado.mostrarSplit" class="resultado-fila">
        <span class="etiqueta">A cada quien le toca</span>
        <span class="valor">${{ resultado.porPersona }}</span>
      </div>
    </div>

    <div class="ayuda">
      <p>
        💡 En Estados Unidos la propina se calcula sobre el monto <strong>antes de
        impuestos</strong>, no sobre el total con tax.
      </p>
      <p>
        ⚠️ Si eran 6 personas o más, revisa bien tu factura: algunos restaurantes ya incluyen
        la propina automáticamente (dice "Gratuity" o "Service Charge"). Si ya viene incluida,
        no agregues otra aquí.
      </p>
    </div>
  </div>
</template>

<style scoped>
.calc-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  margin: 20px auto;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  font-size: 28px;
}

.intro {
  color: #666;
  text-align: center;
  font-size: 14px;
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 22px;
}

label {
  display: block;
  color: #555;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.hint {
  display: block;
  color: #888;
  font-size: 12px;
  margin-top: 6px;
}

.error {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 5px;
  display: none;
}

.error.visible {
  display: block;
}

.porcentaje-botones {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.pct-btn,
.pct-custom {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  background: white;
  color: #555;
  transition: all 0.2s ease;
}

.pct-custom {
  cursor: text;
  font-weight: 500;
}

.pct-btn.active,
.pct-custom.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pct-custom.active::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.resultado {
  margin-top: 10px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 15px;
  display: none;
}

.resultado.visible {
  display: block;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.resultado-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.resultado-fila .etiqueta {
  color: #666;
  font-size: 14px;
}

.resultado-fila .valor {
  color: #764ba2;
  font-size: 20px;
  font-weight: bold;
}

.resultado-fila.destacada {
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  margin: 4px 0;
}

.resultado-fila.destacada .etiqueta {
  color: #333;
  font-weight: 600;
}

.resultado-fila.destacada .valor {
  color: #667eea;
  font-size: 26px;
}

.ayuda {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.ayuda p {
  color: #777;
  font-size: 12.5px;
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.ayuda p:last-child {
  margin-bottom: 0;
}
</style>

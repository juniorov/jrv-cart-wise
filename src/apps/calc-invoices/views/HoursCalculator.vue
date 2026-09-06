<script setup>
import { ref } from 'vue'

const salarioBruto = ref('')
const valorHora = ref('')

const showError = ref({ salario: false, valorHora: false })
const resultado = ref(null)

function calcularHoras() {
  const salario = parseFloat(salarioBruto.value)
  const valor = parseFloat(valorHora.value)

  showError.value = { salario: false, valorHora: false }
  resultado.value = null

  if (isNaN(salario) || salario <= 0) {
    showError.value.salario = true
    return
  }

  if (isNaN(valor) || valor <= 0) {
    showError.value.valorHora = true
    return
  }

  const horasTrabajadas = salario / valor

  resultado.value = {
    horas: horasTrabajadas.toFixed(2),
    detalle: `Con un salario de $${salario.toFixed(2)} y un valor de $${valor.toFixed(2)} por hora`,
  }
}

function handleEnter(event) {
  if (event.key === 'Enter') calcularHoras()
}
</script>

<template>
  <div class="calc-card">
    <h1>⏱️ Calculadora de Horas</h1>

    <div class="input-group">
      <label for="salarioBruto">Salario Bruto Total</label>
      <input
        id="salarioBruto"
        v-model="salarioBruto"
        type="number"
        placeholder="Ej: 2000"
        step="0.01"
        min="0"
        @keypress="handleEnter"
      />
      <span class="error" :class="{ visible: showError.salario }">
        Por favor ingresa un salario válido
      </span>
    </div>

    <div class="input-group">
      <label for="valorHora">Valor por Hora</label>
      <input
        id="valorHora"
        v-model="valorHora"
        type="number"
        placeholder="Ej: 15.50"
        step="0.01"
        min="0.01"
        @keypress="handleEnter"
      />
      <span class="error" :class="{ visible: showError.valorHora }">
        Por favor ingresa un valor por hora válido
      </span>
    </div>

    <button type="button" @click="calcularHoras">Calcular Horas Trabajadas</button>

    <div class="resultado" :class="{ visible: resultado }">
      <h2>Horas Trabajadas</h2>
      <div class="horas">{{ resultado ? resultado.horas : '0' }}</div>
      <p>{{ resultado ? resultado.detalle : '' }}</p>
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
  margin-bottom: 30px;
  text-align: center;
  font-size: 28px;
}

.input-group {
  margin-bottom: 25px;
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

button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  margin-top: 10px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

.resultado {
  margin-top: 30px;
  padding: 25px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-radius: 15px;
  text-align: center;
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

.resultado h2 {
  color: #667eea;
  font-size: 20px;
  margin-bottom: 10px;
}

.resultado .horas {
  font-size: 48px;
  font-weight: bold;
  color: #764ba2;
  margin: 15px 0;
}

.resultado p {
  color: #666;
  font-size: 14px;
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
</style>

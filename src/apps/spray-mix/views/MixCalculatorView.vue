<script setup>
import { computed, ref } from 'vue'
import { useProducts } from '../composables/useProducts.js'
import { calculateAmount, ccToOz, ozToCc } from '../utils/dosing.js'

const { products } = useProducts()

const BOMBA_PRESETS = [1, 5, 6, 16, 18, 20]
const liters = ref(18)
const selectedIds = ref([])

function toggleProduct(id) {
  const index = selectedIds.value.indexOf(id)
  if (index >= 0) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

const results = computed(() => {
  if (!liters.value || liters.value <= 0) return []
  return products.value
    .filter((p) => selectedIds.value.includes(p.id))
    .map((product) => ({ product, amount: calculateAmount(product, liters.value) }))
})

// Conversor rápido cc <-> oz, independiente de la biblioteca.
const quickCc = ref(null)
const quickOz = ref(null)

function onQuickCcInput() {
  quickOz.value = quickCc.value ? Math.round(ccToOz(quickCc.value) * 100) / 100 : null
}

function onQuickOzInput() {
  quickCc.value = quickOz.value ? Math.round(ozToCc(quickOz.value) * 10) / 10 : null
}
</script>

<template>
  <div class="mix-page">
    <section class="card">
      <h2 class="card-title">Litros de agua a preparar</h2>
      <div class="preset-row">
        <button
          v-for="preset in BOMBA_PRESETS"
          :key="preset"
          type="button"
          class="preset-btn"
          :class="{ active: liters === preset }"
          @click="liters = preset"
        >
          {{ preset }} L
        </button>
      </div>
      <input
        v-model.number="liters"
        type="number"
        min="0"
        step="0.5"
        class="liters-input"
        placeholder="Litros personalizados"
      />
    </section>

    <section class="card">
      <h2 class="card-title">Productos a mezclar</h2>
      <p v-if="!products.length" class="empty-hint">
        Todavía no tienes productos guardados. Agrega uno en la pestaña "Productos".
      </p>
      <label v-for="product in products" :key="product.id" class="product-check">
        <input
          type="checkbox"
          :checked="selectedIds.includes(product.id)"
          @change="toggleProduct(product.id)"
        />
        <span>{{ product.name }}</span>
        <small>{{ product.doseAmount }} {{ product.doseUnit }} / {{ product.doseLiters }} L</small>
      </label>
    </section>

    <section v-if="results.length" class="card results-card">
      <h2 class="card-title">Para {{ liters }} L de agua</h2>
      <div v-for="{ product, amount } in results" :key="product.id" class="result-row">
        <span class="result-name">{{ product.name }}</span>
        <span class="result-amount">{{ amount.cc }} cc <small>({{ amount.oz }} oz)</small></span>
      </div>
    </section>

    <section class="card quick-convert">
      <h2 class="card-title">Conversor rápido cc ↔ oz</h2>
      <div class="quick-row">
        <div class="quick-field">
          <label for="quickCc">cc / ml</label>
          <input id="quickCc" v-model.number="quickCc" type="number" min="0" @input="onQuickCcInput" />
        </div>
        <i class="bi bi-arrow-left-right"></i>
        <div class="quick-field">
          <label for="quickOz">oz</label>
          <input id="quickOz" v-model.number="quickOz" type="number" min="0" @input="onQuickOzInput" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.mix-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #ffffff;
  border-radius: 0.85rem;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #134e4a;
  margin: 0 0 0.75rem;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.preset-btn {
  border: 1.5px solid #99f6e4;
  background: #f0fdfa;
  color: #0d9488;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
}

.preset-btn.active {
  background: #0d9488;
  border-color: #0d9488;
  color: #fff;
}

.liters-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.6rem;
  font-size: 1rem;
}

.empty-hint {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

.product-check {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.product-check:last-child {
  border-bottom: none;
}

.product-check span {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.product-check small {
  margin-left: auto;
  color: #94a3b8;
  font-size: 0.78rem;
}

.results-card {
  border-left: 4px solid #0d9488;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e2e8f0;
}

.result-row:last-child {
  border-bottom: none;
}

.result-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.result-amount {
  font-weight: 700;
  color: #0d9488;
  font-size: 1rem;
}

.result-amount small {
  font-weight: 500;
  color: #64748b;
}

.quick-row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.quick-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.quick-field label {
  font-size: 0.75rem;
  color: #64748b;
}

.quick-field input {
  padding: 0.5rem 0.6rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
}

.quick-convert i {
  color: #94a3b8;
  margin-bottom: 0.6rem;
}
</style>

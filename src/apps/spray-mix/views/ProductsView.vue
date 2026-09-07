<script setup>
import { reactive, ref } from 'vue'
import { useProducts } from '../composables/useProducts.js'

const { products, addProduct, updateProduct, deleteProduct } = useProducts()

const emptyForm = () => ({ name: '', doseAmount: 1, doseUnit: 'cc', doseLiters: 1, notes: '' })

const showForm = ref(false)
const editingId = ref(null)
const form = reactive(emptyForm())

function startAdd() {
  Object.assign(form, emptyForm())
  editingId.value = null
  showForm.value = true
}

function startEdit(product) {
  Object.assign(form, product)
  editingId.value = product.id
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
}

function submitForm() {
  if (!form.name || !form.doseAmount || !form.doseLiters) return
  const payload = {
    name: form.name,
    doseAmount: Number(form.doseAmount),
    doseUnit: form.doseUnit,
    doseLiters: Number(form.doseLiters),
    notes: form.notes,
  }
  if (editingId.value) {
    updateProduct(editingId.value, payload)
  } else {
    addProduct(payload)
  }
  cancelForm()
}

function handleDelete(id) {
  deleteProduct(id)
  if (editingId.value === id) cancelForm()
}
</script>

<template>
  <div class="products-page">
    <button v-if="!showForm" type="button" class="add-btn" @click="startAdd">
      <i class="bi bi-plus-circle-fill"></i> Agregar producto
    </button>

    <form v-if="showForm" class="card form-card" @submit.prevent="submitForm">
      <h2 class="card-title">{{ editingId ? 'Editar producto' : 'Nuevo producto' }}</h2>

      <label class="field">
        <span>Nombre</span>
        <input v-model="form.name" type="text" required placeholder="Ej. Minerva 35 SC" />
      </label>

      <div class="field-row">
        <label class="field">
          <span>Dosis</span>
          <input v-model.number="form.doseAmount" type="number" min="0" step="0.1" required />
        </label>
        <label class="field">
          <span>Unidad</span>
          <select v-model="form.doseUnit">
            <option value="cc">cc / ml</option>
            <option value="oz">oz</option>
          </select>
        </label>
        <label class="field">
          <span>Por litros</span>
          <input v-model.number="form.doseLiters" type="number" min="0.1" step="0.1" required />
        </label>
      </div>

      <label class="field">
        <span>Notas (opcional)</span>
        <textarea v-model="form.notes" rows="2" placeholder="Para qué sirve, precauciones, etc." />
      </label>

      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="cancelForm">Cancelar</button>
        <button type="submit" class="btn-primary">Guardar</button>
      </div>
    </form>

    <div v-for="product in products" :key="product.id" class="card product-card">
      <div class="product-header">
        <div>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-dose">{{ product.doseAmount }} {{ product.doseUnit }} por {{ product.doseLiters }} L</p>
        </div>
        <div class="product-actions">
          <button type="button" class="icon-btn" @click="startEdit(product)">
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button type="button" class="icon-btn icon-btn--danger" @click="handleDelete(product.id)">
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      </div>
      <p v-if="product.notes" class="product-notes">{{ product.notes }}</p>
    </div>
  </div>
</template>

<style scoped>
.products-page {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
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

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #475569;
}

.field input,
.field select,
.field textarea {
  padding: 0.55rem 0.65rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
}

.field-row {
  display: flex;
  gap: 0.6rem;
}

.field-row .field {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.55rem 1.1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: #0d9488;
  color: #fff;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.product-dose {
  font-size: 0.85rem;
  color: #0d9488;
  margin: 0.15rem 0 0;
}

.product-actions {
  display: flex;
  gap: 0.4rem;
}

.icon-btn {
  border: none;
  background: #f1f5f9;
  color: #475569;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
}

.icon-btn--danger {
  color: #dc2626;
}

.product-notes {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: #64748b;
}
</style>

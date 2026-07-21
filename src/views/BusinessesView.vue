<script setup>
import { onMounted, ref } from 'vue'
import {
  createBusiness,
  deleteBusiness,
  getBusinesses,
  updateBusiness,
} from '@/services/businesses'

const BUSINESS_TYPES = [
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'carniceria', label: 'Carnicería' },
  { value: 'otro', label: 'Otro' },
]

const businesses = ref([])
const loading = ref(true)
const name = ref('')
const type = ref('supermercado')
const editingId = ref(null)
const editName = ref('')
const editType = ref('supermercado')

async function loadBusinesses() {
  loading.value = true
  businesses.value = await getBusinesses()
  loading.value = false
}

async function handleCreate() {
  if (!name.value.trim()) return
  await createBusiness({ name: name.value.trim(), type: type.value })
  name.value = ''
  type.value = 'supermercado'
  await loadBusinesses()
}

function startEdit(business) {
  editingId.value = business.id
  editName.value = business.name
  editType.value = business.type
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(businessId) {
  await updateBusiness(businessId, { name: editName.value.trim(), type: editType.value })
  editingId.value = null
  await loadBusinesses()
}

async function handleDelete(businessId) {
  if (!confirm('¿Eliminar este negocio?')) return
  await deleteBusiness(businessId)
  await loadBusinesses()
}

function typeLabel(value) {
  return BUSINESS_TYPES.find((t) => t.value === value)?.label ?? value
}

onMounted(loadBusinesses)
</script>

<template>
  <h1 class="h4 mb-3">Negocios</h1>

  <div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
      <form class="row g-2 align-items-end" @submit.prevent="handleCreate">
        <div class="col-12 col-sm-6">
          <label class="form-label" for="name">Nombre</label>
          <input id="name" v-model="name" type="text" class="form-control" required />
        </div>
        <div class="col-8 col-sm-4">
          <label class="form-label" for="type">Tipo</label>
          <select id="type" v-model="type" class="form-select">
            <option v-for="t in BUSINESS_TYPES" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>
        <div class="col-4 col-sm-2">
          <button type="submit" class="btn btn-primary w-100">Agregar</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="loading" class="text-muted">Cargando…</div>
  <div v-else-if="businesses.length === 0" class="text-muted">Aún no hay negocios agregados.</div>
  <ul v-else class="list-group">
    <li
      v-for="business in businesses"
      :key="business.id"
      class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <template v-if="editingId === business.id">
        <div class="d-flex gap-2 flex-grow-1">
          <input v-model="editName" type="text" class="form-control form-control-sm" />
          <select v-model="editType" class="form-select form-select-sm" style="max-width: 160px">
            <option v-for="t in BUSINESS_TYPES" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success" title="Guardar cambios" @click="saveEdit(business.id)">
            <i class="bi bi-check-lg"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" title="Cancelar" @click="cancelEdit">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </template>
      <template v-else>
        <div>
          <span class="fw-semibold">{{ business.name }}</span>
          <span class="badge text-bg-light ms-2">{{ typeLabel(business.type) }}</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" title="Editar negocio" @click="startEdit(business)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Eliminar negocio" @click="handleDelete(business.id)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>
    </li>
  </ul>
</template>

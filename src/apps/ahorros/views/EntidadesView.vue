<script setup>
import { onMounted, ref } from 'vue'
import { createEntity, deleteEntity, getEntities, updateEntity } from '@/apps/ahorros/services/entidades'

const entities = ref([])
const loading = ref(true)
const name = ref('')
const editingId = ref(null)
const editName = ref('')

async function loadEntities() {
  loading.value = true
  entities.value = await getEntities()
  loading.value = false
}

async function handleCreate() {
  if (!name.value.trim()) return
  await createEntity({ name: name.value.trim() })
  name.value = ''
  await loadEntities()
}

function startEdit(entity) {
  editingId.value = entity.id
  editName.value = entity.name
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(entityId) {
  await updateEntity(entityId, { name: editName.value.trim() })
  editingId.value = null
  await loadEntities()
}

async function handleDelete(entityId) {
  if (!confirm('¿Eliminar esta entidad bancaria? Las cuentas asociadas no se eliminarán.')) return
  await deleteEntity(entityId)
  await loadEntities()
}

onMounted(loadEntities)
</script>

<template>
  <h1 class="h4 mb-3">Entidades bancarias</h1>

  <div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
      <form class="row g-2 align-items-end" @submit.prevent="handleCreate">
        <div class="col-8">
          <label class="form-label" for="entity-name">Nombre</label>
          <input
            id="entity-name"
            v-model="name"
            type="text"
            class="form-control"
            placeholder="BAC, Banco Nacional…"
            required
          />
        </div>
        <div class="col-4">
          <button type="submit" class="btn btn-primary w-100">Agregar</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="loading" class="text-muted">Cargando…</div>
  <div v-else-if="entities.length === 0" class="text-muted">Aún no hay entidades agregadas.</div>
  <ul v-else class="list-group">
    <li
      v-for="entity in entities"
      :key="entity.id"
      class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <template v-if="editingId === entity.id">
        <input v-model="editName" type="text" class="form-control form-control-sm flex-grow-1" />
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success" title="Guardar cambios" @click="saveEdit(entity.id)">
            <i class="bi bi-check-lg"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" title="Cancelar" @click="cancelEdit">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </template>
      <template v-else>
        <span class="fw-semibold"><i class="bi bi-bank me-2"></i>{{ entity.name }}</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" title="Editar entidad" @click="startEdit(entity)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Eliminar entidad" @click="handleDelete(entity.id)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>
    </li>
  </ul>
</template>

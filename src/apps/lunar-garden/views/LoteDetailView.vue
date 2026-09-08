<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteLote, getLote, updateLote } from '@/apps/lunar-garden/services/lotes'
import { createRegistro, deleteRegistro, getRegistros, updateRegistro } from '@/apps/lunar-garden/services/registros'
import RegistroForm from '@/apps/lunar-garden/components/RegistroForm.vue'
import { formatDate, parseDateInput, toDateInputValue } from '@/apps/lunar-garden/utils/dates'
import { CATEGORIES } from '@/apps/lunar-garden/utils/registroSuggestion'

const route = useRoute()
const router = useRouter()
const lotId = route.params.id

const lote = ref(null)
const registros = ref([])
const loading = ref(true)
const serverError = ref('')

const editingLote = ref(false)
const editName = ref('')
const editNotes = ref('')

const editingRegistroId = ref(null)
const editProducto = ref('')
const editRegistroNotes = ref('')
const editNextDate = ref('')

async function loadAll() {
  loading.value = true
  const [loteResult, registrosResult] = await Promise.all([getLote(lotId), getRegistros(lotId)])
  lote.value = loteResult
  registros.value = registrosResult
  loading.value = false
}

async function handleSubmit(payload) {
  serverError.value = ''
  try {
    await createRegistro(lotId, payload)
    await loadAll()
  } catch (err) {
    serverError.value = err.message
  }
}

async function handleDeleteRegistro(recordId) {
  if (!confirm('¿Eliminar este registro?')) return
  await deleteRegistro(lotId, recordId)
  await loadAll()
}

function startEditRegistro(registro) {
  editingRegistroId.value = registro.id
  editProducto.value = registro.producto
  editRegistroNotes.value = registro.notes ?? ''
  editNextDate.value = toDateInputValue(registro.nextDate)
}

function cancelEditRegistro() {
  editingRegistroId.value = null
}

async function saveEditRegistro(recordId) {
  await updateRegistro(lotId, recordId, {
    producto: editProducto.value.trim(),
    notes: editRegistroNotes.value.trim(),
    nextDate: parseDateInput(editNextDate.value),
    nextDateMode: 'manual',
    intervalDays: null,
  })
  editingRegistroId.value = null
  await loadAll()
}

function startEditLote() {
  editName.value = lote.value.name
  editNotes.value = lote.value.notes ?? ''
  editingLote.value = true
}

function cancelEditLote() {
  editingLote.value = false
}

async function saveEditLote() {
  await updateLote(lotId, { name: editName.value.trim(), notes: editNotes.value.trim() })
  editingLote.value = false
  await loadAll()
}

async function handleDeleteLote() {
  if (!confirm(`¿Eliminar el lote "${lote.value.name}" y todo su historial de registros?`)) return
  await deleteLote(lotId)
  router.push({ name: 'lunar-lotes' })
}

function categoryLabel(category, subtype) {
  const label = CATEGORIES[category]?.label ?? category
  const subtypeLabel = CATEGORIES[category]?.subtypes.find((s) => s.value === subtype)?.label ?? subtype
  return `${label} · ${subtypeLabel}`
}

function isOverdue(registro) {
  const d = registro.nextDate?.toDate ? registro.nextDate.toDate() : new Date(registro.nextDate)
  return d < new Date(new Date().setHours(0, 0, 0, 0))
}

onMounted(loadAll)
</script>

<template>
  <div class="lote-detail-page">
    <div v-if="loading" class="text-muted">Cargando…</div>
    <template v-else-if="lote">
      <div v-if="editingLote" class="card shadow-sm border-0 mb-3">
        <div class="card-body">
          <form class="row g-2 align-items-end" @submit.prevent="saveEditLote">
            <div class="col-12 col-sm-6">
              <label class="form-label">Nombre</label>
              <input v-model="editName" type="text" class="form-control" required />
            </div>
            <div class="col-12 col-sm-6">
              <label class="form-label">Notas</label>
              <input v-model="editNotes" type="text" class="form-control" />
            </div>
            <div class="col-12 d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="cancelEditLote">
                Cancelar
              </button>
              <button type="submit" class="btn btn-sm btn-success">Guardar</button>
            </div>
          </form>
        </div>
      </div>
      <div v-else class="d-flex justify-content-between align-items-center mb-1">
        <h1 class="h4 mb-0 page-title"><i class="bi bi-geo-alt-fill me-2"></i>{{ lote.name }}</h1>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" title="Editar lote" @click="startEditLote">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Eliminar lote" @click="handleDeleteLote">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <p v-if="lote.notes" class="text-muted mb-3">{{ lote.notes }}</p>

      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
          <h2 class="h6 mb-3">Registrar aplicación</h2>
          <RegistroForm :server-error="serverError" @submit="handleSubmit" />
        </div>
      </div>

      <h2 class="h6 mb-2 page-title">Historial</h2>
      <div v-if="registros.length === 0" class="text-muted">Aún no hay registros.</div>
      <ul v-else class="list-group">
        <li v-for="registro in registros" :key="registro.id" class="list-group-item">
          <div v-if="editingRegistroId === registro.id" class="row g-2 align-items-end">
            <div class="col-12 col-sm-4">
              <label class="form-label small mb-1">Producto</label>
              <input v-model="editProducto" type="text" class="form-control form-control-sm" />
            </div>
            <div class="col-12 col-sm-4">
              <label class="form-label small mb-1">Notas</label>
              <input v-model="editRegistroNotes" type="text" class="form-control form-control-sm" />
            </div>
            <div class="col-8 col-sm-3">
              <label class="form-label small mb-1">Próxima fecha</label>
              <input v-model="editNextDate" type="date" class="form-control form-control-sm" />
            </div>
            <div class="col-4 col-sm-1 d-flex gap-2">
              <button class="btn btn-sm btn-success" title="Guardar" @click="saveEditRegistro(registro.id)">
                <i class="bi bi-check-lg"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary" title="Cancelar" @click="cancelEditRegistro">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div v-else class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <div>
                <span class="badge text-bg-secondary me-2">{{ categoryLabel(registro.category, registro.subtype) }}</span>
                <span class="fw-semibold">{{ registro.producto }}</span>
              </div>
              <div class="text-muted small">Aplicado: {{ formatDate(registro.appliedDate) }}</div>
              <div class="small" :class="isOverdue(registro) ? 'text-danger fw-semibold' : 'text-muted'">
                Próxima: {{ formatDate(registro.nextDate) }}
                <span v-if="isOverdue(registro)">(vencido)</span>
              </div>
              <div v-if="registro.notes" class="text-muted small">{{ registro.notes }}</div>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-sm btn-outline-secondary"
                title="Editar registro"
                @click="startEditRegistro(registro)"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                title="Eliminar registro"
                @click="handleDeleteRegistro(registro.id)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </template>
    <div v-else class="alert alert-danger">No se encontró el lote.</div>
  </div>
</template>

<style scoped>
.lote-detail-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.page-title {
  color: #f8fafc;
}
</style>

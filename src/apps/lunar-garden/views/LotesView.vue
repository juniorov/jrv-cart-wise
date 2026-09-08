<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { createLote, deleteLote, getLotes, updateLote } from '@/apps/lunar-garden/services/lotes'
import LoteForm from '@/apps/lunar-garden/components/LoteForm.vue'
import { formatDate } from '@/apps/lunar-garden/utils/dates'

const lotes = ref([])
const loading = ref(true)
const editingId = ref(null)
const editName = ref('')
const editNotes = ref('')

const dueSoon = computed(() =>
  lotes.value
    .filter((l) => l.nextDueDate)
    .sort((a, b) => {
      const aDate = a.nextDueDate?.toDate ? a.nextDueDate.toDate() : new Date(a.nextDueDate)
      const bDate = b.nextDueDate?.toDate ? b.nextDueDate.toDate() : new Date(b.nextDueDate)
      return aDate - bDate
    }),
)

function categoryLabel(nextDueCategory) {
  const [category, subtype] = (nextDueCategory ?? '').split(':')
  const label = category === 'fumigacion' ? 'Fumigación' : 'Fertilización'
  return `${label} · ${subtype}`
}

function isOverdue(lote) {
  const d = lote.nextDueDate?.toDate ? lote.nextDueDate.toDate() : new Date(lote.nextDueDate)
  return d < new Date(new Date().setHours(0, 0, 0, 0))
}

async function loadLotes() {
  loading.value = true
  lotes.value = await getLotes()
  loading.value = false
}

async function handleCreate({ name, notes }) {
  await createLote({ name, notes })
  await loadLotes()
}

function startEdit(lote) {
  editingId.value = lote.id
  editName.value = lote.name
  editNotes.value = lote.notes ?? ''
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(lotId) {
  await updateLote(lotId, { name: editName.value.trim(), notes: editNotes.value.trim() })
  editingId.value = null
  await loadLotes()
}

async function handleDelete(lotId, name) {
  if (!confirm(`¿Eliminar el lote "${name}" y todo su historial de registros?`)) return
  await deleteLote(lotId)
  await loadLotes()
}

onMounted(loadLotes)
</script>

<template>
  <div class="lotes-page">
    <h1 class="h4 mb-3 page-title">🧪 Registros de fumigación/fertilización</h1>

    <div v-if="!loading && dueSoon.length > 0" class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h2 class="h6 mb-3">Próximos vencimientos</h2>
        <ul class="list-group list-group-flush">
          <li
            v-for="lote in dueSoon"
            :key="lote.id"
            class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
          >
            <RouterLink :to="`/lunar-garden/lotes/${lote.id}`" class="fw-semibold">
              {{ lote.name }}
            </RouterLink>
            <div class="text-end">
              <span class="badge text-bg-secondary me-2">{{ categoryLabel(lote.nextDueCategory) }}</span>
              <span :class="isOverdue(lote) ? 'text-danger fw-semibold' : 'text-muted'">
                {{ formatDate(lote.nextDueDate) }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h2 class="h6 mb-3">Nuevo lote</h2>
        <LoteForm @submit="handleCreate" />
      </div>
    </div>

    <div v-if="loading" class="text-muted">Cargando…</div>
    <div v-else-if="lotes.length === 0" class="text-muted">Aún no hay lotes agregados.</div>
    <ul v-else class="list-group">
      <li
        v-for="lote in lotes"
        :key="lote.id"
        class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <template v-if="editingId === lote.id">
          <div class="d-flex flex-column flex-grow-1 gap-2">
            <input v-model="editName" type="text" class="form-control form-control-sm" />
            <input v-model="editNotes" type="text" class="form-control form-control-sm" placeholder="Notas" />
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-success" title="Guardar cambios" @click="saveEdit(lote.id)">
              <i class="bi bi-check-lg"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" title="Cancelar" @click="cancelEdit">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </template>
        <template v-else>
          <RouterLink :to="`/lunar-garden/lotes/${lote.id}`" class="flex-grow-1">
            <span class="fw-semibold"><i class="bi bi-geo-alt-fill me-2"></i>{{ lote.name }}</span>
            <div v-if="lote.notes" class="text-muted small">{{ lote.notes }}</div>
          </RouterLink>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" title="Editar lote" @click="startEdit(lote)">
              <i class="bi bi-pencil"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              title="Eliminar lote"
              @click="handleDelete(lote.id, lote.name)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lotes-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.page-title {
  color: #f8fafc;
}
</style>

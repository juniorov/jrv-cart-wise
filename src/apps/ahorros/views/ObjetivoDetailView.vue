<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addGoalMovement,
  deleteGoal,
  getGoal,
  getGoalMovements,
  updateGoal,
} from '@/apps/ahorros/services/objetivos'
import MovementForm from '@/apps/ahorros/components/MovementForm.vue'
import ShareGoalPanel from '@/apps/ahorros/components/ShareGoalPanel.vue'
import { CURRENCIES, formatMoney } from '@/apps/ahorros/utils/currency'
import { computeGoalTotal, computePersonSubtotals, extractDistinctPersonas } from '@/apps/ahorros/utils/persons'
import { formatDate } from '@/apps/ahorros/utils/dates'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const goalId = route.params.id

const goal = ref(null)
const movements = ref([])
const loading = ref(true)
const serverError = ref('')

const currencyOptions = Object.entries(CURRENCIES).map(([code, cfg]) => ({ code, ...cfg }))
const editingGoal = ref(false)
const editName = ref('')
const editTargetAmount = ref(null)
const editCurrency = ref('CRC')
const editGoalError = ref('')

const isOwner = computed(() => goal.value?.ownerId === authStore.user?.uid)
const canEdit = computed(
  () => isOwner.value || goal.value?.sharedWith?.[authStore.user?.uid] === 'editor',
)

const total = computed(() => computeGoalTotal(movements.value))
const personSubtotals = computed(() => computePersonSubtotals(movements.value))
const personaSuggestions = computed(() => extractDistinctPersonas(movements.value))
const progressPct = computed(() => {
  if (!goal.value?.targetAmount) return null
  return Math.min(100, Math.round((total.value / goal.value.targetAmount) * 100))
})

async function loadAll() {
  loading.value = true
  const [goalResult, movementsResult] = await Promise.all([getGoal(goalId), getGoalMovements(goalId)])
  goal.value = goalResult
  movements.value = movementsResult
  loading.value = false
}

async function handleSubmit(payload) {
  serverError.value = ''
  try {
    await addGoalMovement(goalId, payload)
    await loadAll()
  } catch (err) {
    serverError.value = err.message
  }
}

async function handleDelete() {
  if (!confirm(`¿Eliminar el objetivo "${goal.value.name}" y todo su historial de aportes?`)) return
  await deleteGoal(goalId)
  router.push({ name: 'ahorros-objetivos' })
}

function startEditGoal() {
  editName.value = goal.value.name
  editTargetAmount.value = goal.value.targetAmount
  editCurrency.value = goal.value.currency
  editGoalError.value = ''
  editingGoal.value = true
}

function cancelEditGoal() {
  editingGoal.value = false
}

async function saveEditGoal() {
  editGoalError.value = ''
  if (!editName.value.trim()) {
    editGoalError.value = 'El nombre no puede estar vacío.'
    return
  }
  try {
    await updateGoal(goalId, {
      name: editName.value.trim(),
      targetAmount: editTargetAmount.value ? Number(editTargetAmount.value) : null,
      currency: editCurrency.value,
    })
    editingGoal.value = false
    await loadAll()
  } catch (err) {
    editGoalError.value = err.message
  }
}

onMounted(loadAll)
</script>

<template>
  <div v-if="loading" class="text-muted">Cargando…</div>
  <template v-else-if="goal">
    <div v-if="editingGoal" class="card shadow-sm border-0 mb-3">
      <div class="card-body">
        <form class="row g-2 align-items-end" @submit.prevent="saveEditGoal">
          <div class="col-12 col-sm-6">
            <label class="form-label" for="goal-edit-name">Nombre</label>
            <input id="goal-edit-name" v-model="editName" type="text" class="form-control" required />
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label" for="goal-edit-target">Meta (opcional)</label>
            <input
              id="goal-edit-target"
              v-model="editTargetAmount"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
            />
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label" for="goal-edit-currency">Moneda</label>
            <select id="goal-edit-currency" v-model="editCurrency" class="form-select">
              <option v-for="c in currencyOptions" :key="c.code" :value="c.code">{{ c.code }}</option>
            </select>
          </div>
          <div class="col-12 d-flex gap-2 justify-content-end">
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="cancelEditGoal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-sm btn-success">Guardar</button>
          </div>
          <div v-if="editGoalError" class="col-12">
            <div class="alert alert-danger py-2 mb-0">{{ editGoalError }}</div>
          </div>
        </form>
      </div>
    </div>
    <div v-else class="d-flex justify-content-between align-items-center mb-1">
      <h1 class="h4 mb-0"><i class="bi bi-flag-fill me-2"></i>{{ goal.name }}</h1>
      <div v-if="isOwner" class="d-flex gap-2">
        <button
          class="btn btn-sm btn-outline-secondary"
          title="Editar objetivo"
          @click="startEditGoal"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" title="Eliminar objetivo" @click="handleDelete">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body text-center">
        <div class="text-muted small">Total acumulado</div>
        <div class="display-6 fw-bold text-primary">{{ formatMoney(total, goal.currency) }}</div>
        <template v-if="goal.targetAmount">
          <div class="text-muted small mt-1">Meta: {{ formatMoney(goal.targetAmount, goal.currency) }}</div>
          <div class="progress mt-2" style="height: 0.5rem">
            <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="personSubtotals.length > 0" class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h2 class="h6 mb-3">Aportes por persona</h2>
        <ul class="list-group list-group-flush">
          <li
            v-for="entry in personSubtotals"
            :key="entry.persona"
            class="list-group-item d-flex justify-content-between px-0"
          >
            <span>{{ entry.persona }}</span>
            <span class="fw-semibold">{{ formatMoney(entry.total, goal.currency) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="canEdit" class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h2 class="h6 mb-3">Registrar aporte / retiro</h2>
        <MovementForm
          show-persona
          :show-overdraft="false"
          :persona-suggestions="personaSuggestions"
          :server-error="serverError"
          @submit="handleSubmit"
        />
      </div>
    </div>

    <ShareGoalPanel v-if="isOwner" :goal="goal" @changed="loadAll" />

    <h2 class="h6 mb-2">Historial</h2>
    <div v-if="movements.length === 0" class="text-muted">Aún no hay movimientos.</div>
    <ul v-else class="list-group">
      <li
        v-for="movement in movements"
        :key="movement.id"
        class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
      >
        <div>
          <div>
            <span
              class="badge me-2"
              :class="movement.type === 'ingreso' ? 'text-bg-success' : 'text-bg-danger'"
            >
              {{ movement.type === 'ingreso' ? 'Ingreso' : 'Egreso' }}
            </span>
            <span v-if="movement.persona" class="fw-semibold">{{ movement.persona }}</span>
            <span v-if="movement.description" class="text-muted"> — {{ movement.description }}</span>
          </div>
          <div class="text-muted small">{{ formatDate(movement.date) }}</div>
        </div>
        <div class="fw-semibold" :class="movement.type === 'ingreso' ? 'text-success' : 'text-danger'">
          {{ movement.type === 'ingreso' ? '+' : '-' }}{{ formatMoney(movement.amount, goal.currency) }}
        </div>
      </li>
    </ul>
  </template>
  <div v-else class="alert alert-danger">No se encontró el objetivo.</div>
</template>

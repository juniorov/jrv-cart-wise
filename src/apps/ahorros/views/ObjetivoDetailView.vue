<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addGoalMovement, deleteGoal, getGoal, getGoalMovements } from '@/apps/ahorros/services/objetivos'
import MovementForm from '@/apps/ahorros/components/MovementForm.vue'
import ShareGoalPanel from '@/apps/ahorros/components/ShareGoalPanel.vue'
import { formatMoney } from '@/apps/ahorros/utils/currency'
import { computeGoalTotal, computePersonSubtotals, extractDistinctPersonas } from '@/apps/ahorros/utils/persons'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const goalId = route.params.id

const goal = ref(null)
const movements = ref([])
const loading = ref(true)
const serverError = ref('')

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

function formatDate(value) {
  const d = value?.toDate ? value.toDate() : new Date(value)
  return d.toLocaleDateString('es-CR')
}

onMounted(loadAll)
</script>

<template>
  <div v-if="loading" class="text-muted">Cargando…</div>
  <template v-else-if="goal">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <h1 class="h4 mb-0"><i class="bi bi-flag-fill me-2"></i>{{ goal.name }}</h1>
      <button
        v-if="isOwner"
        class="btn btn-sm btn-outline-danger"
        title="Eliminar objetivo"
        @click="handleDelete"
      >
        <i class="bi bi-trash"></i>
      </button>
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

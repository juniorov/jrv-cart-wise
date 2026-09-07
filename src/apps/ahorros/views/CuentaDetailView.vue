<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getAccount } from '@/apps/ahorros/services/cuentas'
import { getEntities } from '@/apps/ahorros/services/entidades'
import { addAccountMovement, getAccountMovements } from '@/apps/ahorros/services/movimientos'
import { getGoalMovements, getGoals } from '@/apps/ahorros/services/objetivos'
import MovementForm from '@/apps/ahorros/components/MovementForm.vue'
import { formatMoney } from '@/apps/ahorros/utils/currency'
import { extractDistinctPersonas } from '@/apps/ahorros/utils/persons'

const route = useRoute()
const accountId = route.params.id

const account = ref(null)
const entity = ref(null)
const movements = ref([])
const goals = ref([])
const personaSuggestions = ref([])
const loading = ref(true)
const serverError = ref('')

async function loadAll() {
  loading.value = true
  const [accountResult, entities, movementsResult, goalsResult] = await Promise.all([
    getAccount(accountId),
    getEntities(),
    getAccountMovements(accountId),
    getGoals(),
  ])
  account.value = accountResult
  entity.value = entities.find((e) => e.id === accountResult?.entityId) ?? null
  movements.value = movementsResult
  goals.value = goalsResult
  loading.value = false
}

async function handleGoalChange(goalId) {
  personaSuggestions.value = goalId ? extractDistinctPersonas(await getGoalMovements(goalId)) : []
}

async function handleSubmit(payload) {
  serverError.value = ''
  try {
    await addAccountMovement(accountId, payload)
    await loadAll()
  } catch (err) {
    serverError.value = err.message
  }
}

function formatDate(value) {
  const d = value?.toDate ? value.toDate() : new Date(value)
  return d.toLocaleDateString('es-CR')
}

onMounted(loadAll)
</script>

<template>
  <div v-if="loading" class="text-muted">Cargando…</div>
  <template v-else-if="account">
    <h1 class="h4 mb-1">{{ account.name }}</h1>
    <p class="text-muted mb-3">
      {{ entity?.name ?? '—' }} · {{ account.currency }}
    </p>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body text-center">
        <div class="text-muted small">Saldo actual</div>
        <div class="display-6 fw-bold" :class="account.balance < 0 ? 'text-danger' : 'text-primary'">
          {{ formatMoney(account.balance ?? 0, account.currency) }}
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h2 class="h6 mb-3">Registrar movimiento</h2>
        <MovementForm
          :goals="goals"
          :persona-suggestions="personaSuggestions"
          :server-error="serverError"
          @submit="handleSubmit"
          @goal-change="handleGoalChange"
        />
      </div>
    </div>

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
            <span v-if="movement.description">{{ movement.description }}</span>
            <span v-else class="text-muted fst-italic">Sin descripción</span>
          </div>
          <div class="text-muted small">
            {{ formatDate(movement.date) }}
            <span v-if="movement.persona"> · {{ movement.persona }}</span>
            <span v-if="movement.goalId">
              ·
              <RouterLink :to="`/ahorros/objetivos/${movement.goalId}`">
                {{ goals.find((g) => g.id === movement.goalId)?.name ?? 'objetivo' }}
              </RouterLink>
            </span>
          </div>
        </div>
        <div class="fw-semibold" :class="movement.type === 'ingreso' ? 'text-success' : 'text-danger'">
          {{ movement.type === 'ingreso' ? '+' : '-' }}{{ formatMoney(movement.amount, account.currency) }}
        </div>
      </li>
    </ul>
  </template>
  <div v-else class="alert alert-danger">No se encontró la cuenta.</div>
</template>

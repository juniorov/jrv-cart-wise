<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { deleteActiveSession, finishSession, getActiveSession, updateSessionProgress } from '../services/sesiones'
import { formatElapsed } from '../utils/session'

const router = useRouter()

const session = ref(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const summary = ref(null)

const elapsedMs = ref(0)
let elapsedTimer = null

const resting = ref(false)
const restRemaining = ref(0)
let restTimer = null

const repsInput = ref(null)
const weightInput = ref(null)
const secondsInput = ref(null)

const totalSteps = computed(() => session.value?.steps.length ?? 0)
const isAllDone = computed(() => session.value && session.value.currentStepIndex >= totalSteps.value)
const currentStep = computed(() =>
  session.value && !isAllDone.value ? session.value.steps[session.value.currentStepIndex] : null,
)

function prefillFromHistory(step) {
  const steps = session.value.steps
  const currentIndex = session.value.currentStepIndex
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (steps[i].exerciseName === step.exerciseName && steps[i].done) {
      return { reps: steps[i].reps, weight: steps[i].weight, seconds: steps[i].seconds }
    }
  }
  return { reps: null, weight: null, seconds: null }
}

function loadInputsForCurrentStep() {
  if (!currentStep.value) return
  const prefill = prefillFromHistory(currentStep.value)
  repsInput.value = prefill.reps
  weightInput.value = prefill.weight
  secondsInput.value = prefill.seconds
}

function startElapsedTimer() {
  elapsedTimer = setInterval(() => {
    if (session.value) elapsedMs.value = Date.now() - session.value.startedAt
  }, 1000)
}

function startRest(seconds) {
  resting.value = true
  restRemaining.value = seconds
  restTimer = setInterval(() => {
    restRemaining.value -= 1
    if (restRemaining.value <= 0) skipRest()
  }, 1000)
}

function skipRest() {
  clearInterval(restTimer)
  resting.value = false
  restRemaining.value = 0
  loadInputsForCurrentStep()
}

async function completeStep() {
  const step = currentStep.value
  saving.value = true
  error.value = ''
  try {
    if (step.metric === 'time') {
      step.seconds = secondsInput.value
      step.weight = weightInput.value
    } else {
      step.reps = repsInput.value
      step.weight = weightInput.value
    }
    step.done = true
    session.value.currentStepIndex += 1

    await updateSessionProgress({ steps: session.value.steps, currentStepIndex: session.value.currentStepIndex })

    if (!isAllDone.value && step.restSeconds) {
      startRest(step.restSeconds)
    } else {
      loadInputsForCurrentStep()
    }
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function finish() {
  saving.value = true
  error.value = ''
  try {
    summary.value = await finishSession(session.value)
    session.value = null
    clearInterval(elapsedTimer)
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function abandonSession() {
  if (!confirm('¿Descartar este entrenamiento en progreso? No se guardará nada.')) return
  await deleteActiveSession()
  router.push({ name: 'gym-log-rutinas' })
}

onMounted(async () => {
  try {
    session.value = await getActiveSession()
    if (!session.value) {
      error.value = 'No hay ningún entrenamiento activo. Inícialo desde una rutina.'
    } else {
      elapsedMs.value = Date.now() - session.value.startedAt
      startElapsedTimer()
      loadInputsForCurrentStep()
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  clearInterval(elapsedTimer)
  clearInterval(restTimer)
})
</script>

<template>
  <div class="active-session-view">
    <div v-if="loading" class="text-muted">Cargando...</div>

    <div v-else-if="summary" class="summary-panel">
      <h1 class="h4 mb-3"><i class="bi bi-trophy-fill me-2"></i>¡Entrenamiento completado!</h1>
      <div class="stats-row mb-4">
        <div class="stat-card">
          <div class="stat-value">{{ formatElapsed(summary.durationMs) }}</div>
          <div class="stat-label">Duración</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ summary.totalVolume.toLocaleString('es-CR') }}</div>
          <div class="stat-label">Volumen (kg)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ summary.totalReps }}</div>
          <div class="stat-label">Reps totales</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <RouterLink :to="{ name: 'gym-log-entrenamientos' }" class="btn btn-primary">Ver historial</RouterLink>
        <RouterLink :to="{ name: 'gym-log-dashboard' }" class="btn btn-outline-secondary">Ir al progreso</RouterLink>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <div class="mt-2">
        <RouterLink :to="{ name: 'gym-log-rutinas' }" class="btn btn-sm btn-outline-secondary">Ir a Rutinas</RouterLink>
      </div>
    </div>

    <div v-else-if="session" class="session-active">
      <div class="session-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <div class="fw-semibold">{{ session.routineName }}</div>
          <div class="text-muted small" v-if="!isAllDone">
            Serie {{ session.currentStepIndex + 1 }} de {{ totalSteps }}
          </div>
        </div>
        <div class="elapsed-timer">{{ formatElapsed(elapsedMs) }}</div>
      </div>

      <div v-if="resting" class="rest-panel">
        <div class="rest-label">Descanso</div>
        <div class="rest-countdown">{{ restRemaining }}s</div>
        <button type="button" class="btn btn-outline-secondary" @click="skipRest">Saltar descanso</button>
      </div>

      <div v-else-if="isAllDone" class="finish-panel">
        <p class="text-muted">Completaste todas las series. ¡Buen trabajo!</p>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="finish">
          {{ saving ? 'Guardando...' : 'Finalizar rutina' }}
        </button>
      </div>

      <div v-else class="step-card">
        <div v-if="currentStep.supersetLabel" class="superset-badge">{{ currentStep.supersetLabel }}</div>
        <h2 class="h5">{{ currentStep.exerciseName }}</h2>
        <div class="text-muted mb-3">
          Serie {{ currentStep.setNumber }} · objetivo:
          {{ currentStep.metric === 'time' ? `${currentStep.targetSeconds ?? '—'}s` : (currentStep.targetReps || '—') }}
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">{{ currentStep.metric === 'time' ? 'Segundos' : 'Reps' }}</label>
            <input
              v-if="currentStep.metric === 'time'"
              v-model.number="secondsInput"
              type="number"
              min="0"
              class="form-control"
            />
            <input v-else v-model.number="repsInput" type="number" min="0" class="form-control" />
          </div>
          <div class="col-6">
            <label class="form-label">Peso (kg)</label>
            <input v-model.number="weightInput" type="number" min="0" step="0.5" class="form-control" />
          </div>
        </div>

        <button type="button" class="btn btn-primary w-100" :disabled="saving" @click="completeStep">
          <i class="bi bi-check-lg me-1"></i>Completar serie
        </button>
      </div>

      <button type="button" class="btn btn-link text-danger mt-4 p-0" @click="abandonSession">
        Descartar entrenamiento
      </button>
    </div>
  </div>
</template>

<style scoped>
.elapsed-timer {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
}

.step-card,
.rest-panel,
.finish-panel {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  text-align: center;
}

.step-card {
  text-align: left;
}

.superset-badge {
  display: inline-block;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-on-primary);
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  padding: 0.15rem 0.6rem;
  margin-bottom: 0.5rem;
}

.rest-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rest-countdown {
  font-size: 3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
  margin: 0.5rem 0 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  claimInvite,
  createGoal,
  getGoals,
  getPendingInvitesForMe,
  getSharedGoals,
} from '@/apps/ahorros/services/objetivos'
import { CURRENCIES, formatMoney } from '@/apps/ahorros/utils/currency'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const goals = ref([])
const sharedGoals = ref([])
const pendingInvites = ref([])
const loading = ref(true)
const name = ref('')
const targetAmount = ref(null)
const currency = ref('CRC')
const currencyOptions = Object.entries(CURRENCIES).map(([code, cfg]) => ({ code, ...cfg }))

async function loadGoals() {
  loading.value = true
  const [own, shared, invites] = await Promise.all([
    getGoals(),
    getSharedGoals(),
    getPendingInvitesForMe(),
  ])
  goals.value = own
  sharedGoals.value = shared
  pendingInvites.value = invites
  loading.value = false
}

async function handleAcceptInvite(goal) {
  const myEmail = authStore.user.email.toLowerCase()
  await claimInvite(goal.id, goal.pendingInvites[myEmail])
  await loadGoals()
}

async function handleCreate() {
  if (!name.value.trim()) return
  await createGoal({
    name: name.value.trim(),
    targetAmount: targetAmount.value ? Number(targetAmount.value) : null,
    currency: currency.value,
  })
  name.value = ''
  targetAmount.value = null
  await loadGoals()
}

onMounted(loadGoals)
</script>

<template>
  <h1 class="h4 mb-3">Objetivos de ahorro</h1>

  <div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
      <form class="row g-2 align-items-end" @submit.prevent="handleCreate">
        <div class="col-12 col-sm-5">
          <label class="form-label" for="goal-name">Nombre</label>
          <input
            id="goal-name"
            v-model="name"
            type="text"
            class="form-control"
            placeholder="Bocas del Toro…"
            required
          />
        </div>
        <div class="col-6 col-sm-3">
          <label class="form-label" for="goal-target">Meta (opcional)</label>
          <input id="goal-target" v-model="targetAmount" type="number" step="0.01" min="0" class="form-control" />
        </div>
        <div class="col-4 col-sm-2">
          <label class="form-label" for="goal-currency">Moneda</label>
          <select id="goal-currency" v-model="currency" class="form-select">
            <option v-for="c in currencyOptions" :key="c.code" :value="c.code">{{ c.code }}</option>
          </select>
        </div>
        <div class="col-2 col-sm-2">
          <button type="submit" class="btn btn-primary w-100">Crear</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="loading" class="text-muted">Cargando…</div>
  <template v-else>
    <div v-if="pendingInvites.length > 0" class="alert alert-warning">
      <div v-for="goal in pendingInvites" :key="goal.id" class="d-flex justify-content-between align-items-center">
        <span>Te invitaron a <strong>{{ goal.name }}</strong></span>
        <button class="btn btn-sm btn-primary" @click="handleAcceptInvite(goal)">Aceptar</button>
      </div>
    </div>

    <div v-if="goals.length === 0 && sharedGoals.length === 0" class="text-muted">
      Aún no hay objetivos creados.
    </div>
    <template v-else>
      <ul class="list-group mb-4">
        <li v-for="goal in goals" :key="goal.id" class="list-group-item">
          <RouterLink :to="`/ahorros/objetivos/${goal.id}`" class="text-decoration-none text-body">
            <div class="fw-semibold"><i class="bi bi-flag-fill me-2"></i>{{ goal.name }}</div>
            <div v-if="goal.targetAmount" class="text-muted small">
              Meta: {{ formatMoney(goal.targetAmount, goal.currency) }}
            </div>
          </RouterLink>
        </li>
      </ul>

      <template v-if="sharedGoals.length > 0">
        <h2 class="h6 mb-2">Compartidos conmigo</h2>
        <ul class="list-group">
          <li v-for="goal in sharedGoals" :key="goal.id" class="list-group-item">
            <RouterLink :to="`/ahorros/objetivos/${goal.id}`" class="text-decoration-none text-body">
              <div class="fw-semibold"><i class="bi bi-flag-fill me-2"></i>{{ goal.name }}</div>
              <div v-if="goal.targetAmount" class="text-muted small">
                Meta: {{ formatMoney(goal.targetAmount, goal.currency) }}
              </div>
            </RouterLink>
          </li>
        </ul>
      </template>
    </template>
  </template>
</template>

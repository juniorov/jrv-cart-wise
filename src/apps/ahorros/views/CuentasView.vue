<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { createAccount, deleteAccount, getAccounts } from '@/apps/ahorros/services/cuentas'
import { getEntities } from '@/apps/ahorros/services/entidades'
import { CURRENCIES, formatMoney } from '@/apps/ahorros/utils/currency'

const accounts = ref([])
const entities = ref([])
const loading = ref(true)
const name = ref('')
const entityId = ref('')
const currency = ref('CRC')

const entityById = computed(() => Object.fromEntries(entities.value.map((e) => [e.id, e])))
const currencyOptions = Object.entries(CURRENCIES).map(([code, cfg]) => ({ code, ...cfg }))

async function loadAll() {
  loading.value = true
  const [accountsResult, entitiesResult] = await Promise.all([getAccounts(), getEntities()])
  accounts.value = accountsResult
  entities.value = entitiesResult
  if (!entityId.value && entities.value.length > 0) entityId.value = entities.value[0].id
  loading.value = false
}

async function handleCreate() {
  if (!name.value.trim() || !entityId.value) return
  await createAccount({ name: name.value.trim(), entityId: entityId.value, currency: currency.value })
  name.value = ''
  await loadAll()
}

async function handleDelete(accountId) {
  if (!confirm('¿Eliminar esta cuenta y todo su historial de movimientos?')) return
  await deleteAccount(accountId)
  await loadAll()
}

onMounted(loadAll)
</script>

<template>
  <h1 class="h4 mb-3">Cuentas</h1>

  <div v-if="!loading && entities.length === 0" class="alert alert-warning">
    Primero agrega una <RouterLink to="/ahorros/entidades">entidad bancaria</RouterLink> para poder
    crear cuentas.
  </div>

  <div v-else class="card shadow-sm border-0 mb-4">
    <div class="card-body">
      <form class="row g-2 align-items-end" @submit.prevent="handleCreate">
        <div class="col-12 col-sm-5">
          <label class="form-label" for="account-name">Nombre</label>
          <input
            id="account-name"
            v-model="name"
            type="text"
            class="form-control"
            placeholder="Ahorros colones…"
            required
          />
        </div>
        <div class="col-6 col-sm-3">
          <label class="form-label" for="account-entity">Entidad</label>
          <select id="account-entity" v-model="entityId" class="form-select" required>
            <option v-for="entity in entities" :key="entity.id" :value="entity.id">
              {{ entity.name }}
            </option>
          </select>
        </div>
        <div class="col-4 col-sm-2">
          <label class="form-label" for="account-currency">Moneda</label>
          <select id="account-currency" v-model="currency" class="form-select">
            <option v-for="c in currencyOptions" :key="c.code" :value="c.code">{{ c.code }}</option>
          </select>
        </div>
        <div class="col-2 col-sm-2">
          <button type="submit" class="btn btn-primary w-100">Agregar</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="loading" class="text-muted">Cargando…</div>
  <div v-else-if="accounts.length === 0" class="text-muted">Aún no hay cuentas agregadas.</div>
  <ul v-else class="list-group">
    <li
      v-for="account in accounts"
      :key="account.id"
      class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <RouterLink :to="`/ahorros/cuentas/${account.id}`" class="text-decoration-none flex-grow-1">
        <div class="fw-semibold text-body">
          <i class="bi bi-wallet2 me-2"></i>{{ account.name }}
          <span class="badge text-bg-light ms-2">{{ entityById[account.entityId]?.name ?? '—' }}</span>
          <span class="badge text-bg-light ms-1">{{ account.currency }}</span>
        </div>
        <div class="text-muted small">{{ formatMoney(account.balance ?? 0, account.currency) }}</div>
      </RouterLink>
      <button
        class="btn btn-sm btn-outline-danger"
        title="Eliminar cuenta"
        @click="handleDelete(account.id)"
      >
        <i class="bi bi-trash"></i>
      </button>
    </li>
  </ul>
</template>

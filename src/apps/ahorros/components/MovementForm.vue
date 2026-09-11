<script setup>
import { ref } from 'vue'
import PersonaAutocomplete from '@/apps/ahorros/components/PersonaAutocomplete.vue'
import { parseDateInput, todayInputValue } from '@/apps/ahorros/utils/dates'

const props = defineProps({
  goals: { type: Array, default: () => [] },
  personaSuggestions: { type: Array, default: () => [] },
  submitLabel: { type: String, default: 'Agregar' },
  serverError: { type: String, default: '' },
  // Cuando el form vive dentro de un objetivo (sin selector de objetivo), la persona siempre
  // aplica; cuando vive en una cuenta, solo aplica si el movimiento se vincula a un objetivo.
  showPersona: { type: Boolean, default: false },
  showOverdraft: { type: Boolean, default: true },
  // Cuentas propias (misma moneda, sin incluir la actual) disponibles como destino de transferencia.
  // Si viene vacío, no se ofrece la opción "Transferencia".
  transferAccounts: { type: Array, default: () => [] },
})
const emit = defineEmits(['submit', 'goal-change'])

const type = ref('ingreso')
const amount = ref(null)
const description = ref('')
const date = ref(todayInputValue())
const goalId = ref('')
const persona = ref('')
const toAccountId = ref('')
const allowOverdraft = ref(false)
const error = ref('')

function handleGoalChange() {
  emit('goal-change', goalId.value || null)
  if (!goalId.value) persona.value = ''
}

function handleSubmit() {
  error.value = ''
  if (!amount.value || amount.value <= 0) {
    error.value = 'El monto debe ser mayor a cero.'
    return
  }
  if (type.value === 'transferencia' && !toAccountId.value) {
    error.value = 'Elegí la cuenta destino.'
    return
  }
  emit('submit', {
    type: type.value,
    amount: Number(amount.value),
    description: description.value.trim(),
    date: parseDateInput(date.value),
    goalId: type.value === 'transferencia' ? null : goalId.value || null,
    persona: type.value !== 'transferencia' && (goalId.value || props.showPersona) ? persona.value.trim() || null : null,
    toAccountId: type.value === 'transferencia' ? toAccountId.value : null,
    allowOverdraft: allowOverdraft.value,
  })
  amount.value = null
  description.value = ''
  persona.value = ''
  toAccountId.value = ''
  allowOverdraft.value = false
}
</script>

<template>
  <form class="row g-2 align-items-end" @submit.prevent="handleSubmit">
    <div class="col-6 col-sm-3">
      <label class="form-label" for="mv-type">Tipo</label>
      <select id="mv-type" v-model="type" class="form-select">
        <option value="ingreso">Ingreso</option>
        <option value="egreso">Egreso</option>
        <option v-if="transferAccounts.length > 0" value="transferencia">Transferencia</option>
      </select>
    </div>
    <div class="col-6 col-sm-3">
      <label class="form-label" for="mv-amount">Monto</label>
      <input
        id="mv-amount"
        v-model="amount"
        type="number"
        step="0.01"
        min="0"
        class="form-control"
        required
      />
    </div>
    <div class="col-12 col-sm-3">
      <label class="form-label" for="mv-date">Fecha</label>
      <input id="mv-date" v-model="date" type="date" class="form-control" required />
    </div>
    <div class="col-12 col-sm-3">
      <label class="form-label" for="mv-desc">Descripción</label>
      <input
        id="mv-desc"
        v-model="description"
        type="text"
        class="form-control"
        placeholder="¿De qué es este dinero?"
      />
    </div>

    <div v-if="type === 'transferencia'" class="col-12 col-sm-6">
      <label class="form-label" for="mv-to-account">Cuenta destino</label>
      <select id="mv-to-account" v-model="toAccountId" class="form-select" required>
        <option value="" disabled>Elegí una cuenta</option>
        <option v-for="acc in transferAccounts" :key="acc.id" :value="acc.id">{{ acc.label ?? acc.name }}</option>
      </select>
    </div>

    <template v-if="type !== 'transferencia' && goals.length > 0">
      <div class="col-12 col-sm-6">
        <label class="form-label" for="mv-goal">Vincular a objetivo (opcional)</label>
        <select id="mv-goal" v-model="goalId" class="form-select" @change="handleGoalChange">
          <option value="">Ninguno</option>
          <option v-for="goal in goals" :key="goal.id" :value="goal.id">{{ goal.name }}</option>
        </select>
      </div>
    </template>
    <div v-if="type !== 'transferencia' && (showPersona || goalId)" class="col-12 col-sm-6">
      <label class="form-label" for="mv-persona">Persona</label>
      <PersonaAutocomplete id="mv-persona" v-model="persona" :suggestions="personaSuggestions" />
    </div>

    <div v-if="showOverdraft" class="col-12 col-sm-6">
      <div class="form-check">
        <input id="mv-overdraft" v-model="allowOverdraft" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="mv-overdraft">Permitir descubierto (saldo negativo)</label>
      </div>
    </div>
    <div class="col-12 col-sm-6 text-sm-end">
      <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
    </div>

    <div v-if="error || serverError" class="col-12">
      <div class="alert alert-danger py-2 mb-0">{{ error || serverError }}</div>
    </div>
  </form>
</template>

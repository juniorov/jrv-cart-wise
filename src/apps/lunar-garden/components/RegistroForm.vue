<script setup>
import { computed, ref, watch } from 'vue'
import { addDaysToDate, parseDateInput, toDateInputValue, todayInputValue } from '../utils/dates'
import { CATEGORIES, suggestNextDate } from '../utils/registroSuggestion'
import { PHASE_GUIDE } from '../data/phaseGuide'

const props = defineProps({
  submitLabel: { type: String, default: 'Registrar' },
  serverError: { type: String, default: '' },
})
const emit = defineEmits(['submit'])

const category = ref('fumigacion')
const subtype = ref(CATEGORIES.fumigacion.subtypes[0].value)
const producto = ref('')
const notes = ref('')
const appliedDate = ref(todayInputValue())
const nextDateMode = ref('lunar')
const manualNextDate = ref(todayInputValue())
const intervalDays = ref(15)
const error = ref('')

const subtypeOptions = computed(() => CATEGORIES[category.value].subtypes)

const suggestion = computed(() =>
  suggestNextDate(category.value, subtype.value, parseDateInput(appliedDate.value)),
)

watch([category, subtype, appliedDate], () => {
  const options = subtypeOptions.value.map((s) => s.value)
  if (!options.includes(subtype.value)) subtype.value = options[0]
})

const computedNextDate = computed(() => {
  if (nextDateMode.value === 'lunar') return suggestion.value?.suggestedDate ?? null
  if (nextDateMode.value === 'interval') {
    return addDaysToDate(parseDateInput(appliedDate.value), Number(intervalDays.value) || 0)
  }
  return parseDateInput(manualNextDate.value)
})

function handleSubmit() {
  error.value = ''
  if (!producto.value.trim()) {
    error.value = 'Indica qué producto se aplicó.'
    return
  }
  if (!computedNextDate.value) {
    error.value = 'No se pudo determinar la próxima fecha. Elige "Fecha manual" o "Repetir cada N días".'
    return
  }
  emit('submit', {
    category: category.value,
    subtype: subtype.value,
    producto: producto.value.trim(),
    notes: notes.value.trim(),
    appliedDate: parseDateInput(appliedDate.value),
    nextDate: computedNextDate.value,
    nextDateMode: nextDateMode.value,
    intervalDays: nextDateMode.value === 'interval' ? Number(intervalDays.value) : null,
  })
  producto.value = ''
  notes.value = ''
}
</script>

<template>
  <form class="row g-2 align-items-end" @submit.prevent="handleSubmit">
    <div class="col-6 col-sm-3">
      <label class="form-label" for="reg-category">Categoría</label>
      <select id="reg-category" v-model="category" class="form-select">
        <option v-for="(cfg, key) in CATEGORIES" :key="key" :value="key">{{ cfg.label }}</option>
      </select>
    </div>
    <div class="col-6 col-sm-3">
      <label class="form-label" for="reg-subtype">Tipo</label>
      <select id="reg-subtype" v-model="subtype" class="form-select">
        <option v-for="opt in subtypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    <div class="col-12 col-sm-3">
      <label class="form-label" for="reg-producto">Producto</label>
      <input id="reg-producto" v-model="producto" type="text" class="form-control" placeholder="Nombre del producto" required />
    </div>
    <div class="col-12 col-sm-3">
      <label class="form-label" for="reg-applied">Fecha aplicada</label>
      <input id="reg-applied" v-model="appliedDate" type="date" class="form-control" required />
    </div>

    <div class="col-12">
      <label class="form-label" for="reg-notes">Notas (opcional)</label>
      <input id="reg-notes" v-model="notes" type="text" class="form-control" />
    </div>

    <div class="col-12">
      <label class="form-label d-block">Próxima fecha</label>
      <div class="btn-group w-100" role="group">
        <input id="mode-lunar" v-model="nextDateMode" type="radio" class="btn-check" value="lunar" />
        <label class="btn btn-outline-primary btn-sm" for="mode-lunar">Sugerencia lunar</label>

        <input id="mode-manual" v-model="nextDateMode" type="radio" class="btn-check" value="manual" />
        <label class="btn btn-outline-primary btn-sm" for="mode-manual">Fecha manual</label>

        <input id="mode-interval" v-model="nextDateMode" type="radio" class="btn-check" value="interval" />
        <label class="btn btn-outline-primary btn-sm" for="mode-interval">Cada N días</label>
      </div>
    </div>

    <div v-if="nextDateMode === 'lunar'" class="col-12">
      <div v-if="suggestion" class="alert alert-secondary py-2 mb-0">
        {{ PHASE_GUIDE[suggestion.phaseType].emoji }} {{ PHASE_GUIDE[suggestion.phaseType].label }} —
        {{ toDateInputValue(suggestion.suggestedDate) }}
      </div>
      <div v-else class="alert alert-warning py-2 mb-0">
        No se encontró una ventana lunar próxima para esta combinación. Elige otro modo.
      </div>
    </div>
    <div v-else-if="nextDateMode === 'manual'" class="col-12 col-sm-6">
      <input v-model="manualNextDate" type="date" class="form-control" />
    </div>
    <div v-else class="col-12 col-sm-6">
      <div class="input-group">
        <input v-model="intervalDays" type="number" min="1" class="form-control" />
        <span class="input-group-text">días después</span>
      </div>
    </div>

    <div class="col-12 text-sm-end">
      <button type="submit" class="btn btn-primary">{{ props.submitLabel }}</button>
    </div>

    <div v-if="error || serverError" class="col-12">
      <div class="alert alert-danger py-2 mb-0">{{ error || serverError }}</div>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  submitLabel: { type: String, default: 'Agregar' },
})
const emit = defineEmits(['submit'])

const name = ref('')
const notes = ref('')

function handleSubmit() {
  if (!name.value.trim()) return
  emit('submit', { name: name.value.trim(), notes: notes.value.trim() })
  name.value = ''
  notes.value = ''
}
</script>

<template>
  <form class="row g-2 align-items-end" @submit.prevent="handleSubmit">
    <div class="col-12 col-sm-5">
      <label class="form-label" for="lote-name">Nombre del lote</label>
      <input
        id="lote-name"
        v-model="name"
        type="text"
        class="form-control"
        placeholder="Lote Norte, Patio trasero…"
        required
      />
    </div>
    <div class="col-12 col-sm-5">
      <label class="form-label" for="lote-notes">Notas (opcional)</label>
      <input id="lote-notes" v-model="notes" type="text" class="form-control" placeholder="Ubicación, cultivo…" />
    </div>
    <div class="col-12 col-sm-2">
      <button type="submit" class="btn btn-primary w-100">{{ props.submitLabel }}</button>
    </div>
  </form>
</template>

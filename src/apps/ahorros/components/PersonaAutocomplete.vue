<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="form-control"
    list="ahorros-persona-suggestions"
    type="text"
    :value="modelValue"
    placeholder="Nombre (opcional)"
    @input="$emit('update:modelValue', $event.target.value)"
  />
  <datalist id="ahorros-persona-suggestions">
    <option v-for="name in suggestions" :key="name" :value="name" />
  </datalist>
</template>

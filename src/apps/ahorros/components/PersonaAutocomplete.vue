<script setup>
import { computed, ref } from 'vue'

// El id/placeholder/etc. que pasa el padre deben ir al <input> interno, no al <div> contenedor.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

// Se usa un dropdown propio en vez de <datalist>: en varios navegadores (sobre todo Chrome en
// Android) el datalist nativo vuelve a mostrar la lista justo después de seleccionar una opción,
// porque no hay forma de controlar cuándo se abre/cierra. Aquí se cierra explícitamente al elegir.
const isOpen = ref(false)

const filtered = computed(() => {
  const term = props.modelValue.trim().toLowerCase()
  if (!term) return props.suggestions
  const matches = props.suggestions.filter((s) => s.toLowerCase().includes(term))
  // Si ya coincide exacto con la única sugerencia, no tiene sentido volver a mostrarla.
  if (matches.length === 1 && matches[0].toLowerCase() === term) return []
  return matches
})

function handleInput(event) {
  emit('update:modelValue', event.target.value)
  isOpen.value = true
}

function select(name) {
  emit('update:modelValue', name)
  isOpen.value = false
}
</script>

<template>
  <div class="position-relative">
    <input
      v-bind="$attrs"
      class="form-control"
      type="text"
      autocomplete="off"
      :value="modelValue"
      placeholder="Nombre (opcional)"
      @input="handleInput"
      @focus="isOpen = true"
      @blur="isOpen = false"
    />
    <ul
      v-if="isOpen && filtered.length > 0"
      class="list-group position-absolute w-100 shadow-sm persona-suggestions"
    >
      <li
        v-for="name in filtered"
        :key="name"
        class="list-group-item list-group-item-action py-1"
        @mousedown.prevent="select(name)"
      >
        {{ name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.persona-suggestions {
  z-index: 20;
  max-height: 12rem;
  overflow-y: auto;
}
</style>

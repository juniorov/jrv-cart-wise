<script setup>
import { computed, ref } from 'vue'
import { formatMonthLabel, getMonthGrid, todayInputValue } from '../utils/dates'

const props = defineProps({
  /** Set de fechas "YYYY-MM-DD" con entrenamiento registrado. */
  markedDays: { type: Set, required: true },
})

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const weeks = computed(() => getMonthGrid(viewYear.value, viewMonth.value))
const monthLabel = computed(() => formatMonthLabel(viewYear.value, viewMonth.value))
const todayValue = todayInputValue()

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

function dayNumber(cell) {
  return Number(cell.slice(-2))
}
</script>

<template>
  <div class="month-calendar">
    <div class="calendar-header">
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="prevMonth">
        <i class="bi bi-chevron-left"></i>
      </button>
      <span class="month-label text-capitalize">{{ monthLabel }}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="nextMonth">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <div class="weekday-row">
      <span v-for="d in ['D', 'L', 'M', 'M', 'J', 'V', 'S']" :key="d">{{ d }}</span>
    </div>

    <div v-for="(week, wi) in weeks" :key="wi" class="week-row">
      <div
        v-for="(cell, ci) in week"
        :key="ci"
        class="day-cell"
        :class="{
          'day-empty': !cell,
          'day-marked': cell && markedDays.has(cell),
          'day-today': cell === todayValue,
        }"
      >
        <span v-if="cell">{{ dayNumber(cell) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.month-calendar {
  max-width: 360px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.month-label {
  font-weight: 600;
}

.weekday-row,
.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday-row {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.day-empty {
  border-color: transparent;
  background: transparent;
}

.day-marked {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
  font-weight: 600;
}

.day-today:not(.day-marked) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}
</style>

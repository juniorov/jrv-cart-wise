<script setup>
import { computed } from 'vue'
import { daysUntilYearEnd, getPhaseWindows } from '../utils/moonPhase.js'
import { GENERAL_TIPS, PHASE_GUIDE } from '../data/phaseGuide.js'

const today = new Date()
// Lo que resta del año actual (mínimo 35 días para que siempre haya algo que mostrar).
const daysAhead = Math.max(daysUntilYearEnd(today), 35)
const windows = computed(() => getPhaseWindows(today, daysAhead))

const dateFormatter = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short' })

function formatRange(from, to) {
  return `${dateFormatter.format(from)} – ${dateFormatter.format(to)}`
}
</script>

<template>
  <div class="calendar-page">
    <p class="calendar-intro">
      Ventanas de ±3 días alrededor de cada luna nueva, cuarto creciente, luna llena y cuarto
      menguante, para lo que resta de {{ today.getFullYear() }}.
    </p>

    <div class="windows-grid">
      <div
        v-for="(window, index) in windows"
        :key="index"
        class="window-card"
        :style="{ '--phase-color': PHASE_GUIDE[window.type].color }"
      >
        <div class="window-header">
          <span class="phase-emoji">{{ PHASE_GUIDE[window.type].emoji }}</span>
          <div>
            <div class="phase-label">{{ PHASE_GUIDE[window.type].label }}</div>
            <div class="range-label">{{ formatRange(window.from, window.to) }}</div>
          </div>
        </div>
        <ul class="activity-list">
          <li v-for="item in PHASE_GUIDE[window.type].recommended" :key="item.text">
            <i :class="['bi', item.icon]"></i>
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="tips-card">
      <h3 class="tips-title"><i class="bi bi-lightbulb-fill"></i> Tips generales</h3>
      <ul class="tips-list">
        <li v-for="tip in GENERAL_TIPS" :key="tip">{{ tip }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.calendar-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.calendar-intro {
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1.25rem;
}

.windows-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .windows-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .windows-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.window-card {
  background: #1e293b;
  border-radius: 0.85rem;
  padding: 1.1rem 1.25rem;
  border-left: 4px solid var(--phase-color, #6366f1);
}

.window-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.phase-emoji {
  font-size: 1.8rem;
  line-height: 1;
  flex-shrink: 0;
}

.phase-label {
  font-weight: 700;
  color: #f8fafc;
  font-size: 0.95rem;
}

.range-label {
  color: #94a3b8;
  font-size: 0.82rem;
  text-transform: capitalize;
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #e2e8f0;
}

.activity-list i {
  color: var(--phase-color, #6366f1);
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.tips-card {
  margin-top: 1.25rem;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.85rem;
  padding: 1.1rem 1.25rem;
}

.tips-title {
  font-size: 0.9rem;
  color: #e2e8f0;
  margin: 0 0 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tips-title i {
  color: #a5b4fc;
}

.tips-list {
  margin: 0;
  padding-left: 1.1rem;
  color: #cbd5e1;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
</style>

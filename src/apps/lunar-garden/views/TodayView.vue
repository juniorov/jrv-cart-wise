<script setup>
import { computed } from 'vue'
import {
  daysUntilYearEnd,
  getActiveWindow,
  getIllumination,
  getNextWindow,
  getPhaseDisplay,
  getPhaseWindows,
} from '../utils/moonPhase.js'
import { GENERAL_TIPS, PHASE_GUIDE } from '../data/phaseGuide.js'

const today = new Date()
const display = getPhaseDisplay(today)
const illumination = getIllumination(today)

// Ventanas para lo que resta del año (o al menos 35 días si ya estamos a fin de diciembre).
const windows = getPhaseWindows(today, Math.max(daysUntilYearEnd(today), 35))
const activeWindow = computed(() => getActiveWindow(today, windows))
const nextWindow = computed(() => getNextWindow(today, windows))

const dateFormatter = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'long' })

function formatRange(from, to) {
  return `${dateFormatter.format(from)} – ${dateFormatter.format(to)}`
}

function daysUntil(date) {
  return Math.round((date.getTime() - today.getTime()) / 86400000)
}

const dayOfYear = Math.floor(
  (today - new Date(today.getFullYear(), 0, 0)) / 86400000,
)
const tipOfTheDay = GENERAL_TIPS[dayOfYear % GENERAL_TIPS.length]

const formattedDate = today.toLocaleDateString('es-CR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
</script>

<template>
  <div class="today-card">
    <p class="today-date text-capitalize">{{ formattedDate }}</p>
    <div class="moon-emoji">{{ display.emoji }}</div>
    <h1 class="phase-name">{{ display.name }}</h1>
    <p class="illumination">{{ illumination }}% de iluminación</p>

    <div v-if="activeWindow" class="guide-card" :style="{ '--phase-color': PHASE_GUIDE[activeWindow.type].color }">
      <div class="window-badge">Ventana activa · {{ formatRange(activeWindow.from, activeWindow.to) }}</div>
      <h2 class="guide-title">{{ PHASE_GUIDE[activeWindow.type].emoji }} {{ PHASE_GUIDE[activeWindow.type].label }}</h2>
      <p class="guide-summary">{{ PHASE_GUIDE[activeWindow.type].summary }}</p>

      <h3 class="section-label">Se recomienda</h3>
      <ul class="activity-list">
        <li v-for="item in PHASE_GUIDE[activeWindow.type].recommended" :key="item.text">
          <i :class="['bi', item.icon]"></i>
          <span>{{ item.text }}</span>
        </li>
      </ul>

      <template v-if="PHASE_GUIDE[activeWindow.type].avoid.length">
        <h3 class="section-label section-label--avoid">Evitar</h3>
        <ul class="activity-list activity-list--avoid">
          <li v-for="item in PHASE_GUIDE[activeWindow.type].avoid" :key="item.text">
            <i :class="['bi', item.icon]"></i>
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </template>
    </div>

    <div v-else-if="nextWindow" class="guide-card guide-card--empty">
      <p class="empty-text">Hoy no cae dentro de ninguna ventana de ±3 días.</p>
      <p class="empty-next">
        Próxima ventana en <strong>{{ daysUntil(nextWindow.from) }} día(s)</strong>:
        {{ PHASE_GUIDE[nextWindow.type].emoji }} {{ PHASE_GUIDE[nextWindow.type].label }}
        ({{ formatRange(nextWindow.from, nextWindow.to) }})
      </p>
    </div>

    <div class="tip-card">
      <i class="bi bi-lightbulb-fill"></i>
      <span>{{ tipOfTheDay }}</span>
    </div>
  </div>
</template>

<style scoped>
.today-card {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
  text-align: center;
  color: #e5e7eb;
}

.today-date {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.moon-emoji {
  font-size: 4.5rem;
  line-height: 1;
}

.phase-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0 0.25rem;
  color: #f8fafc;
}

.illumination {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.guide-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: left;
  border-top: 4px solid var(--phase-color, #6366f1);
}

.window-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--phase-color, #6366f1);
  margin-bottom: 0.5rem;
}

.guide-title {
  font-size: 1.15rem;
  margin: 0 0 0.5rem;
  color: #f8fafc;
}

.guide-summary {
  color: #cbd5e1;
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.section-label--avoid {
  margin-top: 1.25rem;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.activity-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: #e2e8f0;
}

.activity-list i {
  color: var(--phase-color, #6366f1);
  font-size: 1.1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.activity-list--avoid i {
  color: #f87171;
}

.guide-card--empty {
  text-align: center;
  border-top-color: #475569;
}

.empty-text {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.empty-next {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin: 0;
}

.tip-card {
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
  color: #cbd5e1;
  text-align: left;
}

.tip-card i {
  color: #a5b4fc;
  margin-top: 0.1rem;
  flex-shrink: 0;
}
</style>

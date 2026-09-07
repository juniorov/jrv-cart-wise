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

    <div class="table-wrapper">
      <table class="lunar-table">
        <thead>
          <tr>
            <th>Fase</th>
            <th>Fechas</th>
            <th>Qué hacer</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(window, index) in windows"
            :key="index"
            :style="{ '--phase-color': PHASE_GUIDE[window.type].color }"
          >
            <td class="phase-cell">
              <span class="phase-emoji">{{ PHASE_GUIDE[window.type].emoji }}</span>
              <span class="phase-label">{{ PHASE_GUIDE[window.type].label }}</span>
            </td>
            <td class="range-cell">{{ formatRange(window.from, window.to) }}</td>
            <td>
              <ul class="activity-list">
                <li v-for="item in PHASE_GUIDE[window.type].recommended" :key="item.text">
                  <i :class="['bi', item.icon]"></i>
                  <span>{{ item.text }}</span>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.calendar-intro {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 0.85rem;
  background: #1e293b;
}

.lunar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.lunar-table th {
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #334155;
  white-space: nowrap;
}

.lunar-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #334155;
  vertical-align: top;
}

.lunar-table tr:last-child td {
  border-bottom: none;
}

.lunar-table tr {
  border-left: 3px solid var(--phase-color, #6366f1);
}

.phase-cell {
  white-space: nowrap;
}

.phase-emoji {
  font-size: 1.3rem;
  margin-right: 0.4rem;
}

.phase-label {
  font-weight: 700;
  color: #f8fafc;
}

.range-cell {
  white-space: nowrap;
  color: #94a3b8;
  text-transform: capitalize;
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 260px;
}

.activity-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
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
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
</style>

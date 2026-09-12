<script setup>
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { weeklyVolumeSeries } from '../utils/progress'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

const props = defineProps({
  workouts: { type: Array, required: true },
})

const weekFormatter = new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short' })

const chartData = computed(() => {
  const series = weeklyVolumeSeries(props.workouts)
  return {
    labels: series.map((s) => weekFormatter.format(s.weekStart)),
    datasets: [
      {
        label: 'Volumen semanal (kg)',
        data: series.map((s) => s.volume),
        backgroundColor: '#dc2626',
        borderRadius: 4,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true },
  },
}
</script>

<template>
  <div class="progress-chart">
    <Bar v-if="workouts.length" :data="chartData" :options="chartOptions" />
    <p v-else class="text-muted mb-0">Registra un entrenamiento para ver tu progreso aquí.</p>
  </div>
</template>

<style scoped>
.progress-chart {
  position: relative;
  height: 260px;
}
</style>

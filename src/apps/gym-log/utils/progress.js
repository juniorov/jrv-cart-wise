import { parseDateInput } from './dates'

/**
 * Volumen de una sesión: suma de peso×reps de todos los sets de todos los ejercicios.
 * Los sets de ejercicios por tiempo (`{ seconds, weight }`, sin `reps`) no aportan volumen —
 * peso×segundos no es una unidad comparable con peso×repeticiones.
 */
export function workoutVolume(workout) {
  return (workout.exercises ?? []).reduce((total, exercise) => {
    const exerciseVolume = (exercise.sets ?? []).reduce(
      (sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0),
      0,
    )
    return total + exerciseVolume
  }, 0)
}

/** Lunes (a medianoche local) de la semana ISO que contiene `date`. */
function startOfWeek(date) {
  const d = new Date(date)
  const diff = (d.getDay() + 6) % 7 // domingo=0 -> 6, lunes=1 -> 0, ...
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Agrupa entrenamientos por semana (lunes de inicio) y suma su volumen, ordenado
 * cronológicamente. Pensado para alimentar un gráfico de línea/barras de progreso.
 */
export function weeklyVolumeSeries(workouts) {
  const totals = new Map()
  for (const workout of workouts) {
    const weekStart = startOfWeek(parseDateInput(workout.date))
    const key = weekStart.getTime()
    totals.set(key, (totals.get(key) ?? 0) + workoutVolume(workout))
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a - b)
    .map(([time, volume]) => ({ weekStart: new Date(time), volume }))
}

/** Set de fechas ("YYYY-MM-DD") con al menos un entrenamiento registrado, para marcar el calendario. */
export function workoutDaysSet(workouts) {
  return new Set(workouts.map((w) => w.date))
}

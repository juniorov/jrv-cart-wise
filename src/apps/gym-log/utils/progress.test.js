import { describe, expect, it } from 'vitest'
import { weeklyVolumeSeries, workoutDaysSet, workoutVolume } from './progress'

function workout(date, sets) {
  return { date, exercises: [{ name: 'Press banca', sets }] }
}

describe('workoutVolume', () => {
  it('suma peso×reps de todos los sets', () => {
    const w = workout('2026-08-10', [
      { weight: 60, reps: 8 },
      { weight: 60, reps: 6 },
    ])
    expect(workoutVolume(w)).toBe(60 * 8 + 60 * 6)
  })

  it('devuelve 0 si no hay ejercicios/sets', () => {
    expect(workoutVolume({ exercises: [] })).toBe(0)
  })

  it('ignora sets por tiempo (sin "reps") al calcular el volumen', () => {
    const w = {
      exercises: [
        { name: 'Press banca', sets: [{ weight: 60, reps: 8 }] },
        { name: 'Plancha', sets: [{ weight: 0, seconds: 40 }] },
      ],
    }
    expect(workoutVolume(w)).toBe(60 * 8)
  })
})

describe('weeklyVolumeSeries', () => {
  it('agrupa por semana (lunes de inicio) y suma el volumen, ordenado cronológicamente', () => {
    const workouts = [
      workout('2026-08-12', [{ weight: 50, reps: 10 }]), // miércoles
      workout('2026-08-10', [{ weight: 50, reps: 10 }]), // lunes (misma semana)
      workout('2026-08-20', [{ weight: 100, reps: 5 }]), // semana siguiente
    ]
    const series = weeklyVolumeSeries(workouts)
    expect(series).toHaveLength(2)
    expect(series[0].volume).toBe(1000)
    expect(series[1].volume).toBe(500)
    expect(series[0].weekStart.getTime()).toBeLessThan(series[1].weekStart.getTime())
  })
})

describe('workoutDaysSet', () => {
  it('devuelve un set con las fechas únicas de los entrenamientos', () => {
    const workouts = [workout('2026-08-10', []), workout('2026-08-12', []), workout('2026-08-10', [])]
    const days = workoutDaysSet(workouts)
    expect(days.size).toBe(2)
    expect(days.has('2026-08-10')).toBe(true)
    expect(days.has('2026-08-12')).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { benchedRoutines, effectiveWeeklyPlan, mondayFirstIndex, weekKey } from './weeklyPlan'

describe('mondayFirstIndex', () => {
  it('devuelve 0 para un lunes y 6 para un domingo', () => {
    expect(mondayFirstIndex(new Date(2026, 7, 10))).toBe(0) // lunes 10 ago 2026
    expect(mondayFirstIndex(new Date(2026, 7, 16))).toBe(6) // domingo 16 ago 2026
  })

  it('devuelve 2 para un miércoles', () => {
    expect(mondayFirstIndex(new Date(2026, 7, 12))).toBe(2)
  })
})

describe('weekKey', () => {
  it('devuelve el lunes de la semana para cualquier día de esa semana', () => {
    expect(weekKey(new Date(2026, 7, 10))).toBe('2026-08-10') // lunes
    expect(weekKey(new Date(2026, 7, 13))).toBe('2026-08-10') // jueves misma semana
    expect(weekKey(new Date(2026, 7, 16))).toBe('2026-08-10') // domingo misma semana
  })
})

describe('effectiveWeeklyPlan', () => {
  const template = { '0': 'r1', '1': 'r2' }

  it('usa la plantilla cuando no hay override para ese día', () => {
    const plan = effectiveWeeklyPlan(template, {})
    expect(plan[0]).toMatchObject({ label: 'Lunes', routineId: 'r1', isOverridden: false })
    expect(plan[2]).toMatchObject({ label: 'Miércoles', routineId: null, isOverridden: false })
  })

  it('el override tiene precedencia sobre la plantilla', () => {
    const plan = effectiveWeeklyPlan(template, { '0': 'r99' })
    expect(plan[0]).toMatchObject({ routineId: 'r99', isOverridden: true, templateRoutineId: 'r1' })
  })

  it('un override a null representa un descanso puntual', () => {
    const plan = effectiveWeeklyPlan(template, { '1': null })
    expect(plan[1]).toMatchObject({ routineId: null, isOverridden: true, templateRoutineId: 'r2' })
  })
})

describe('benchedRoutines', () => {
  const routines = [{ id: 'r1', name: 'A' }, { id: 'r2', name: 'B' }, { id: 'r3', name: 'C' }]

  it('excluye las rutinas asignadas a algún día y conserva el resto', () => {
    const template = { '0': 'r1', '3': 'r1', '5': null }
    expect(benchedRoutines(routines, template)).toEqual([
      { id: 'r2', name: 'B' },
      { id: 'r3', name: 'C' },
    ])
  })

  it('devuelve todas las rutinas si la plantilla está vacía', () => {
    expect(benchedRoutines(routines, {})).toEqual(routines)
  })
})

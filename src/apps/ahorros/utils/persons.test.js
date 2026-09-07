import { describe, expect, it } from 'vitest'
import { computeGoalTotal, computePersonSubtotals, extractDistinctPersonas } from './persons'

describe('extractDistinctPersonas', () => {
  it('deduplica nombres sin importar mayúsculas/espacios y ordena alfabéticamente', () => {
    const movements = [
      { persona: 'Tío Carlos' },
      { persona: '  tío carlos  ' },
      { persona: 'Ana' },
      { persona: null },
      { persona: '' },
    ]
    expect(extractDistinctPersonas(movements)).toEqual(['Ana', 'Tío Carlos'])
  })
})

describe('computePersonSubtotals', () => {
  it('neta ingresos y egresos por persona, sin afectar a las demás personas', () => {
    const movements = [
      { type: 'ingreso', amount: 500, persona: 'Ana' },
      { type: 'ingreso', amount: 300, persona: 'Beto' },
      { type: 'egreso', amount: 200, persona: 'Ana' },
    ]
    const result = computePersonSubtotals(movements)
    expect(result).toEqual([
      { persona: 'Ana', total: 300 },
      { persona: 'Beto', total: 300 },
    ])
  })

  it('ignora movimientos sin persona asignada', () => {
    const movements = [
      { type: 'ingreso', amount: 100, persona: null },
      { type: 'ingreso', amount: 50, persona: 'Ana' },
    ]
    expect(computePersonSubtotals(movements)).toEqual([{ persona: 'Ana', total: 50 }])
  })
})

describe('computeGoalTotal', () => {
  it('suma ingresos y resta egresos de todos los movimientos', () => {
    const movements = [
      { type: 'ingreso', amount: 500 },
      { type: 'egreso', amount: 100 },
      { type: 'ingreso', amount: 50, persona: 'Ana' },
    ]
    expect(computeGoalTotal(movements)).toBe(450)
  })
})

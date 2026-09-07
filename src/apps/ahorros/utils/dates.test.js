import { describe, expect, it } from 'vitest'
import { formatDate, parseDateInput, toDateInputValue } from './dates'

describe('parseDateInput', () => {
  it('interpreta el string como fecha LOCAL, no UTC (evita el corrimiento de un día)', () => {
    const d = parseDateInput('2026-08-14')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7) // agosto = índice 7
    expect(d.getDate()).toBe(14)
  })
})

describe('toDateInputValue', () => {
  it('convierte un Date de vuelta al mismo string, sin corrimiento', () => {
    const d = parseDateInput('2026-08-14')
    expect(toDateInputValue(d)).toBe('2026-08-14')
  })

  it('acepta un Timestamp de Firestore (objeto con toDate())', () => {
    const fakeTimestamp = { toDate: () => parseDateInput('2026-01-05') }
    expect(toDateInputValue(fakeTimestamp)).toBe('2026-01-05')
  })
})

describe('formatDate', () => {
  it('formatea la misma fecha que se parseó, sin restar un día', () => {
    const d = parseDateInput('2026-08-14')
    expect(formatDate(d)).toBe('14/8/2026')
  })
})

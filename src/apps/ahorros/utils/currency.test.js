import { describe, expect, it } from 'vitest'
import { formatMoney, convertToBase } from './currency'

describe('formatMoney', () => {
  it('formatea colones con símbolo ₡, coma de miles y punto decimal', () => {
    expect(formatMoney(1234567.5, 'CRC')).toBe('₡1,234,567.50')
  })

  it('formatea dólares con símbolo $, coma de miles y punto decimal', () => {
    expect(formatMoney(1234567.5, 'USD')).toBe('$1,234,567.50')
  })

  it('formatea dólares con el formato de Estados Unidos', () => {
    expect(formatMoney(10, 'USD')).toBe('$10.00')
  })

  it('lanza un error si la moneda no está soportada', () => {
    expect(() => formatMoney(10, 'EUR')).toThrow()
  })
})

describe('convertToBase', () => {
  it('devuelve el mismo monto si la moneda ya es la base', () => {
    expect(convertToBase(500, 'CRC', 'CRC', { USD: 520 })).toBe(500)
  })

  it('convierte usando la tasa provista', () => {
    expect(convertToBase(10, 'USD', 'CRC', { USD: 520 })).toBe(5200)
  })

  it('lanza un error si falta la tasa de cambio', () => {
    expect(() => convertToBase(10, 'USD', 'CRC', {})).toThrow()
  })
})

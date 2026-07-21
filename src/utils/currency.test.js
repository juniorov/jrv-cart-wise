import { describe, expect, it } from 'vitest'
import { formatPrice, toCrc } from './currency'

describe('formatPrice', () => {
  it('formatea colones con el formato de Costa Rica', () => {
    expect(formatPrice(1000, 'CRC')).toContain('1')
    expect(formatPrice(1000, 'CRC')).toContain('₡')
  })

  it('formatea dólares con el formato de Estados Unidos', () => {
    expect(formatPrice(10, 'USD')).toBe('$10.00')
  })

  it('lanza un error si la moneda no está soportada', () => {
    expect(() => formatPrice(10, 'EUR')).toThrow()
  })
})

describe('toCrc', () => {
  it('devuelve el mismo monto si ya está en colones', () => {
    expect(toCrc(500, 'CRC', 520)).toBe(500)
  })

  it('convierte dólares a colones usando el tipo de cambio', () => {
    expect(toCrc(10, 'USD', 520)).toBe(5200)
  })
})

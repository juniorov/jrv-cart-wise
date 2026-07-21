const FORMATTERS = {
  CRC: new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }),
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
}

// Igual que FORMATTERS pero con un decimal fijo, para el desglose de precio por unidad
// (ej. precio por gramo/mililitro), que suele ser un monto chico.
const DETAIL_FORMATTERS = {
  CRC: new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }),
}

export function formatPrice(amount, currency) {
  const formatter = FORMATTERS[currency]
  if (!formatter) throw new Error(`Moneda no soportada: ${currency}`)
  return formatter.format(amount)
}

export function formatDetailedPrice(amount, currency) {
  const formatter = DETAIL_FORMATTERS[currency]
  if (!formatter) throw new Error(`Moneda no soportada: ${currency}`)
  return formatter.format(amount)
}

/**
 * Convierte a colones (CRC) solo para efectos de comparar/ordenar precios.
 * El valor mostrado al usuario siempre debe usar el monto/moneda originales.
 */
export function toCrc(amount, currency, usdToCrc) {
  if (currency === 'CRC') return amount
  if (currency === 'USD') return amount * usdToCrc
  throw new Error(`Moneda no soportada: ${currency}`)
}

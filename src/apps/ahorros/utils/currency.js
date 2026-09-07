// Catálogo abierto de monedas: agregar una nueva no requiere tocar el resto del código.
export const CURRENCIES = {
  CRC: { symbol: '₡', locale: 'es-CR', name: 'Colones' },
  USD: { symbol: '$', locale: 'en-US', name: 'Dólares' },
}

const formatterCache = new Map()

function getFormatter(code) {
  const cfg = CURRENCIES[code]
  if (!cfg) throw new Error(`Moneda no soportada: ${code}`)
  if (!formatterCache.has(code)) {
    formatterCache.set(code, new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: code }))
  }
  return formatterCache.get(code)
}

export function formatMoney(amount, currency) {
  return getFormatter(currency).format(amount)
}

/**
 * Convierte a una moneda base usando tasas de cambio ingresadas manualmente por el usuario
 * (mapa { [currencyCode]: tasaHaciaBase }). Solo para totales/comparación entre objetivos con
 * cuentas en distinta moneda — el monto mostrado a nivel de movimiento siempre usa su moneda
 * original, nunca la convertida.
 */
export function convertToBase(amount, currency, baseCurrency, rates) {
  if (currency === baseCurrency) return amount
  const rate = rates?.[currency]
  if (rate == null) throw new Error(`Falta tipo de cambio ${currency} -> ${baseCurrency}`)
  return amount * rate
}

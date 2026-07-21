export const UNIT_TYPES = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
]

export function unitLabel(unit) {
  return UNIT_TYPES.find((u) => u.value === unit)?.label ?? unit
}

export function unitSuffix(unit) {
  return unit === 'kg' ? '/kg' : 'c/u'
}

export function packageQtyLabel(unit) {
  return unit === 'kg' ? 'Peso del paquete (kg)' : 'Cantidad de unidades'
}

/**
 * Calcula el precio detallado de una entrada de precio (por gramo si el producto se
 * vende por kg, por unidad si se vende por unidad), a partir de su `packageQty`.
 * Devuelve null si no hay `packageQty` registrado. Usa siempre el precio/moneda
 * originales de la entrada, nunca convertidos.
 */
export function detailedPrice(entry, unit) {
  if (!entry?.packageQty) return null

  if (unit === 'kg') {
    return { amount: entry.price / (entry.packageQty * 1000), currency: entry.currency, suffix: '/g' }
  }
  return { amount: entry.price / entry.packageQty, currency: entry.currency, suffix: '/unidad' }
}

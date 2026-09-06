export const UNIT_TYPES = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'litro', label: 'Litro' },
]

const UNIT_SUFFIXES = {
  kg: '/kg',
  litro: '/L',
  unidad: 'c/u',
}

const PACKAGE_QTY_LABELS = {
  kg: 'Peso del paquete (kg)',
  litro: 'Volumen del paquete (L)',
  unidad: 'Cantidad de unidades',
}

// Unidad de detalle (más pequeña) y factor de conversión desde la unidad base.
const DETAIL_UNITS = {
  kg: { factor: 1000, suffix: '/g' },
  litro: { factor: 1000, suffix: '/ml' },
  unidad: { factor: 1, suffix: '/unidad' },
}

const PACKAGE_QTY_SUFFIXES = {
  kg: 'kg',
  litro: 'L',
  unidad: 'unidades',
}

/**
 * Formatea la cantidad de un paquete para mostrar (ej. "3 kg", "1.5 L", "6 unidades").
 * Devuelve null si no hay `packageQty` registrado.
 */
export function packageQtyDisplay(packageQty, unit) {
  if (packageQty == null) return null
  return `${packageQty} ${PACKAGE_QTY_SUFFIXES[unit] ?? 'unidades'}`
}

export function unitLabel(unit) {
  return UNIT_TYPES.find((u) => u.value === unit)?.label ?? unit
}

export function unitSuffix(unit) {
  return UNIT_SUFFIXES[unit] ?? 'c/u'
}

export function packageQtyLabel(unit) {
  return PACKAGE_QTY_LABELS[unit] ?? 'Cantidad de unidades'
}

/**
 * Calcula el precio detallado de una entrada de precio (por gramo si el producto se
 * vende por kg, por mililitro si se vende por litro, por unidad si se vende por unidad),
 * a partir de su `packageQty`. Devuelve null si no hay `packageQty` registrado. Usa
 * siempre el precio/moneda originales de la entrada, nunca convertidos.
 */
export function detailedPrice(entry, unit) {
  if (!entry?.packageQty) return null

  const detailUnit = DETAIL_UNITS[unit] ?? DETAIL_UNITS.unidad
  return {
    amount: entry.price / (entry.packageQty * detailUnit.factor),
    currency: entry.currency,
    suffix: detailUnit.suffix,
  }
}

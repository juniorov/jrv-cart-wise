/**
 * Extrae los nombres distintos de persona usados en movimientos previos de un objetivo,
 * para alimentar el autocompletado (sin necesidad de una entidad "contacto" separada).
 */
export function extractDistinctPersonas(movements) {
  const seen = new Map()
  for (const movement of movements) {
    const raw = movement.persona?.trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    if (!seen.has(key)) seen.set(key, raw)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b))
}

/**
 * Calcula el subtotal neto (ingresos - egresos) por persona dentro de un objetivo. Un egreso
 * etiquetado con una persona resta únicamente del subtotal de ESA persona, no del total general
 * del objetivo — es la regla de negocio confirmada para "devolver" o "gastar" la plata de alguien
 * específico sin afectar los aportes de los demás.
 */
export function computePersonSubtotals(movements) {
  const totals = new Map()
  for (const movement of movements) {
    const key = movement.persona?.trim()
    if (!key) continue
    const delta = movement.type === 'ingreso' ? movement.amount : -movement.amount
    totals.set(key, (totals.get(key) ?? 0) + delta)
  }
  return [...totals.entries()]
    .map(([persona, total]) => ({ persona, total }))
    .sort((a, b) => b.total - a.total)
}

/** Suma neta de todos los movimientos del objetivo, con o sin persona asignada. */
export function computeGoalTotal(movements) {
  return movements.reduce(
    (sum, m) => sum + (m.type === 'ingreso' ? m.amount : -m.amount),
    0,
  )
}

import { toDateInputValue } from './dates'

export const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** Índice "lunes-primero" (0=Lunes..6=Domingo) del día de `date` (default: hoy). */
export function mondayFirstIndex(date = new Date()) {
  return (date.getDay() + 6) % 7
}

/** Fecha ("YYYY-MM-DD") del lunes de la semana de `date`, usada como clave de semana. */
export function weekKey(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - mondayFirstIndex(d))
  d.setHours(0, 0, 0, 0)
  return toDateInputValue(d)
}

/**
 * Combina la plantilla recurrente (`{ "0": routineId|null, ... "6": ... }`) con los overrides
 * vigentes de la semana actual (mismo shape, solo con las claves que están intercambiadas),
 * devolviendo las 7 filas del plan semanal en orden Lunes→Domingo.
 */
export function effectiveWeeklyPlan(templateAssignments, overrides) {
  return DAY_LABELS.map((label, index) => {
    const key = String(index)
    const isOverridden = Object.prototype.hasOwnProperty.call(overrides, key)
    return {
      dayIndex: index,
      label,
      routineId: isOverridden ? overrides[key] : (templateAssignments[key] ?? null),
      isOverridden,
      templateRoutineId: templateAssignments[key] ?? null,
    }
  })
}

/** Rutinas que no están asignadas a ningún día de la plantilla — disponibles para rotar. */
export function benchedRoutines(routines, templateAssignments) {
  const assignedIds = new Set(Object.values(templateAssignments).filter(Boolean))
  return routines.filter((routine) => !assignedIds.has(routine.id))
}

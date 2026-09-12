// Ayudas para trabajar con fechas de <input type="date"> sin el corrimiento de un día que
// causa parsear/formatear con UTC en vez de la zona horaria local (ej. "2026-08-14" en
// `new Date(...)` se interpreta como medianoche UTC, que en Costa Rica -UTC-6- cae la tarde
// del 13). Todo el código de Gym Log debe usar estas funciones en vez de Date/ISOString directo.
// (Copiado de src/apps/ahorros/utils/dates.js: las apps del suite son aisladas por convención y
// no comparten utils entre sí.)

function pad(n) {
  return String(n).padStart(2, '0')
}

/** Valor de hoy en formato "YYYY-MM-DD" según la fecha LOCAL del dispositivo. */
export function todayInputValue() {
  return toDateInputValue(new Date())
}

/** Convierte el string "YYYY-MM-DD" de un <input type="date"> a un Date a medianoche LOCAL. */
export function parseDateInput(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Convierte un Date/Timestamp de Firestore al string "YYYY-MM-DD" en hora LOCAL. */
export function toDateInputValue(value) {
  const d = value?.toDate ? value.toDate() : new Date(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Formatea un Date/Timestamp de Firestore para mostrar (ej. "14/8/2026"). */
export function formatDate(value) {
  const d = value?.toDate ? value.toDate() : new Date(value)
  return d.toLocaleDateString('es-CR')
}

/**
 * Genera la grilla de un mes para un calendario (semanas de 7 días, empezando en domingo),
 * rellenando con `null` los días fuera del mes para completar la primera y última semana.
 * `year`/`month` con `month` en base 0 (enero = 0), igual que `Date`.
 */
export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = firstDay.getDay()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toDateInputValue(new Date(year, month, day)))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** Nombre del mes + año para mostrar en el encabezado del calendario (ej. "agosto 2026"). */
export function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('es-CR', { month: 'long', year: 'numeric' })
}

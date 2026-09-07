const SYNODIC_MONTH_DAYS = 29.530588853
// Luna nueva conocida: 6 de enero de 2000, 18:14 UTC.
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0)
const DAY_MS = 86400000
const QUARTER_DAYS = SYNODIC_MONTH_DAYS / 4
const WINDOW_DAYS = 3 // "3 días antes y 3 días después" de cada luna

/** Edad de la luna en días (0 a ~29.53) para una fecha dada. */
export function getMoonAge(date) {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS
  let age = diffDays % SYNODIC_MONTH_DAYS
  if (age < 0) age += SYNODIC_MONTH_DAYS
  return age
}

/** Fracción del ciclo lunar (0 a 1, donde 0 y 1 son luna nueva, 0.5 es luna llena). */
export function getPhaseFraction(date) {
  return getMoonAge(date) / SYNODIC_MONTH_DAYS
}

/** Iluminación aproximada (0 a 100%). */
export function getIllumination(date) {
  const fraction = getPhaseFraction(date)
  return Math.round((1 - Math.cos(2 * Math.PI * fraction)) * 50)
}

const NAMED_PHASES = [
  { max: 0.0625, name: 'Luna Nueva', emoji: '🌑' },
  { max: 0.1875, name: 'Creciente Iluminante', emoji: '🌒' },
  { max: 0.3125, name: 'Cuarto Creciente', emoji: '🌓' },
  { max: 0.4375, name: 'Gibosa Creciente', emoji: '🌔' },
  { max: 0.5625, name: 'Luna Llena', emoji: '🌕' },
  { max: 0.6875, name: 'Gibosa Menguante', emoji: '🌖' },
  { max: 0.8125, name: 'Cuarto Menguante', emoji: '🌗' },
  { max: 0.9375, name: 'Menguante', emoji: '🌘' },
  { max: 1.0001, name: 'Luna Nueva', emoji: '🌑' },
]

/** Nombre y emoji de una de las 8 fases lunares clásicas (para mostrar la fase de hoy). */
export function getPhaseDisplay(date) {
  const fraction = getPhaseFraction(date)
  const match = NAMED_PHASES.find((p) => fraction < p.max)
  return match ?? NAMED_PHASES[0]
}

// Los 4 momentos exactos del ciclo y cuánto los separa de la luna nueva anterior.
const EVENT_OFFSETS = [
  { type: 'nueva', offsetDays: 0 },
  { type: 'creciente', offsetDays: QUARTER_DAYS }, // cuarto creciente exacto
  { type: 'llena', offsetDays: QUARTER_DAYS * 2 },
  { type: 'menguante', offsetDays: QUARTER_DAYS * 3 }, // cuarto menguante exacto
]

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS)
}

/**
 * Momentos exactos (luna nueva, cuarto creciente, luna llena, cuarto menguante) que
 * caen dentro de [startDate, endDate], con un margen extra para no perder ventanas
 * que empiezan/terminan justo en el borde del rango.
 */
export function getPhaseEvents(startDate, endDate) {
  const rangeStartDays = (startDate.getTime() - KNOWN_NEW_MOON) / DAY_MS - WINDOW_DAYS
  const rangeEndDays = (endDate.getTime() - KNOWN_NEW_MOON) / DAY_MS + WINDOW_DAYS

  const firstCycle = Math.floor(rangeStartDays / SYNODIC_MONTH_DAYS) - 1
  const lastCycle = Math.ceil(rangeEndDays / SYNODIC_MONTH_DAYS) + 1

  const events = []
  for (let cycle = firstCycle; cycle <= lastCycle; cycle += 1) {
    for (const { type, offsetDays } of EVENT_OFFSETS) {
      const totalDays = cycle * SYNODIC_MONTH_DAYS + offsetDays
      if (totalDays < rangeStartDays || totalDays > rangeEndDays) continue
      events.push({ type, date: new Date(KNOWN_NEW_MOON + totalDays * DAY_MS) })
    }
  }

  return events.sort((a, b) => a.date - b.date)
}

/**
 * Ventanas de ±3 días alrededor de cada momento lunar exacto, dentro de
 * [startDate, startDate + days]. Es el criterio tradicional de "3 días antes y
 * 3 días después" para sembrar, podar, fertilizar o fumigar según la luna.
 */
export function getPhaseWindows(startDate, days = 92) {
  const endDate = addDays(startDate, days)
  const events = getPhaseEvents(startDate, endDate)

  return events.map(({ type, date }) => ({
    type,
    exactDate: date,
    from: startOfDay(addDays(date, -WINDOW_DAYS)),
    to: startOfDay(addDays(date, WINDOW_DAYS)),
  }))
}

/** Ventana activa para una fecha dada (o null si cae en un hueco entre ventanas). */
export function getActiveWindow(date, windows) {
  const day = startOfDay(date).getTime()
  return windows.find((w) => day >= w.from.getTime() && day <= w.to.getTime()) ?? null
}

/** Próxima ventana que empieza en o después de la fecha dada. */
export function getNextWindow(date, windows) {
  const day = startOfDay(date).getTime()
  return windows.find((w) => w.from.getTime() >= day) ?? null
}

/** Días que faltan desde `date` hasta el 31 de diciembre de ese mismo año, inclusive. */
export function daysUntilYearEnd(date) {
  const yearEnd = new Date(date.getFullYear(), 11, 31)
  return Math.round((startOfDay(yearEnd).getTime() - startOfDay(date).getTime()) / DAY_MS) + 1
}

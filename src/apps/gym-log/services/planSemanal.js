import { deleteField, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { weekKey } from '../utils/weeklyPlan'

function currentUid() {
  const uid = useAuthStore().user?.uid
  if (!uid) throw new Error('No hay sesión activa')
  return uid
}

// Doc id = uid: una sola plantilla / un solo set de overrides por usuario.
function templateRef() {
  return doc(db, 'gym_log_weekly_plan', currentUid())
}

function overridesRef() {
  return doc(db, 'gym_log_week_overrides', currentUid())
}

export async function getWeeklyPlan() {
  const snapshot = await getDoc(templateRef())
  return snapshot.exists() ? (snapshot.data().assignments ?? {}) : {}
}

/** Asigna (o quita, con routineId=null) la rutina de un día en la plantilla recurrente. */
export async function setTemplateDay(dayIndex, routineId) {
  await setDoc(templateRef(), { assignments: { [String(dayIndex)]: routineId } }, { merge: true })
}

/** Overrides vigentes de la semana actual; si el doc quedó de una semana anterior, se ignora. */
export async function getWeekOverrides() {
  const snapshot = await getDoc(overridesRef())
  if (!snapshot.exists()) return {}
  const data = snapshot.data()
  return data.weekStart === weekKey() ? (data.overrides ?? {}) : {}
}

/** Intercambia la rutina de un día solo para la semana actual (no toca la plantilla). */
export async function setWeekOverride(dayIndex, routineId) {
  const currentWeek = weekKey()
  const snapshot = await getDoc(overridesRef())
  const isStale = !snapshot.exists() || snapshot.data().weekStart !== currentWeek
  const overrides = isStale ? {} : (snapshot.data().overrides ?? {})
  overrides[String(dayIndex)] = routineId
  await setDoc(overridesRef(), { weekStart: currentWeek, overrides })
}

/** Quita el intercambio de un día (vuelve a la plantilla esa semana). */
export async function clearWeekOverride(dayIndex) {
  const snapshot = await getDoc(overridesRef())
  if (!snapshot.exists() || snapshot.data().weekStart !== weekKey()) return
  // Dot-path con deleteField(): borra solo esa clave del mapa `overrides`, sin leer/reescribir
  // el resto (updateDoc, a diferencia de setDoc con merge, sí soporta este sentinel anidado).
  await updateDoc(overridesRef(), { [`overrides.${dayIndex}`]: deleteField() })
}

import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'
import { todayInputValue } from '../utils/dates'
import { buildStepsFromRoutine, sessionSummary } from '../utils/session'
import { logWorkout } from './entrenamientos'

function currentUid() {
  const uid = useAuthStore().user?.uid
  if (!uid) throw new Error('No hay sesión activa')
  return uid
}

// Doc id = uid: una sola sesión activa por usuario, sin necesitar query ni ownerId.
function activeSessionRef() {
  return doc(db, 'gym_log_active_sessions', currentUid())
}

export async function getActiveSession() {
  const snapshot = await getDoc(activeSessionRef())
  return snapshot.exists() ? snapshot.data() : null
}

/** Arranca una sesión activa a partir de una rutina, sobrescribiendo cualquier sesión previa. */
export async function startSession(routine) {
  const session = {
    routineId: routine.id,
    routineName: routine.name,
    startedAt: Date.now(),
    currentStepIndex: 0,
    steps: buildStepsFromRoutine(routine),
  }
  await setDoc(activeSessionRef(), session)
  return session
}

/** Persiste el progreso de la sesión activa (steps + índice actual) tal como los tiene la vista. */
export async function updateSessionProgress({ steps, currentStepIndex }) {
  await updateDoc(activeSessionRef(), { steps, currentStepIndex })
}

export async function deleteActiveSession() {
  await deleteDoc(activeSessionRef())
}

/**
 * Cierra la sesión activa: calcula el resumen, guarda el entrenamiento en el historial (mismo
 * `logWorkout` que usa el registro manual) y borra la sesión activa. Devuelve el resumen para
 * mostrarlo en la vista.
 */
export async function finishSession(session, finishedAt = Date.now()) {
  const summary = sessionSummary(session, finishedAt)
  await logWorkout({
    date: todayInputValue(),
    routineId: session.routineId,
    routineName: session.routineName,
    exercises: summary.exercises,
  })
  await deleteActiveSession()
  return summary
}

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

function currentUid() {
  const uid = useAuthStore().user?.uid
  if (!uid) throw new Error('No hay sesión activa')
  return uid
}

export async function getAccountMovements(accountId) {
  const movementsRef = collection(db, 'ahorros_accounts', accountId, 'movements')
  const snapshot = await getDocs(query(movementsRef, orderBy('date', 'desc')))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Registra un ingreso/egreso en una cuenta y actualiza su saldo de forma atómica.
 * Si viene `goalId`, además escribe un movimiento espejo en el objetivo (sin exponer
 * la cuenta a colaboradores: `accountId` solo queda visible en el documento privado
 * de la cuenta, el espejo del objetivo nunca lo incluye).
 *
 * Por defecto un egreso no puede dejar el saldo negativo; `allowOverdraft` lo permite
 * para el caso real de registrar el egreso antes que el ingreso correspondiente.
 */
export async function addAccountMovement(
  accountId,
  { type, amount, description, date, goalId = null, persona = null, allowOverdraft = false },
) {
  const uid = currentUid()
  const accountRef = doc(db, 'ahorros_accounts', accountId)
  const movementRef = doc(collection(accountRef, 'movements'))
  const goalMovementRef = goalId ? doc(collection(db, 'ahorros_goals', goalId, 'movements')) : null
  const delta = type === 'ingreso' ? amount : -amount

  await runTransaction(db, async (tx) => {
    const accountSnap = await tx.get(accountRef)
    if (!accountSnap.exists()) throw new Error('La cuenta no existe')
    const newBalance = (accountSnap.data().balance ?? 0) + delta
    if (newBalance < 0 && !allowOverdraft) {
      throw new Error('El egreso deja la cuenta en negativo. Marca "permitir descubierto" si es intencional.')
    }
    tx.update(accountRef, { balance: newBalance })
    tx.set(movementRef, {
      type,
      amount,
      description,
      date,
      goalId,
      persona,
      // Referencia al movimiento espejo del objetivo, para poder editarlo/borrarlo en conjunto.
      goalMovementId: goalId ? goalMovementRef?.id ?? null : null,
      createdAt: serverTimestamp(),
    })
  })

  if (goalId) {
    const batch = writeBatch(db)
    batch.set(goalMovementRef, {
      type,
      amount,
      description,
      date,
      persona,
      accountId,
      createdBy: uid,
      createdAt: serverTimestamp(),
    })
    await batch.commit()
  }

  return movementRef.id
}

/**
 * Edita un movimiento de cuenta ya registrado, recalculando el saldo de la cuenta de forma
 * atómica (se revierte el efecto del monto/tipo anterior y se aplica el nuevo). El objetivo al
 * que estaba vinculado (si aplica) no se puede cambiar desde aquí, solo el monto/tipo/fecha/
 * descripción/persona; si el movimiento tiene un espejo en un objetivo, se actualiza también.
 */
export async function updateAccountMovement(
  accountId,
  movementId,
  { type, amount, description, date, persona = null, allowOverdraft = false },
) {
  const accountRef = doc(db, 'ahorros_accounts', accountId)
  const movementRef = doc(accountRef, 'movements', movementId)
  let goalId = null
  let goalMovementId = null

  await runTransaction(db, async (tx) => {
    const accountSnap = await tx.get(accountRef)
    const movementSnap = await tx.get(movementRef)
    if (!accountSnap.exists()) throw new Error('La cuenta no existe')
    if (!movementSnap.exists()) throw new Error('El movimiento no existe')

    const oldMovement = movementSnap.data()
    const oldDelta = oldMovement.type === 'ingreso' ? oldMovement.amount : -oldMovement.amount
    const newDelta = type === 'ingreso' ? amount : -amount
    const newBalance = (accountSnap.data().balance ?? 0) - oldDelta + newDelta
    if (newBalance < 0 && !allowOverdraft) {
      throw new Error('El cambio deja la cuenta en negativo. Marca "permitir descubierto" si es intencional.')
    }

    goalId = oldMovement.goalId ?? null
    goalMovementId = oldMovement.goalMovementId ?? null

    tx.update(accountRef, { balance: newBalance })
    tx.update(movementRef, {
      type,
      amount,
      description,
      date,
      persona: goalId ? persona : null,
    })
  })

  if (goalId && goalMovementId) {
    await updateDoc(doc(db, 'ahorros_goals', goalId, 'movements', goalMovementId), {
      type,
      amount,
      description,
      date,
      persona,
    })
  }
}

/** Elimina un movimiento de cuenta, revirtiendo su efecto en el saldo y en el objetivo vinculado. */
export async function deleteAccountMovement(accountId, movementId) {
  const accountRef = doc(db, 'ahorros_accounts', accountId)
  const movementRef = doc(accountRef, 'movements', movementId)
  let goalId = null
  let goalMovementId = null

  await runTransaction(db, async (tx) => {
    const accountSnap = await tx.get(accountRef)
    const movementSnap = await tx.get(movementRef)
    if (!accountSnap.exists()) throw new Error('La cuenta no existe')
    if (!movementSnap.exists()) return

    const oldMovement = movementSnap.data()
    const oldDelta = oldMovement.type === 'ingreso' ? oldMovement.amount : -oldMovement.amount
    goalId = oldMovement.goalId ?? null
    goalMovementId = oldMovement.goalMovementId ?? null

    tx.update(accountRef, { balance: (accountSnap.data().balance ?? 0) - oldDelta })
    tx.delete(movementRef)
  })

  if (goalId && goalMovementId) {
    await deleteDoc(doc(db, 'ahorros_goals', goalId, 'movements', goalMovementId))
  }
}

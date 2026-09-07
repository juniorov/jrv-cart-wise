import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
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
      createdAt: serverTimestamp(),
    })
  })

  if (goalId) {
    const goalMovementRef = doc(collection(db, 'ahorros_goals', goalId, 'movements'))
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

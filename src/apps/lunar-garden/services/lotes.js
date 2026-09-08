import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

const lotsRef = collection(db, 'lunar_garden_lots')

function currentUid() {
  const uid = useAuthStore().user?.uid
  if (!uid) throw new Error('No hay sesión activa')
  return uid
}

// Se ordena en cliente (en vez de orderBy en la query) para no requerir un índice
// compuesto de Firestore por combinar where(ownerId) + orderBy(name).
export async function getLotes() {
  const uid = currentUid()
  const snapshot = await getDocs(query(lotsRef, where('ownerId', '==', uid)))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getLote(lotId) {
  const snapshot = await getDoc(doc(db, 'lunar_garden_lots', lotId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function createLote({ name, notes = '' }) {
  const uid = currentUid()
  const docRef = doc(lotsRef)
  await setDoc(docRef, {
    ownerId: uid,
    name,
    notes,
    nextDueDate: null,
    nextDueCategory: null,
    nextDueRecordId: null,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateLote(lotId, { name, notes }) {
  await updateDoc(doc(db, 'lunar_garden_lots', lotId), { name, notes })
}

/** Elimina el lote y todo su historial de registros. */
export async function deleteLote(lotId) {
  const recordsRef = collection(db, 'lunar_garden_lots', lotId, 'records')
  const recordsSnapshot = await getDocs(recordsRef)

  // writeBatch admite máximo 500 operaciones; se parte en lotes por si el historial crece mucho.
  const docs = recordsSnapshot.docs
  for (let i = 0; i < docs.length; i += 499) {
    const batch = writeBatch(db)
    docs.slice(i, i + 499).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }

  await deleteDoc(doc(db, 'lunar_garden_lots', lotId))
}

/**
 * Recalcula el cache `nextDue*` del lote a partir de sus registros: toma el registro con
 * `nextDate` más próxima (aunque ya esté vencida, para que siga apareciendo como pendiente).
 * Se llama después de crear/editar/borrar un registro para que la vista de "próximos
 * vencimientos" pueda listar todos los lotes con una sola query (sin collectionGroup).
 */
export async function recomputeLoteNextDue(lotId) {
  const recordsRef = collection(db, 'lunar_garden_lots', lotId, 'records')
  const snapshot = await getDocs(recordsRef)
  const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (records.length === 0) {
    await updateDoc(doc(db, 'lunar_garden_lots', lotId), {
      nextDueDate: null,
      nextDueCategory: null,
      nextDueRecordId: null,
    })
    return
  }

  const soonest = records.reduce((a, b) => {
    const aDate = a.nextDate?.toDate ? a.nextDate.toDate() : new Date(a.nextDate)
    const bDate = b.nextDate?.toDate ? b.nextDate.toDate() : new Date(b.nextDate)
    return bDate < aDate ? b : a
  })

  await updateDoc(doc(db, 'lunar_garden_lots', lotId), {
    nextDueDate: soonest.nextDate,
    nextDueCategory: `${soonest.category}:${soonest.subtype}`,
    nextDueRecordId: soonest.id,
  })
}

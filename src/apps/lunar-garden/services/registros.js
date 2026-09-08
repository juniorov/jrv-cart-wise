import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { recomputeLoteNextDue } from './lotes'

function recordsRef(lotId) {
  return collection(db, 'lunar_garden_lots', lotId, 'records')
}

export async function getRegistros(lotId) {
  const snapshot = await getDocs(query(recordsRef(lotId), orderBy('appliedDate', 'desc')))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createRegistro(lotId, payload) {
  const docRef = doc(recordsRef(lotId))
  await setDoc(docRef, { ...payload, createdAt: serverTimestamp() })
  await recomputeLoteNextDue(lotId)
  return docRef.id
}

export async function updateRegistro(lotId, recordId, payload) {
  await updateDoc(doc(db, 'lunar_garden_lots', lotId, 'records', recordId), payload)
  await recomputeLoteNextDue(lotId)
}

export async function deleteRegistro(lotId, recordId) {
  await deleteDoc(doc(db, 'lunar_garden_lots', lotId, 'records', recordId))
  await recomputeLoteNextDue(lotId)
}

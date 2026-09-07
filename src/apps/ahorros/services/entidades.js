import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

const entitiesRef = collection(db, 'ahorros_entities')

function currentUid() {
  const uid = useAuthStore().user?.uid
  if (!uid) throw new Error('No hay sesión activa')
  return uid
}

// Se ordena en cliente (en vez de orderBy en la query) para no requerir un índice compuesto
// de Firestore por combinar where(ownerId) + orderBy(name).
export async function getEntities() {
  const uid = currentUid()
  const snapshot = await getDocs(query(entitiesRef, where('ownerId', '==', uid)))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function createEntity({ name }) {
  const uid = currentUid()
  const docRef = doc(entitiesRef)
  await setDoc(docRef, {
    ownerId: uid,
    name,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateEntity(entityId, { name }) {
  await updateDoc(doc(db, 'ahorros_entities', entityId), { name })
}

export async function deleteEntity(entityId) {
  await deleteDoc(doc(db, 'ahorros_entities', entityId))
}

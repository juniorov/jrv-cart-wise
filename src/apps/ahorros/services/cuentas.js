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
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuthStore } from '@/stores/auth'

const accountsRef = collection(db, 'ahorros_accounts')

function currentUid() {
  const uid = useAuthStore().user?.uid
  if (!uid) throw new Error('No hay sesión activa')
  return uid
}

// Se ordena en cliente para no requerir un índice compuesto de Firestore.
export async function getAccounts() {
  const uid = currentUid()
  const snapshot = await getDocs(query(accountsRef, where('ownerId', '==', uid)))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getAccount(accountId) {
  const snapshot = await getDoc(doc(db, 'ahorros_accounts', accountId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function createAccount({ name, entityId, currency }) {
  const uid = currentUid()
  const docRef = doc(accountsRef)
  await setDoc(docRef, {
    ownerId: uid,
    entityId,
    name,
    currency,
    balance: 0,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateAccount(accountId, { name, entityId, currency }) {
  await updateDoc(doc(db, 'ahorros_accounts', accountId), { name, entityId, currency })
}

export async function deleteAccount(accountId) {
  await deleteDoc(doc(db, 'ahorros_accounts', accountId))
}

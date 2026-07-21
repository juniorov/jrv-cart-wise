import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'

const businessesRef = collection(db, 'businesses')

export async function getBusinesses() {
  const snapshot = await getDocs(query(businessesRef, orderBy('name')))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createBusiness({ name, type }) {
  const docRef = await addDoc(businessesRef, {
    name,
    type,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBusiness(businessId, { name, type }) {
  await updateDoc(doc(db, 'businesses', businessId), { name, type })
}

export async function deleteBusiness(businessId) {
  await deleteDoc(doc(db, 'businesses', businessId))
}

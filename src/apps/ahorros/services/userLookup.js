import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

/** Resuelve un email a su uid usando users_by_email (mantenida por src/stores/auth.js en cada login). */
export async function resolveUidByEmail(email) {
  const snapshot = await getDoc(doc(db, 'users_by_email', email.trim().toLowerCase()))
  return snapshot.exists() ? snapshot.data().uid : null
}

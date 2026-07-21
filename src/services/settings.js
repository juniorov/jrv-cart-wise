import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

const exchangeRateRef = doc(db, 'settings', 'exchangeRate')

export async function getExchangeRate() {
  const snapshot = await getDoc(exchangeRateRef)
  if (!snapshot.exists()) return null
  return snapshot.data()
}

export async function updateExchangeRate(usdToCrc) {
  await setDoc(exchangeRateRef, { usdToCrc, updatedAt: serverTimestamp() })
}

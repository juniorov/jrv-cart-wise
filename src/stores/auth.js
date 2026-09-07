import { defineStore } from 'pinia'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

// Mantiene users_by_email al día para que otras apps del suite (ej. ahorros) puedan resolver
// un email a un uid al invitar a alguien sin necesitar un backend propio.
function syncUserByEmail(user) {
  if (!user?.email) return
  setDoc(
    doc(db, 'users_by_email', user.email.toLowerCase()),
    { uid: user.uid, email: user.email, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    ready: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    init() {
      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.ready = true
        syncUserByEmail(user)
      })
    },
    async login(email, password) {
      await signInWithEmailAndPassword(auth, email, password)
    },
    async logout() {
      await signOut(auth)
    },
  },
})

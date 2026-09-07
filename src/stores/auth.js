import { defineStore } from 'pinia'
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth'
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
    /**
     * Cambia la contraseña del usuario actual. Firebase exige haber iniciado sesión
     * "recientemente" para operaciones sensibles, así que primero se reautentica con la
     * contraseña actual (evita tener que pedirle al usuario que vuelva a hacer login).
     */
    async changePassword(currentPassword, newPassword) {
      const credential = EmailAuthProvider.credential(this.user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPassword)
    },
  },
})

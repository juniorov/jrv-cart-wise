<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const ERROR_MESSAGES = {
  'auth/wrong-password': 'La contraseña actual no es correcta.',
  'auth/invalid-credential': 'La contraseña actual no es correcta.',
  'auth/weak-password': 'La nueva contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a intentar.',
}

async function handleSubmit() {
  error.value = ''
  success.value = false

  if (newPassword.value.length < 6) {
    error.value = 'La nueva contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Las contraseñas nuevas no coinciden.'
    return
  }

  loading.value = true
  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)
    success.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    error.value = ERROR_MESSAGES[err.code] ?? 'No se pudo cambiar la contraseña. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-sm-8 col-md-5 col-lg-4">
      <h1 class="h4 mb-3"><i class="bi bi-person-circle me-1"></i>Mi cuenta</h1>

      <div class="card shadow-sm border-0 mb-3">
        <div class="card-body">
          <div class="text-muted small">Correo</div>
          <div>{{ authStore.user?.email }}</div>
        </div>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-body">
          <h2 class="h6 mb-3">Cambiar contraseña</h2>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label" for="current-password">Contraseña actual</label>
              <input
                id="current-password"
                v-model="currentPassword"
                type="password"
                class="form-control"
                required
                autocomplete="current-password"
              />
            </div>
            <div class="mb-3">
              <label class="form-label" for="new-password">Nueva contraseña</label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                class="form-control"
                required
                minlength="6"
                autocomplete="new-password"
              />
            </div>
            <div class="mb-3">
              <label class="form-label" for="confirm-password">Confirmar nueva contraseña</label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                class="form-control"
                required
                minlength="6"
                autocomplete="new-password"
              />
            </div>
            <div v-if="error" class="alert alert-danger py-2" role="alert">{{ error }}</div>
            <div v-if="success" class="alert alert-success py-2" role="alert">
              Contraseña actualizada correctamente.
            </div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              {{ loading ? 'Guardando…' : 'Cambiar contraseña' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

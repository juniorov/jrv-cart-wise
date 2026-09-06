<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push(route.query.redirect || { path: '/' })
  } catch {
    error.value = 'Correo o contraseña incorrectos.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-sm-8 col-md-5 col-lg-4">
      <div class="card shadow-sm border-0">
        <div class="card-body p-4">
          <h1 class="h4 mb-4 text-center">
            <i class="bi bi-grid-3x3-gap-fill text-primary me-1"></i>JRV Tools
          </h1>
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label" for="email">Correo</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-control"
                required
                autocomplete="username"
              />
            </div>
            <div class="mb-3">
              <label class="form-label" for="password">Contraseña</label>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-control"
                required
                autocomplete="current-password"
              />
            </div>
            <div v-if="error" class="alert alert-danger py-2" role="alert">{{ error }}</div>
            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              {{ loading ? 'Ingresando…' : 'Ingresar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

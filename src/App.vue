<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark app-navbar sticky-top">
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-cart-check-fill me-1"></i>CartWise
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Abrir menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="mainNav" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" active-class="active">Buscar</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/cart" active-class="active">Carrito</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/products" active-class="active">Productos</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/businesses" active-class="active">Negocios</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/settings" active-class="active">Ajustes</RouterLink>
          </li>
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <button class="nav-link btn btn-link" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-1"></i>Salir
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container py-4">
    <RouterView />
  </main>
</template>

<style scoped>
.app-navbar {
  background-color: var(--color-primary);
}
</style>

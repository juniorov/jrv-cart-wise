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
        data-bs-toggle="offcanvas"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-label="Abrir menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        id="mainNav"
        class="offcanvas offcanvas-start offcanvas-md"
        tabindex="-1"
        aria-labelledby="mainNavLabel"
      >
        <div class="offcanvas-header">
          <h5 id="mainNavLabel" class="offcanvas-title">
            <i class="bi bi-cart-check-fill me-1"></i>CartWise
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Cerrar"
          ></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav ms-md-auto">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/" active-class="active" data-bs-dismiss="offcanvas">
                Buscar
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/cart"
                active-class="active"
                data-bs-dismiss="offcanvas"
              >
                Carrito
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/products"
                active-class="active"
                data-bs-dismiss="offcanvas"
              >
                Productos
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/businesses"
                active-class="active"
                data-bs-dismiss="offcanvas"
              >
                Negocios
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/settings"
                active-class="active"
                data-bs-dismiss="offcanvas"
              >
                Ajustes
              </RouterLink>
            </li>
            <li v-if="authStore.isAuthenticated" class="nav-item">
              <button class="nav-link btn btn-link" data-bs-dismiss="offcanvas" @click="handleLogout">
                <i class="bi bi-box-arrow-right me-1"></i>Salir
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

  <main class="container py-4" :class="{ 'pb-mobile-nav': authStore.isAuthenticated }">
    <RouterView />
  </main>

  <nav v-if="authStore.isAuthenticated" class="bottom-nav d-md-none">
    <RouterLink to="/" class="bottom-nav-item" active-class="active">
      <i class="bi bi-house-door-fill"></i>
      <span>Buscar</span>
    </RouterLink>
    <RouterLink to="/products" class="bottom-nav-item" active-class="active">
      <i class="bi bi-plus-circle-fill"></i>
      <span>Productos</span>
    </RouterLink>
    <RouterLink to="/businesses" class="bottom-nav-item" active-class="active">
      <i class="bi bi-building-fill"></i>
      <span>Negocios</span>
    </RouterLink>
    <RouterLink to="/cart" class="bottom-nav-item" active-class="active">
      <i class="bi bi-cart-fill"></i>
      <span>Carrito</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-navbar {
  background-color: var(--color-primary);
}

/* Por debajo de md, el offcanvas es un panel propio (no hereda el fondo oscuro
   del navbar), así que necesita su propio fondo oscuro para que el texto claro
   de .navbar-dark siga siendo legible. Desde md, Bootstrap lo vuelve transparente
   automáticamente (offcanvas-md) y hereda el fondo del navbar. */
#mainNav {
  --bs-offcanvas-bg: var(--color-primary);
  --bs-offcanvas-color: var(--color-on-primary);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  display: flex;
  height: 4rem;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-decoration: none;
}

.bottom-nav-item i {
  font-size: var(--font-size-lg);
}

.bottom-nav-item.active {
  color: var(--color-primary);
}

@media (max-width: 767.98px) {
  .pb-mobile-nav {
    padding-bottom: calc(4rem + env(safe-area-inset-bottom));
  }
}
</style>

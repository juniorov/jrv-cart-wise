<script setup>
import { Offcanvas } from 'bootstrap'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

function closeMenu() {
  const el = document.getElementById('cartWiseNav')
  const instance = el && Offcanvas.getInstance(el)
  instance?.hide()
}

async function handleLogout() {
  closeMenu()
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark app-navbar sticky-top">
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-bold" to="/cart-wise">
        <i class="bi bi-cart-check-fill me-1"></i>CartWise
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#cartWiseNav"
        aria-controls="cartWiseNav"
        aria-label="Abrir menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        id="cartWiseNav"
        class="offcanvas offcanvas-start offcanvas-md"
        tabindex="-1"
        aria-labelledby="cartWiseNavLabel"
      >
        <div class="offcanvas-header">
          <h5 id="cartWiseNavLabel" class="offcanvas-title">
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
              <RouterLink class="nav-link" to="/cart-wise" active-class="active" @click="closeMenu">
                Buscar
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/cart-wise/cart"
                active-class="active"
                @click="closeMenu"
              >
                Carrito
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/cart-wise/products"
                active-class="active"
                @click="closeMenu"
              >
                Productos
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/cart-wise/businesses"
                active-class="active"
                @click="closeMenu"
              >
                Negocios
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/cart-wise/settings"
                active-class="active"
                @click="closeMenu"
              >
                Ajustes
              </RouterLink>
            </li>
            <li v-if="authStore.isAuthenticated" class="nav-item">
              <button class="nav-link btn btn-link" @click="handleLogout">
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
    <RouterLink to="/cart-wise" class="bottom-nav-item" active-class="active">
      <i class="bi bi-house-door-fill"></i>
      <span>Buscar</span>
    </RouterLink>
    <RouterLink to="/cart-wise/products" class="bottom-nav-item" active-class="active">
      <i class="bi bi-plus-circle-fill"></i>
      <span>Productos</span>
    </RouterLink>
    <RouterLink to="/cart-wise/businesses" class="bottom-nav-item" active-class="active">
      <i class="bi bi-building-fill"></i>
      <span>Negocios</span>
    </RouterLink>
    <RouterLink to="/cart-wise/cart" class="bottom-nav-item" active-class="active">
      <i class="bi bi-cart-fill"></i>
      <span>Carrito</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-navbar {
  background-color: var(--color-primary);
  /* Se apila debajo del AppTopBar del suite (2.75rem), que también es sticky-top. */
  top: 2.75rem;
}

/* Por debajo de md, el offcanvas es un panel propio (no hereda el fondo oscuro
   del navbar), así que necesita su propio fondo oscuro para que el texto claro
   de .navbar-dark siga siendo legible. Desde md, Bootstrap lo vuelve transparente
   automáticamente (offcanvas-md) y hereda el fondo del navbar. */
#cartWiseNav {
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
    padding-bottom: calc(4rem + env(safe-area-inset-bottom)) !important;
  }
}
</style>

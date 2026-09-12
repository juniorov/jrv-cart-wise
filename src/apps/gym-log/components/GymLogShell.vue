<script setup>
import { Offcanvas } from 'bootstrap'
import { onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getActiveSession } from '../services/sesiones'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const activeSession = ref(null)

async function refreshActiveSession() {
  if (!authStore.isAuthenticated) return
  try {
    activeSession.value = await getActiveSession()
  } catch {
    activeSession.value = null
  }
}

onMounted(refreshActiveSession)
watch(() => route.name, refreshActiveSession)

function closeMenu() {
  const el = document.getElementById('gymLogNav')
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
      <RouterLink class="navbar-brand fw-bold" to="/gym-log">
        <i class="bi bi-activity me-1"></i>Gym Log
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#gymLogNav"
        aria-controls="gymLogNav"
        aria-label="Abrir menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        id="gymLogNav"
        class="offcanvas offcanvas-start offcanvas-md"
        tabindex="-1"
        aria-labelledby="gymLogNavLabel"
      >
        <div class="offcanvas-header">
          <h5 id="gymLogNavLabel" class="offcanvas-title">
            <i class="bi bi-activity me-1"></i>Gym Log
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
              <RouterLink class="nav-link" to="/gym-log" active-class="active" @click="closeMenu">
                Progreso
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/gym-log/rutinas"
                active-class="active"
                @click="closeMenu"
              >
                Rutinas
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/gym-log/plan-semanal"
                active-class="active"
                @click="closeMenu"
              >
                Plan semanal
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/gym-log/entrenamientos"
                active-class="active"
                @click="closeMenu"
              >
                Entrenamientos
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/gym-log/registrar"
                active-class="active"
                @click="closeMenu"
              >
                Registrar
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                to="/gym-log/cronometros"
                active-class="active"
                @click="closeMenu"
              >
                Cronómetros
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

  <main class="container py-4 pb-mobile-nav">
    <RouterLink
      v-if="activeSession && route.name !== 'gym-log-entrenar'"
      to="/gym-log/entrenar"
      class="active-session-banner"
    >
      <i class="bi bi-stopwatch-fill me-2"></i>
      Entrenamiento en progreso: {{ activeSession.routineName }} — continuar
    </RouterLink>
    <RouterView />
  </main>

  <nav class="bottom-nav d-md-none">
    <RouterLink to="/gym-log" class="bottom-nav-item" active-class="active">
      <i class="bi bi-graph-up"></i>
      <span>Progreso</span>
    </RouterLink>
    <RouterLink to="/gym-log/rutinas" class="bottom-nav-item" active-class="active">
      <i class="bi bi-card-checklist"></i>
      <span>Rutinas</span>
    </RouterLink>
    <RouterLink to="/gym-log/plan-semanal" class="bottom-nav-item" active-class="active">
      <i class="bi bi-calendar-week"></i>
      <span>Plan</span>
    </RouterLink>
    <RouterLink to="/gym-log/entrenamientos" class="bottom-nav-item" active-class="active">
      <i class="bi bi-clock-history"></i>
      <span>Historial</span>
    </RouterLink>
    <RouterLink to="/gym-log/registrar" class="bottom-nav-item" active-class="active">
      <i class="bi bi-plus-circle-fill"></i>
      <span>Registrar</span>
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
#gymLogNav {
  --bs-offcanvas-bg: var(--color-primary);
  --bs-offcanvas-color: var(--color-on-primary);
}

.active-session-banner {
  display: block;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-md);
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 600;
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

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import cartWiseRoutes from '@/apps/cart-wise/routes'
import globalExchangeRoutes from '@/apps/global-exchange/routes'
import calcInvoicesRoutes from '@/apps/calc-invoices/routes'
import lunarGardenRoutes from '@/apps/lunar-garden/routes'
import sprayMixRoutes from '@/apps/spray-mix/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/shared/views/HomeView.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/shared/views/LoginView.vue'),
      meta: { public: true },
    },
    cartWiseRoutes,
    globalExchangeRoutes,
    calcInvoicesRoutes,
    lunarGardenRoutes,
    sprayMixRoutes,
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.ready) {
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (authStore.ready) {
          unwatch()
          resolve()
        }
      })
    })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { path: '/' }
  }
})

export default router

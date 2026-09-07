export default {
  path: '/spray-mix',
  meta: { appSlug: 'spray-mix', requiresAuth: false },
  component: () => import('@/apps/spray-mix/components/SprayMixShell.vue'),
  children: [
    {
      path: '',
      name: 'spray-mix-calculator',
      component: () => import('@/apps/spray-mix/views/MixCalculatorView.vue'),
    },
    {
      path: 'productos',
      name: 'spray-mix-products',
      component: () => import('@/apps/spray-mix/views/ProductsView.vue'),
    },
  ],
}

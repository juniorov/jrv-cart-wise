export default {
  path: '/cart-wise',
  meta: { appSlug: 'cart-wise', requiresAuth: true },
  component: () => import('@/apps/cart-wise/components/CartWiseShell.vue'),
  children: [
    { path: '', name: 'search', component: () => import('@/apps/cart-wise/views/SearchView.vue') },
    { path: 'cart', name: 'cart', component: () => import('@/apps/cart-wise/views/CartView.vue') },
    {
      path: 'products',
      name: 'products',
      component: () => import('@/apps/cart-wise/views/ProductsView.vue'),
    },
    {
      path: 'businesses',
      name: 'businesses',
      component: () => import('@/apps/cart-wise/views/BusinessesView.vue'),
    },
    {
      path: 'settings',
      name: 'settings',
      component: () => import('@/apps/cart-wise/views/SettingsView.vue'),
    },
  ],
}

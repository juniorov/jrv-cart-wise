export default {
  path: '/global-exchange',
  name: 'global-exchange',
  meta: { appSlug: 'global-exchange', requiresAuth: false },
  component: () => import('@/apps/global-exchange/components/GlobalExchangeShell.vue'),
}

export default {
  path: '/lunar-garden',
  meta: { appSlug: 'lunar-garden', requiresAuth: true },
  component: () => import('@/apps/lunar-garden/components/LunarGardenShell.vue'),
  children: [
    {
      path: '',
      name: 'lunar-today',
      component: () => import('@/apps/lunar-garden/views/TodayView.vue'),
    },
    {
      path: 'calendario',
      name: 'lunar-calendar',
      component: () => import('@/apps/lunar-garden/views/CalendarView.vue'),
    },
    {
      path: 'lotes',
      name: 'lunar-lotes',
      component: () => import('@/apps/lunar-garden/views/LotesView.vue'),
    },
    {
      path: 'lotes/:id',
      name: 'lunar-lote-detail',
      component: () => import('@/apps/lunar-garden/views/LoteDetailView.vue'),
    },
  ],
}

export default {
  path: '/lunar-garden',
  meta: { appSlug: 'lunar-garden', requiresAuth: false },
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
  ],
}

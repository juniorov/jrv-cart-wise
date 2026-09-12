export default {
  path: '/gym-log',
  meta: { appSlug: 'gym-log', requiresAuth: true },
  component: () => import('@/apps/gym-log/components/GymLogShell.vue'),
  children: [
    {
      path: '',
      name: 'gym-log-dashboard',
      component: () => import('@/apps/gym-log/views/DashboardView.vue'),
    },
    {
      path: 'rutinas',
      name: 'gym-log-rutinas',
      component: () => import('@/apps/gym-log/views/RutinasView.vue'),
    },
    {
      path: 'rutinas/:id',
      name: 'gym-log-rutina-detail',
      component: () => import('@/apps/gym-log/views/RutinaDetailView.vue'),
    },
    {
      path: 'entrenamientos',
      name: 'gym-log-entrenamientos',
      component: () => import('@/apps/gym-log/views/EntrenamientosView.vue'),
    },
    {
      path: 'registrar',
      name: 'gym-log-registrar',
      component: () => import('@/apps/gym-log/views/RegistrarEntrenamientoView.vue'),
    },
    {
      path: 'entrenar',
      name: 'gym-log-entrenar',
      component: () => import('@/apps/gym-log/views/ActiveSessionView.vue'),
    },
    {
      path: 'plan-semanal',
      name: 'gym-log-plan-semanal',
      component: () => import('@/apps/gym-log/views/WeeklyPlanView.vue'),
    },
    {
      path: 'cronometros',
      name: 'gym-log-cronometros',
      component: () => import('@/apps/gym-log/views/TimersView.vue'),
    },
  ],
}

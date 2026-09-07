export default {
  path: '/calc-invoices',
  meta: { appSlug: 'calc-invoices', requiresAuth: false },
  component: () => import('@/apps/calc-invoices/components/CalcInvoicesShell.vue'),
  children: [
    {
      path: '',
      name: 'invoice-calculator',
      component: () => import('@/apps/calc-invoices/views/InvoiceCalculator.vue'),
    },
    {
      path: 'hours',
      name: 'hours-calculator',
      component: () => import('@/apps/calc-invoices/views/HoursCalculator.vue'),
    },
    {
      path: 'tip',
      name: 'tip-calculator',
      component: () => import('@/apps/calc-invoices/views/TipCalculator.vue'),
    },
  ],
}

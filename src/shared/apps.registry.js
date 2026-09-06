/**
 * Registro central de mini-apps del suite. Agregar una entrada aquí (y su router.js en
 * src/apps/<slug>/) es lo único necesario para que aparezca en el launcher.
 */
export const apps = [
  {
    slug: 'cart-wise',
    name: 'CartWise',
    description: 'Comparador de precios y carrito inteligente',
    icon: 'bi-cart-check-fill',
    color: '#10b981',
    routeBase: '/cart-wise',
    requiresAuth: true,
  },
  {
    slug: 'global-exchange',
    name: 'Tipo de Cambio Global',
    description: 'Conversor de monedas multi-destino, funciona offline',
    icon: 'bi-currency-exchange',
    color: '#1d4ed8',
    routeBase: '/global-exchange',
    requiresAuth: false,
  },
  {
    slug: 'calc-invoices',
    name: 'Calculadora de Cobros',
    description: 'Cobros con comisión y horas trabajadas',
    icon: 'bi-receipt',
    color: '#667eea',
    routeBase: '/calc-invoices',
    requiresAuth: false,
  },
]

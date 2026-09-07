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
  {
    slug: 'lunar-garden',
    name: 'Calendario Lunar',
    description: 'Cuándo sembrar, podar, fertilizar y fumigar según la fase lunar',
    icon: 'bi-moon-stars-fill',
    color: '#6366f1',
    routeBase: '/lunar-garden',
    requiresAuth: false,
  },
  {
    slug: 'ahorros',
    name: 'Ahorros',
    description: 'Metas de ahorro familiares con aportes por persona',
    icon: 'bi-piggy-bank-fill',
    color: '#d97706',
    routeBase: '/ahorros',
    requiresAuth: true,
  },
  {
    slug: 'spray-mix',
    name: 'Dosificador Agrícola',
    description: 'Calcula cuánto producto echar a la bomba según los litros de agua',
    icon: 'bi-eyedropper',
    color: '#0d9488',
    routeBase: '/spray-mix',
    requiresAuth: false,
  },
]

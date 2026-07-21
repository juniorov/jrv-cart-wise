# STACK.md — Base técnica para CartWise (comparador de precios entre negocios)

Este documento describe el stack técnico a usar en este proyecto **CartWise**, pensado para ser
entregado a un asistente de código (Claude Code) como referencia y que instale/configure las
mismas librerías y convenciones al construir la app desde cero.

## Objetivo del producto

PWA personal para comparar precios de productos entre distintos negocios (supermercados,
carnicerías, o cualquier comercio agregado por el usuario), y armar un "carrito inteligente"
que siempre muestra, por cada producto agregado, el negocio donde está más barato.

Funcionalidad core:
- CRUD de negocios (nombre, tipo: supermercado / carnicería / otro).
- CRUD de productos, cada uno con un precio distinto por negocio (N:N producto–negocio con precio).
- Buscador con filtro en vivo por nombre, resultados ordenados de menor a mayor precio.
- Botón "agregar al carrito" por producto.
- Vista de carrito: por cada producto agregado, muestra únicamente el negocio con el precio
  más bajo de ese producto en ese momento (si el precio más barato cambia después de agregarlo
  al carrito, el carrito refleja el nuevo más barato, no el que tenía al momento de agregarlo).

No es multiusuario en el sentido de colaboración (proyecto personal), pero sí lleva autenticación
simple para proteger el acceso.

### Convención de idioma

- **Código**: nombres de variables, funciones, componentes, archivos, colecciones de Firestore,
  commits — todo en **inglés** (`businesses`, `products`, `getCheapestBusiness()`, `ProductCard.vue`).
- **UI**: todo lo que ve el usuario (labels, botones, mensajes, placeholders, textos de error) en
  **español**. No se usa `vue-i18n` ni ninguna librería de i18n — es una sola app en un solo idioma
  de interfaz, así que los strings van directo en los templates. Si más adelante se necesita
  soportar otro idioma de UI, ahí sí se justifica introducir i18n; por ahora es sobre-ingeniería.

### Moneda

La app maneja **dos monedas**: colones costarricenses (CRC) y dólares (USD). Cada precio guarda
su propia moneda — no se fuerza todo a una sola. Para poder comparar "cuál es más barato" entre
negocios que cobran en monedas distintas, se normaliza a una moneda base usando un tipo de cambio
editable manualmente por el usuario (no se consume una API externa de tipo de cambio — no vale la
pena la complejidad para un proyecto personal con actualización esporádica).

- `settings/exchangeRate` (documento único en Firestore): `{ usdToCrc: number, updatedAt }`,
  editable desde una vista simple de configuración.
- Formato de despliegue con `Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' })`
  y `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` según corresponda.
- La comparación "más barato" (buscador y carrito) convierte ambos precios a colones (usando
  `exchangeRate.usdToCrc`) solo para efectos de **ordenar/comparar**; el precio que se muestra
  al usuario siempre es el original, en su moneda original.

---

## 1. Arquitectura general

**Sin backend propio.** Frontend Vue 3 (PWA) hablando directo con **Firebase** (Firestore +
Auth) vía SDK. No hay Express, no hay servidor intermedio, no hay JWT propio — las reglas de
seguridad de Firestore reemplazan esa capa. Esto reduce infraestructura a mantener, y encaja
mejor con el requisito de funcionamiento offline (Firestore trae persistencia offline nativa).

Deploy: **Netlify** (solo frontend estático — no hay `dev:server` ni backend que desplegar).

```
/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── style.css          # Design tokens (variables CSS) + estilos globales
│   ├── router/
│   ├── firebase/
│   │   └── index.js       # initializeApp + getAuth + getFirestore
│   ├── services/           # Funciones de acceso a Firestore por dominio
│   │   ├── businesses.js
│   │   ├── products.js
│   │   └── cart.js
│   ├── stores/              # Pinia stores
│   └── views/ / components/
├── public/                  # Iconos PWA, favicon
├── index.html
├── vite.config.js           # Config de Vite + plugin PWA
├── vitest.config.js
├── netlify.toml              # Config de build/redirects para Netlify
├── package.json
└── .env                       # Variables de entorno Firebase (no versionado)
```

Gestor de paquetes: **pnpm**.

Scripts estándar en `package.json` (se ejecutan con `pnpm <script>`, sin necesidad de `run`):

```bash
pnpm dev            # Frontend (Vite)
pnpm build           # Build de producción
pnpm preview         # Preview del build de Vite
pnpm test             # Vitest (watch)
pnpm test:run         # Vitest (run once)
pnpm test:coverage
```

---

## 2. Frontend

### 2.1 Librerías principales

| Librería | Versión (referencia) | Uso |
|---|---|---|
| `vue` | ^3.5 | Framework principal (Composition API) |
| `vite` | ^7 | Bundler / dev server |
| `@vitejs/plugin-vue` | ^6 | Soporte SFC de Vue en Vite |
| `pinia` | ^3 | State management |
| `vue-router` | ^4 | Ruteo SPA |
| `bootstrap` | ^5.3 | Sistema de UI (grid, botones, forms, modals, offcanvas) |
| `bootstrap-icons` | ^1.13 | Set de iconos (font-based) |
| `firebase` | ^12.15.0 | Auth + Firestore (SDK cliente) |
| `vite-plugin-pwa` | ^1.2 | Generación de manifest + service worker (Workbox) |
| `workbox-window` | ^7 | Registro del SW en el cliente |

Dev/testing: `vitest`, `@vue/test-utils`, `happy-dom`, `jsdom`.

### 2.2 UI: Bootstrap + tema custom

Igual que en proyectos anteriores: Bootstrap 5 (CSS + JS bundle) + Bootstrap Icons, con el
look custom logrado vía variables CSS propias en `src/style.css` (`:root`), no sobreescribiendo
Bootstrap con Sass. Design tokens a definir:

- Paleta semántica: `--color-primary`, `--color-secondary`, `--color-accent`,
  `--color-background`, `--color-surface`, `--color-text-primary/secondary/muted`,
  `--color-success/warning/danger/info` (+ variantes `-bg` y `-hover`).
- Escala tipográfica: `--font-size-xs` … `--font-size-3xl`.
- Escala de espaciado (grid de 8pt): `--spacing-1` … `--spacing-12`.
- Border radius: `--radius-sm/md/lg/xl/full`.
- Sombras: `--shadow-sm/md/lg`.
- Transiciones: `--transition-fast/base/slow`.
- Escala de z-index: `--z-dropdown/sticky/overlay/modal/toast`.

Import order en `main.js`:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css'; // design tokens, se cargan después para poder sobreescribir
```

### 2.3 PWA (vite-plugin-pwa)

Configuración base en `vite.config.js`:

- `registerType: 'autoUpdate'`.
- `workbox.globPatterns` cacheando `js,css,html,ico,png,svg`.
- No hace falta `runtimeCaching` para `/api/*` (no hay API propia) — el offline de datos lo
  cubre la persistencia local de Firestore (`enableIndexedDbPersistence` / `initializeFirestore`
  con `localCache: persistentLocalCache()`).
- `manifest`: `name: 'CartWise'`, `short_name: 'CartWise'`, `description`, `theme_color`,
  `background_color`, `display: 'standalone'`, `scope`, `start_url`,
  `orientation: 'portrait-primary'`, `icons` (192x192, 512x512, apple-touch-icon — SVG),
  `categories: ['shopping', 'productivity']`, `lang: 'es'`.
- `devOptions.enabled: true` para poder probar el SW en desarrollo.

Registro del SW en `main.js` usando `virtual:pwa-register`, con callback `onNeedRefresh`
(confirm + `updateSW(true)`) y `onOfflineReady`.

### 2.4 Firebase (`src/firebase/index.js`)

Mismo patrón usado en proyectos anteriores:

```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
```

### 2.5 Capa de acceso a datos (`src/services/*.js`)

En vez del wrapper de `fetch` con JWT (`src/api/client.js` de proyectos con backend propio),
acá cada archivo en `src/services/` expone funciones que envuelven llamadas al SDK de Firestore:

- `businesses.js`: `getBusinesses()`, `createBusiness()`, `updateBusiness()`, `deleteBusiness()`.
- `products.js`: `getProducts()`, `createProduct()`, `setProductPrice(productId, businessId, price, currency)`,
  `searchProducts(term)` (filtro por nombre + orden por precio mínimo ascendente, convirtiendo a
  una moneda común solo para comparar).
- `cart.js`: `addToCart(productId)`, `getCartWithCheapestBusiness()` (resuelve, para cada item del
  carrito, cuál es el negocio con el precio más bajo *al momento de consultar*, convirtiendo
  monedas con `usdToCrc`), `removeFromCart(productId)`.
- `settings.js`: `getExchangeRate()`, `updateExchangeRate(usdToCrc)`.

Utilidad de formato (`src/utils/currency.js`): `formatPrice(amount, currency)` usando
`Intl.NumberFormat`, y `toCrc(amount, currency, usdToCrc)` para la conversión usada solo en
comparaciones/orden, nunca para lo que se muestra en pantalla.

---

## 3. Modelo de datos (Firestore)

```
businesses/{businessId}
  - name: string
  - type: 'supermercado' | 'carniceria' | 'otro'
  - createdAt: timestamp

products/{productId}
  - name: string
  - category: string | null
  - createdAt: timestamp
  - prices: {                      // mapa embebido: businessId -> { price, currency, updatedAt }
      [businessId]: { price: number, currency: 'CRC' | 'USD', updatedAt: timestamp }
    }

users/{userId}/cart/{productId}
  - productId: string
  - addedAt: timestamp

settings/exchangeRate
  - usdToCrc: number
  - updatedAt: timestamp
```

Notas de diseño:
- `prices` como **mapa embebido** dentro del producto (no subcolección) para poder traer el
  producto completo con todos sus precios en una sola lectura, y calcular mínimo/orden en el
  cliente — volumen de datos bajo, no justifica índices compuestos ni queries complejas.
- Cada entrada de `prices` guarda su **propia moneda**; no se normaliza al guardar, solo al
  comparar (ver sección "Moneda" arriba). Así el precio mostrado siempre es fiel a como el
  negocio lo cobra.
- El carrito guarda solo `productId`; el precio/negocio más barato se resuelve en el momento de
  ver el carrito, leyendo el mapa `prices` del producto y convirtiendo con `exchangeRate.usdToCrc`
  solo para comparar (así siempre refleja el precio actual, no uno congelado al momento de agregar).
- Reglas de seguridad de Firestore: solo el usuario autenticado (`request.auth != null`) puede
  leer/escribir sus propios documentos bajo `users/{userId}/cart/**`; `businesses`, `products` y
  `settings/exchangeRate` pueden ser de lectura/escritura para cualquier usuario autenticado
  (proyecto personal, sin necesidad de roles).

---

## 4. Variables de entorno (`.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Estas mismas variables deben configurarse en **Netlify → Site settings → Environment variables**
para que el build de producción las tenga disponibles (Vite las inyecta en build time).

---

## 5. Deploy en Netlify

`netlify.toml` en la raíz:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

El redirect es necesario porque es una SPA con `vue-router` — sin esto, refrescar una ruta
que no sea `/` da 404 en Netlify.

---

## 6. Instrucciones para la IA que construya esto (Claude Code)

1. Inicializar proyecto Vite + Vue: `pnpm create vite cartwise -- --template vue`.
2. Instalar dependencias de frontend:
   ```
   pnpm add pinia vue-router bootstrap bootstrap-icons firebase
   pnpm add -D vite-plugin-pwa workbox-window
   ```
3. Instalar dependencias de testing (opcional pero recomendado):
   ```
   pnpm add -D vitest @vue/test-utils happy-dom jsdom
   ```
4. Crear `src/firebase/index.js` con el patrón de la sección 2.4.
5. Crear `src/services/businesses.js`, `src/services/products.js`, `src/services/cart.js`
   siguiendo el modelo de datos de la sección 3.
6. Configurar `vite.config.js` con `vite-plugin-pwa` (sección 2.3), `manifest.name: 'CartWise'`.
7. Crear `src/style.css` con el set de design tokens de la sección 2.2 (elegir paleta de color
   para `--color-primary/secondary/accent`).
8. Importar Bootstrap + Bootstrap Icons + `style.css` en `src/main.js` en ese orden, inicializar
   Firebase, y registrar el service worker con `virtual:pwa-register`.
9. Crear las vistas principales:
   - `BusinessesView.vue` (CRUD de negocios).
   - `ProductsView.vue` (crear producto, asignar a negocios, poner precio por negocio).
   - `SearchView.vue` (buscador con filtro en vivo, resultados ordenados por precio ascendente,
     botón "agregar al carrito" por resultado).
   - `CartView.vue` (lista de productos agregados, mostrando solo el negocio más barato de cada uno).
10. Configurar reglas de seguridad de Firestore (usuario autenticado; carrito solo accesible
    por su dueño).
11. Crear `netlify.toml` (sección 5) y `.env` con las variables de la sección 4.
12. Agregar scripts en `package.json`: `dev`, `build`, `preview`, `test`, `test:run`, `test:coverage`.

Notas:
- Los íconos PWA (`pwa-192x192.svg`, `pwa-512x512.svg`, `apple-touch-icon.svg`, `favicon.ico`)
  van en `public/` con branding propio de CartWise (paleta a definir en el paso 7).
- No copiar lógica de negocio de otros proyectos (BARF, Sys-Human, etc.) — el modelo de datos
  de la sección 3 es específico de CartWise.
- `.gitignore` debe incluir `.env`, `node_modules/`, `dist/` — el repo debe poder abrirse con
  cualquier asistente de código (OpenCode, Claude Code, etc.) sin exponer credenciales; este
  mismo `STACK.md` sirve como archivo de contexto para cualquiera de ellos.
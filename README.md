# JRV Tools

PWA multi-herramienta construida con Vue 3 + Vite. Cada mini-app vive aislada bajo
`src/apps/<slug>/` y comparte un shell, autenticación y una instancia de Firebase en común.

## Mini-apps

| App | Slug | Ruta | Descripción |
|---|---|---|---|
| CartWise | `cart-wise` | `/cart-wise` | Comparador de precios y carrito inteligente |
| Tipo de Cambio Global | `global-exchange` | `/global-exchange` | Conversor de monedas multi-destino, funciona offline |
| Calculadora de Cobros | `calc-invoices` | `/calc-invoices` | Cobros con comisión y horas trabajadas |
| Calendario Lunar | `lunar-garden` | `/lunar-garden` | Cuándo sembrar, podar, fertilizar y fumigar según la fase lunar |
| Dosificador Agrícola | `spray-mix` | `/spray-mix` | Calcula cuánto producto echar a la bomba según los litros de agua |
| Ahorros | `ahorros` | `/ahorros` | Metas de ahorro familiares con aportes por persona |

Ver [APPS.md](./APPS.md) para el detalle de arquitectura y cómo agregar una mini-app nueva.

## Stack

- Vue 3 (`<script setup>`) + Vite
- Vue Router, Pinia
- Firebase (Auth + Firestore)
- Bootstrap 5 + Bootstrap Icons
- Vitest para testing
- `vite-plugin-pwa` para soporte offline/instalable

## Desarrollo

```bash
npm install
npm run dev          # servidor de desarrollo
npm run build         # build de producción
npm run preview        # preview del build
npm run test          # tests (watch mode)
npm run test:run        # tests una sola vez
npm run test:coverage     # tests con cobertura
```

## Más info

- [Vue 3 `<script setup>` docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup)
- [Vue Docs: Scaling Up Guide (soporte de IDE)](https://vuejs.org/guide/scaling-up/tooling.html#ide-support)

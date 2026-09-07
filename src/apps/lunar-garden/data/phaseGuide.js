/**
 * Guía tradicional de agricultura/jardinería lunar. Cada uno de los 4 momentos
 * lunares exactos (luna nueva, cuarto creciente, luna llena, cuarto menguante)
 * abre una ventana de ±3 días con sus actividades recomendadas y a evitar.
 */
export const PHASE_GUIDE = {
  nueva: {
    label: 'Luna Nueva',
    emoji: '🌑',
    color: '#94a3b8',
    summary: 'Descanso de la tierra. Momento de preparar el terreno y planear, no de sembrar.',
    recommended: [
      { icon: 'bi-shovel', text: 'Preparar y labrar la tierra donde vas a sembrar' },
      { icon: 'bi-recycle', text: 'Compostar y voltear las pilas de abono' },
      { icon: 'bi-clipboard-check', text: 'Planear qué vas a sembrar en la próxima ventana de creciente' },
    ],
    avoid: [
      { icon: 'bi-flower1', text: 'Siembra en tierra directa o trasplantes (germinación muy lenta)' },
      { icon: 'bi-tree', text: 'Traspasar árboles de bolsa a tierra (la raíz no arranca bien)' },
    ],
  },
  creciente: {
    label: 'Cuarto Creciente',
    emoji: '🌓',
    color: '#22c55e',
    summary: 'La savia sube y favorece el crecimiento hacia arriba: hojas, tallos y frutos.',
    recommended: [
      { icon: 'bi-flower1', text: 'Siembra en tierra directa de hortalizas de hoja y fruto (lechuga, tomate, chile, maíz, frijol)' },
      { icon: 'bi-tree', text: 'Traspasar árboles de bolsa a tierra directa (mejor prendimiento y crecimiento)' },
      { icon: 'bi-droplet-half', text: 'Echar vitaminas / fertilizante foliar a los árboles frutales (mejor absorción hacia arriba)' },
      { icon: 'bi-tree', text: 'Injertar' },
    ],
    avoid: [{ icon: 'bi-scissors', text: 'Podar fuerte árboles frutales (más pérdida de savia)' }],
  },
  llena: {
    label: 'Luna Llena',
    emoji: '🌕',
    color: '#f59e0b',
    summary: 'Savia al máximo en toda la planta. Buen momento para cosechar, no para cortar ni fumigar.',
    recommended: [
      { icon: 'bi-basket', text: 'Cosechar frutas y hortalizas (mejor sabor y se conservan más)' },
      { icon: 'bi-tree', text: 'Injertar' },
    ],
    avoid: [
      { icon: 'bi-scissors', text: 'Podar árboles frutales (savia al máximo, el corte sangra y cicatriza mal)' },
      { icon: 'bi-bug', text: 'Echar veneno a la maleza o insecticida (las plantas están en su punto más sensible)' },
    ],
  },
  menguante: {
    label: 'Cuarto Menguante',
    emoji: '🌗',
    color: '#8b5cf6',
    summary: 'La savia baja hacia la raíz: mejor momento para cortar, fumigar y sembrar bajo tierra.',
    recommended: [
      { icon: 'bi-scissors', text: 'Podar árboles frutales (cicatriza mejor, savia baja, menos riesgo de plagas en el corte)' },
      { icon: 'bi-flower1', text: 'Siembra en tierra directa de raíces y tubérculos (papa, zanahoria, rábano, cebolla, ajo, remolacha)' },
      { icon: 'bi-recycle', text: 'Echar abono / abono de fondo al pie de árboles frutales y hortalizas' },
      { icon: 'bi-bug', text: 'Echar veneno a la maleza (menor daño a la raíz de tus cultivos, la maleza lo absorbe mejor)' },
      { icon: 'bi-bug', text: 'Aplicar insecticida y fungicida (plagas menos activas)' },
    ],
    avoid: [{ icon: 'bi-flower1', text: 'Sembrar hojas o frutos (crecimiento aéreo más lento en esta fase)' }],
  },
}

/** Tips generales de jardinería lunar que no dependen de una sola fase. */
export const GENERAL_TIPS = [
  'Los injertos prenden mejor en luna llena o creciente; evita hacerlos en menguante.',
  'Remoja las semillas duras (como frijol o maíz) desde menguante para que germinen justo al entrar la ventana de creciente.',
  'Evita podar o fumigar con lluvia encima, sin importar la fase — el agua lava el producto o el corte queda expuesto.',
  'La poda de formación fuerte en árboles frutales rinde mejor si además cae en temporada seca y en menguante.',
  'Si vas a trasplantar un árbol de bolsa, riega bien un día antes: la ventana de creciente ayuda a que prenda, pero la raíz también necesita humedad.',
]

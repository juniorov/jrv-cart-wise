/**
 * Productos iniciales de la biblioteca, con las dosis confirmadas en la conversación
 * de referencia. El composable useProducts.js solo los usa si aún no hay nada guardado
 * en localStorage — no pisan productos que el usuario ya haya editado o agregado.
 */
export const SEED_PRODUCTS = [
  {
    id: 'minerva-35-sc',
    name: 'Minerva 35 SC',
    doseAmount: 1,
    doseUnit: 'cc',
    doseLiters: 1,
    notes: 'Fungicida sistémico. Protege el follaje contra antracnosis, mancha negra y moho blanco.',
  },
  {
    id: 'ion-blue',
    name: 'Ion Blue',
    doseAmount: 1,
    doseUnit: 'cc',
    doseLiters: 1,
    notes: 'Fertilizante foliar con cobre/zinc de alta absorción. Bactericida/fungicida de contacto.',
  },
  {
    id: 'pega-25-sl',
    name: 'Pega 25 SL',
    doseAmount: 1,
    doseUnit: 'cc',
    doseLiters: 1,
    notes: 'Adherente. Rompe la tensión superficial del agua y fija los demás productos a la hoja.',
  },
  {
    id: 'glifocol-35-6-sl',
    name: 'Glifocol 35.6 SL',
    doseAmount: 5,
    doseUnit: 'cc',
    doseLiters: 1,
    notes: 'Herbicida no selectivo (glifosato). Dosis de mantenimiento (equivale a 3 oz por bomba de 18 L). Rango de fabricante para maleza agresiva: 10-15 cc/L. Solo sobre maleza, lejos del follaje de los frutales.',
  },
]

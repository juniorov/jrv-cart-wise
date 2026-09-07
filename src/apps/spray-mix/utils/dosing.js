export const ML_PER_OZ = 29.5735295625

export function ccToOz(cc) {
  return cc / ML_PER_OZ
}

export function ozToCc(oz) {
  return oz * ML_PER_OZ
}

/**
 * Escala la dosis de un producto a los litros de agua que se van a preparar.
 * `product.doseAmount` está expresado en `product.doseUnit` ('cc' u 'oz') por
 * `product.doseLiters` litros (normalmente 1). Devuelve la cantidad necesaria
 * en ambas unidades, redondeada para lectura práctica (cc a 1 decimal, oz a 2).
 */
export function calculateAmount(product, liters) {
  const scale = liters / product.doseLiters
  const amountInDoseUnit = product.doseAmount * scale

  const cc = product.doseUnit === 'oz' ? ozToCc(amountInDoseUnit) : amountInDoseUnit
  const oz = product.doseUnit === 'cc' ? ccToOz(amountInDoseUnit) : amountInDoseUnit

  return {
    cc: Math.round(cc * 10) / 10,
    oz: Math.round(oz * 100) / 100,
  }
}

const KG_PER_LB = 0.45359237

export function lbToKg(lb) {
  return Math.round(lb * KG_PER_LB * 100) / 100
}

export function kgToLb(kg) {
  return Math.round((kg / KG_PER_LB) * 100) / 100
}

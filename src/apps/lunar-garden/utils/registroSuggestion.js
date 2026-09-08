import { getNextWindowOfType } from './moonPhase.js'
import { CATEGORY_PHASE_MAP } from '../data/phaseGuide.js'

export const CATEGORIES = {
  fumigacion: {
    label: 'Fumigación',
    subtypes: [
      { value: 'herbicida', label: 'Herbicida' },
      { value: 'insecticida', label: 'Insecticida' },
      { value: 'fungicida', label: 'Fungicida' },
    ],
  },
  fertilizacion: {
    label: 'Fertilización',
    subtypes: [
      { value: 'abono', label: 'Abono' },
      { value: 'vitaminas', label: 'Vitaminas' },
    ],
  },
}

/**
 * Sugiere la próxima fecha de aplicación para una categoría/subtipo, usando la próxima
 * ventana lunar del tipo tradicionalmente recomendado para esa labor (ver
 * CATEGORY_PHASE_MAP). Retorna null si la combinación no tiene una fase mapeada o no se
 * encontró ninguna ventana dentro del horizonte de búsqueda.
 */
export function suggestNextDate(category, subtype, appliedDate) {
  const phaseType = CATEGORY_PHASE_MAP[`${category}:${subtype}`]
  if (!phaseType) return null

  const window = getNextWindowOfType(appliedDate, phaseType)
  if (!window) return null

  return { phaseType, window, suggestedDate: window.exactDate }
}

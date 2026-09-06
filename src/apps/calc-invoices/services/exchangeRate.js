const FALLBACK_RATE = 510

/**
 * Tipo de cambio USD -> CRC para la calculadora de cobros. Misma API y mismo
 * fallback que la versión original (exchangerate-api.com), solo que la API key
 * ahora viene de una variable de entorno en vez de estar hardcodeada en el código.
 */
export async function getUsdToCrcRate() {
  const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY

  if (!apiKey) {
    return { rate: FALLBACK_RATE, estimated: true }
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
    const data = await response.json()

    if (data.result === 'success') {
      return { rate: data.conversion_rates.CRC, estimated: false }
    }
    throw new Error('Error al obtener tipo de cambio')
  } catch {
    return { rate: FALLBACK_RATE, estimated: true }
  }
}

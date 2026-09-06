const DEFAULT_USD_TO_CRC = 500

async function fetchJson(url, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Obtiene el tipo de cambio USD -> CRC de forma automática, con fallback en cadena:
 * apis.gometa.org -> tipodecambio.paginasweb.cr -> valor por defecto (500).
 */
export async function fetchExchangeRate() {
  try {
    const data = await fetchJson('https://apis.gometa.org/tdc/tdc.json')
    if (typeof data.venta === 'number') return { usdToCrc: data.venta, source: 'gometa' }
    throw new Error('Respuesta inválida de apis.gometa.org')
  } catch {
    try {
      const data = await fetchJson('https://tipodecambio.paginasweb.cr/api')
      if (typeof data.venta === 'number') return { usdToCrc: data.venta, source: 'paginasweb' }
      throw new Error('Respuesta inválida de tipodecambio.paginasweb.cr')
    } catch {
      return { usdToCrc: DEFAULT_USD_TO_CRC, source: 'default' }
    }
  }
}

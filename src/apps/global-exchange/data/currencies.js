export const CURRENCIES = [
  // América Latina & Caribe
  { code: 'CRC', name: 'Colón Costarricense', flag: '🇨🇷', region: 'latam' },
  { code: 'BRL', name: 'Real Brasileño', flag: '🇧🇷', region: 'latam' },
  { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽', region: 'latam' },
  { code: 'COP', name: 'Peso Colombiano', flag: '🇨🇴', region: 'latam' },
  { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷', region: 'latam' },
  { code: 'CLP', name: 'Peso Chileno', flag: '🇨🇱', region: 'latam' },
  { code: 'PEN', name: 'Sol Peruano', flag: '🇵🇪', region: 'latam' },
  { code: 'UYU', name: 'Peso Uruguayo', flag: '🇺🇾', region: 'latam' },
  { code: 'PYG', name: 'Guaraní Paraguayo', flag: '🇵🇾', region: 'latam' },
  { code: 'BOB', name: 'Boliviano', flag: '🇧🇴', region: 'latam' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', flag: '🇬🇹', region: 'latam' },
  { code: 'HNL', name: 'Lempira Hondureño', flag: '🇭🇳', region: 'latam' },
  { code: 'NIO', name: 'Córdoba Nicaragüense', flag: '🇳🇮', region: 'latam' },
  { code: 'PAB', name: 'Balboa Panameño', flag: '🇵🇦', region: 'latam' },
  { code: 'DOP', name: 'Peso Dominicano', flag: '🇩🇴', region: 'latam' },
  { code: 'JMD', name: 'Dólar Jamaiquino', flag: '🇯🇲', region: 'latam' },
  { code: 'TTD', name: 'Dólar Trinitario', flag: '🇹🇹', region: 'latam' },
  // América del Norte
  { code: 'USD', name: 'Dólar Estadounidense', flag: '🇺🇸', region: 'americas' },
  { code: 'CAD', name: 'Dólar Canadiense', flag: '🇨🇦', region: 'americas' },
  // Europa
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', region: 'europe' },
  { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧', region: 'europe' },
  { code: 'CHF', name: 'Franco Suizo', flag: '🇨🇭', region: 'europe' },
  { code: 'SEK', name: 'Corona Sueca', flag: '🇸🇪', region: 'europe' },
  { code: 'NOK', name: 'Corona Noruega', flag: '🇳🇴', region: 'europe' },
  { code: 'DKK', name: 'Corona Danesa', flag: '🇩🇰', region: 'europe' },
  { code: 'PLN', name: 'Esloti Polaco', flag: '🇵🇱', region: 'europe' },
  // Asia
  { code: 'JPY', name: 'Yen Japonés', flag: '🇯🇵', region: 'asia' },
  { code: 'CNY', name: 'Yuan Chino', flag: '🇨🇳', region: 'asia' },
  { code: 'INR', name: 'Rupia India', flag: '🇮🇳', region: 'asia' },
  { code: 'KRW', name: 'Won Surcoreano', flag: '🇰🇷', region: 'asia' },
  { code: 'SGD', name: 'Dólar de Singapur', flag: '🇸🇬', region: 'asia' },
  { code: 'HKD', name: 'Dólar de Hong Kong', flag: '🇭🇰', region: 'asia' },
  { code: 'THB', name: 'Baht Tailandés', flag: '🇹🇭', region: 'asia' },
  // Oceanía
  { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺', region: 'oceania' },
  { code: 'NZD', name: 'Dólar Neozelandés', flag: '🇳🇿', region: 'oceania' },
  // Medio Oriente
  { code: 'AED', name: 'Dírham Emiratí', flag: '🇦🇪', region: 'mideast' },
  { code: 'SAR', name: 'Riyal Saudí', flag: '🇸🇦', region: 'mideast' },
  { code: 'ILS', name: 'Séquel Israelí', flag: '🇮🇱', region: 'mideast' },
  // África
  { code: 'ZAR', name: 'Rand Sudafricano', flag: '🇿🇦', region: 'africa' },
  { code: 'EGP', name: 'Libra Egipcia', flag: '🇪🇬', region: 'africa' },
]

export const REGION_LABELS = {
  latam: '🌎 América Latina & Caribe',
  americas: '🌎 América del Norte',
  europe: '🌍 Europa',
  asia: '🌏 Asia',
  oceania: '🌏 Oceanía',
  mideast: '🌍 Medio Oriente',
  africa: '🌍 África',
}

export const REGION_COLORS = {
  latam: 'var(--color-latam)',
  americas: 'var(--color-americas)',
  europe: 'var(--color-europe)',
  asia: 'var(--color-asia)',
  oceania: 'var(--color-oceania)',
  mideast: 'var(--color-mideast)',
  africa: 'var(--color-africa)',
}

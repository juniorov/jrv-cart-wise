#!/usr/bin/env node
/**
 * Migración puntual: copia los documentos de las colecciones viejas de cart-wise
 * (sin prefijo) a las nuevas colecciones con prefijo `cartwise_`, para que puedan
 * convivir con las demás mini-apps del suite en el mismo proyecto de Firebase.
 *
 * NO borra nada. Solo copia. El borrado de las colecciones viejas es un paso manual
 * y deliberado, a ejecutar únicamente después de confirmar que la app funciona bien
 * contra las colecciones nuevas.
 *
 * Uso:
 *   1. Generar una clave de cuenta de servicio: Firebase Console → Configuración del
 *      proyecto → Cuentas de servicio → Generar nueva clave privada.
 *   2. GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/service-account.json node scripts/migrate-cartwise-collections.mjs
 *   3. Revisar el conteo de documentos copiados que imprime el script contra el
 *      conteo real en la consola de Firebase antes de continuar con el cutover.
 *
 * Requiere: `pnpm add -D firebase-admin` (no se agrega como dependencia permanente
 * del proyecto, solo hace falta para correr este script una vez).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp({ credential: applicationDefault() })
const db = getFirestore()

async function copyCollection(fromPath, toPath) {
  const snapshot = await db.collection(fromPath).get()
  let count = 0
  for (const docSnap of snapshot.docs) {
    await db.collection(toPath).doc(docSnap.id).set(docSnap.data())
    count += 1
  }
  console.log(`${fromPath} -> ${toPath}: ${count} documentos copiados`)
  return count
}

async function copyCartSubcollections() {
  const usersSnapshot = await db.collection('users').get()
  let totalUsers = 0
  let totalCartItems = 0
  for (const userDoc of usersSnapshot.docs) {
    const cartSnapshot = await userDoc.ref.collection('cart').get()
    if (cartSnapshot.empty) continue
    totalUsers += 1
    for (const cartDoc of cartSnapshot.docs) {
      await userDoc.ref.collection('cartwise_cart').doc(cartDoc.id).set(cartDoc.data())
      totalCartItems += 1
    }
  }
  console.log(
    `users/{uid}/cart -> users/{uid}/cartwise_cart: ${totalCartItems} items en ${totalUsers} usuarios`,
  )
}

async function main() {
  console.log('Iniciando migración de colecciones de cart-wise...\n')
  await copyCollection('businesses', 'cartwise_businesses')
  await copyCollection('products', 'cartwise_products')

  const settingsSnapshot = await db.collection('settings').get()
  if (!settingsSnapshot.empty) {
    await copyCollection('settings', 'cartwise_settings')
  } else {
    console.log('settings: sin documentos, nada que copiar.')
  }

  await copyCartSubcollections()
  console.log('\nMigración de copia completa. Verifica los conteos antes de continuar.')
}

main().catch((err) => {
  console.error('Error durante la migración:', err)
  process.exit(1)
})

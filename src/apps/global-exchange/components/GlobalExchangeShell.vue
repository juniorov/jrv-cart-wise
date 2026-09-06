<script setup>
import { ref } from 'vue'
import CurrencyConverter from './CurrencyConverter.vue'
import { useInstallPrompt } from '../composables/useInstallPrompt.js'

const { canInstall, isInstalled, promptInstall } = useInstallPrompt()
const installDismissed = ref(false)
const installing = ref(false)

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandalone = window.matchMedia('(display-mode: standalone)').matches
const showIosTip = ref(isIos && !isInStandalone)
const iosTipDismissed = ref(false)

async function handleInstall() {
  installing.value = true
  await promptInstall()
  installing.value = false
}
</script>

<template>
  <div class="app-wrapper">
    <header class="app-header">
      <div class="container">
        <div class="d-flex align-items-center gap-3 py-3">
          <img src="/global-exchange/icons/icon-192.png" alt="" class="header-logo" aria-hidden="true" />
          <div>
            <h1 class="app-title mb-0">Tipo de Cambio</h1>
            <p class="app-subtitle mb-0">Conversor multi-moneda</p>
          </div>
        </div>
      </div>
    </header>

    <div v-if="canInstall && !installDismissed" class="install-banner" role="banner">
      <div class="container">
        <div class="install-banner__inner">
          <div class="install-banner__text">
            <strong>Instalar app</strong>
            <span class="d-block text-muted small">Úsala sin internet, directo desde tu celular</span>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <button
              class="btn btn-primary btn-sm install-banner__btn"
              :disabled="installing"
              @click="handleInstall"
            >
              <span v-if="installing" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ installing ? 'Instalando...' : 'Instalar' }}
            </button>
            <button
              class="btn-close btn-close-sm"
              aria-label="Cerrar"
              @click="installDismissed = true"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showIosTip && !iosTipDismissed" class="ios-tip" role="banner">
      <div class="container">
        <div class="ios-tip__inner">
          <div class="ios-tip__text">
            <strong>Instala esta app en tu iPhone:</strong>
            toca
            <span class="ios-share-icon" aria-label="compartir">⎋</span>
            y luego <em>"Agregar a inicio"</em>
          </div>
          <button
            class="btn-close btn-close-sm"
            aria-label="Cerrar"
            @click="iosTipDismissed = true"
          ></button>
        </div>
      </div>
    </div>

    <div v-if="isInstalled" class="installed-toast" role="status" aria-live="polite">
      <i class="bi bi-check-circle-fill me-2 text-success"></i>
      App instalada correctamente
    </div>

    <main>
      <CurrencyConverter />
    </main>

    <footer class="text-center text-muted small py-4 px-3">
      Tipos de cambio: <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener" class="text-muted">Open Exchange Rate API</a>
      · Actualización diaria
    </footer>
  </div>
</template>

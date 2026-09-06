import { ref, onMounted, onUnmounted } from 'vue'

export function useInstallPrompt() {
  const canInstall = ref(false)
  const isInstalled = ref(false)
  let deferredPrompt = null

  function onBeforeInstallPrompt(e) {
    e.preventDefault()
    deferredPrompt = e
    canInstall.value = true
  }

  function onAppInstalled() {
    canInstall.value = false
    isInstalled.value = true
    deferredPrompt = null
  }

  async function promptInstall() {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
    return outcome === 'accepted'
  }

  onMounted(() => {
    // Already running as installed PWA — don't show banners, don't show toast
    if (window.matchMedia('(display-mode: standalone)').matches) return

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return { canInstall, isInstalled, promptInstall }
}

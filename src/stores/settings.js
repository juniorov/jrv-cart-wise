import { defineStore } from 'pinia'
import { getExchangeRate, updateExchangeRate } from '@/services/settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    usdToCrc: null,
    loaded: false,
  }),
  actions: {
    async load() {
      const rate = await getExchangeRate()
      this.usdToCrc = rate?.usdToCrc ?? null
      this.loaded = true
    },
    async save(usdToCrc) {
      await updateExchangeRate(usdToCrc)
      this.usdToCrc = usdToCrc
    },
  },
})

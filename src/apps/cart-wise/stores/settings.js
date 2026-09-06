import { defineStore } from 'pinia'
import { fetchExchangeRate } from '@/apps/cart-wise/services/settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    usdToCrc: null,
    source: null,
    loaded: false,
  }),
  actions: {
    async load() {
      const { usdToCrc, source } = await fetchExchangeRate()
      this.usdToCrc = usdToCrc
      this.source = source
      this.loaded = true
    },
    async refresh() {
      await this.load()
    },
  },
})

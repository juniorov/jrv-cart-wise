<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTopBar from '@/shared/components/AppTopBar.vue'
import AppLauncherDrawer from '@/shared/components/AppLauncherDrawer.vue'

const route = useRoute()
const themeClass = computed(() => (route.meta.appSlug ? `app-${route.meta.appSlug}` : ''))
</script>

<template>
  <AppTopBar />
  <AppLauncherDrawer />
  <div :class="themeClass">
    <RouterView />
  </div>
</template>

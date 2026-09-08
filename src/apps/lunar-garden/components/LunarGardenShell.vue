<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="lunar-garden-page" data-bs-theme="dark">
    <div class="lunar-tabs">
      <RouterLink to="/lunar-garden" class="lunar-tab" exact-active-class="active">
        🌙 Hoy
      </RouterLink>
      <RouterLink to="/lunar-garden/calendario" class="lunar-tab" active-class="active">
        📅 Próximos meses
      </RouterLink>
      <RouterLink to="/lunar-garden/lotes" class="lunar-tab" active-class="active">
        🧪 Registros
      </RouterLink>
    </div>
    <RouterView />
  </div>
</template>

<style scoped>
.lunar-garden-page {
  min-height: calc(100dvh - 2.75rem);
  padding-top: 1rem;
}

.lunar-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.lunar-tab {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
}

.lunar-tab.active {
  background: #6366f1;
  color: #fff;
}
</style>

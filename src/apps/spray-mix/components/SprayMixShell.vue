<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="spray-mix-page">
    <div class="spray-tabs">
      <RouterLink to="/spray-mix" class="spray-tab" exact-active-class="active">
        <i class="bi bi-eyedropper"></i> Mezcla
      </RouterLink>
      <RouterLink to="/spray-mix/productos" class="spray-tab" active-class="active">
        <i class="bi bi-list-ul"></i> Productos
      </RouterLink>
    </div>
    <RouterView />
  </div>
</template>

<style scoped>
.spray-mix-page {
  min-height: calc(100dvh - 2.75rem);
  padding-top: 1rem;
}

.spray-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.spray-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: #f0fdfa;
  color: #0d9488;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
}

.spray-tab.active {
  background: #0d9488;
  color: #fff;
}
</style>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="calc-invoices-page">
    <div class="calc-tabs">
      <RouterLink to="/calc-invoices" class="calc-tab" active-class="active" exact-active-class="active">
        💰 Cobros
      </RouterLink>
      <RouterLink to="/calc-invoices/hours" class="calc-tab" active-class="active">
        ⏱️ Horas
      </RouterLink>
      <RouterLink to="/calc-invoices/tip" class="calc-tab" active-class="active">
        💵 Propina
      </RouterLink>
    </div>
    <RouterView />
  </div>
</template>

<style scoped>
.calc-invoices-page {
  min-height: calc(100dvh - 2.75rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.calc-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 4px;
}

.calc-tab {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
}

.calc-tab.active {
  background: #fff;
  color: #667eea;
}
</style>

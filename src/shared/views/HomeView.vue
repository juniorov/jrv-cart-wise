<script setup>
import { apps } from '@/shared/apps.registry'
</script>

<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">
      <i class="bi bi-grid-3x3-gap-fill me-1"></i>JRV Tools
    </h1>
    <div class="row g-3">
      <div v-for="app in apps" :key="app.slug" class="col-12 col-sm-6 col-lg-4">
        <RouterLink :to="app.routeBase" class="card text-decoration-none h-100 shadow-sm border-0">
          <div class="card-body d-flex align-items-center gap-3">
            <span class="home-tile-icon" :style="{ backgroundColor: app.color }">
              <i :class="['bi', app.icon]"></i>
            </span>
            <div>
              <h2 class="h6 mb-1 text-body">{{ app.name }}</h2>
              <p class="small text-muted mb-0">{{ app.description }}</p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-tile-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.9rem;
  color: #fff;
  font-size: 1.4rem;
}
</style>

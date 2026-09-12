<script setup>
import { apps } from '@/shared/apps.registry'
</script>

<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">
      <i class="bi bi-grid-3x3-gap-fill me-1"></i>JRV Tools
    </h1>
    <div class="row g-2 g-sm-3">
      <div v-for="app in apps" :key="app.slug" class="col-6 col-sm-6 col-lg-4">
        <RouterLink :to="app.routeBase" class="card text-decoration-none h-100 shadow-sm border-0">
          <div class="card-body d-flex flex-column flex-sm-row align-items-center text-center text-sm-start gap-2 gap-sm-3">
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
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1.15rem;
}

@media (min-width: 576px) {
  .home-tile-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.9rem;
    font-size: 1.4rem;
  }
}
</style>

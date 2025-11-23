<script setup lang="ts">
import MovieGrid from '@/components/MovieGrid.vue'
import { useFavoritesStore } from '@/stores/favorites'

const favorites = useFavoritesStore()
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div>
        <h2>Favorites</h2>
        <p class="muted">
          Movies you saved across the app. They stay here thanks to local storage.
        </p>
      </div>
      <VChip color="amber" variant="tonal" prepend-icon="mdi-star">
        {{ favorites.favorites.length }} saved
      </VChip>
    </header>

    <div v-if="favorites.favorites.length === 0" class="empty">
      <p>No favorites yet. Mark some movies with the star to collect them here.</p>
    </div>

    <MovieGrid :movies="favorites.favorites" />
  </main>
</template>

<style scoped lang="scss">
.page {
  padding: 16px;
  border-radius: 8px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.muted {
  color: #5c6b80;
  margin: 4px 0 0;
}

.empty {
  text-align: center;
  padding: 32px 12px;
  color: #5c6b80;
  border: 1px dashed var(--ui-border);
  border-radius: 6px;
  margin-bottom: 12px;
}
</style>

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
        <p class="text-muted">
          Movies you saved across the app. They stay here thanks to local storage.
        </p>
      </div>
      <VChip color="amber" variant="tonal"> {{ favorites.favorites.length }} saved </VChip>
    </header>

    <div v-if="favorites.favorites.length === 0" class="empty">
      <p>No favorites yet. Mark some movies with the star to collect them here.</p>
    </div>

    <MovieGrid :movies="favorites.favorites" />
  </main>
</template>

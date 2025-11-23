<script setup lang="ts">
import { computed } from 'vue'
import type { Movie } from '@/services/movies'
import { useFavoritesStore } from '@/stores/favorites'
import { mdiStar } from '@mdi/js'

defineProps<{
  movies: Movie[]
  loading?: boolean
}>()

const favorites = useFavoritesStore()

const favoriteIds = computed(() => favorites.ids)

const toggleFavorite = (movie: Movie) => {
  favorites.toggle(movie)
}
</script>

<template>
  <div class="movie-grid">
    <template v-if="loading">
      <VCard
        :safe-area="false"
        v-for="index in 10"
        :key="index"
        class="movie-card"
        border
        elevation="0"
      >
        <div class="poster skeleton" />
        <VCardTitle class="skeleton-line" />
        <VCardSubtitle class="skeleton-line short" />
      </VCard>
    </template>

    <template v-else>
      <VCard
        :safe-area="false"
        v-for="movie in movies"
        :key="movie.imdbID"
        class="movie-card"
        border
        elevation="0"
        hover
      >
        <div class="poster placeholder" aria-hidden="true">
          <span class="poster-text">Poster</span>
        </div>

        <VBtn
          class="favorite-toggle"
          variant="text"
          size="small"
          density="compact"
          icon
          :color="favoriteIds.has(movie.imdbID) ? 'amber' : 'white'"
          :aria-label="favoriteIds.has(movie.imdbID) ? 'Unfavorite' : 'Favorite'"
          @click.stop="toggleFavorite(movie)"
          ><VIcon :icon="mdiStar"
        /></VBtn>

        <div class="overlay">
          <div class="title-line">
            <span class="title">{{ movie.Title }}</span
            >{{ ' ' }}
            <span class="year">({{ movie.Year }})</span>
          </div>
          <div class="meta-line">
            <span class="imdb">{{ movie.imdbID }}</span>
            <a
              class="imdb-link"
              :href="`https://www.imdb.com/title/${movie.imdbID}`"
              target="_blank"
              rel="noreferrer"
            >
              Open on IMDb
            </a>
          </div>
        </div>
      </VCard>
    </template>
  </div>
</template>

<style scoped lang="scss">
.movie-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .movie-card {
    border: 1px solid var(--ui-border);
    border-radius: 5px;
    background: #494646;
    position: relative;
    overflow: hidden;
    height: 300px;
    padding: 0;

    .poster {
      width: 100%;
      height: 100%;
      background: #494646;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-weight: 600;

      .poster-text {
        font-size: 13px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
    }

    .favorite-toggle {
      position: absolute;
      top: 10px;
      right: 10px;
      opacity: 0;
      transition: opacity 0.2s ease;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
    }

    &:hover .favorite-toggle,
    .favorite-toggle:focus-visible {
      opacity: 1;
    }

    .overlay {
      position: absolute;
      inset: auto 0 0;
      padding: 16px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.9) 80%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #fff;
    }

    .title-line {
      line-height: 1.3;
      font-size: 14px;
    }

    .meta-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #b8bdc5;
      font-size: 12px;

      .imdb-link {
        color: var(--primary-color);
        font-weight: 700;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .skeleton {
      position: relative;
      overflow: hidden;
      background: #8d8c8b;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.35) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shimmer 1.5s infinite;
        transform: translateX(-100%);
      }
    }

    .skeleton-line {
      height: 16px;
      margin: 8px 12px;
      background: #eaecef;
      border-radius: 4px;

      &.short {
        width: 60%;
      }
    }
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>

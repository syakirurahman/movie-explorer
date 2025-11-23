import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Movie } from '@/services/movies'

const STORAGE_KEY = 'movie-explorer:favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Movie[]>([])

  const loadFromStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Movie[]
      favorites.value = parsed
    } catch {
      favorites.value = []
    }
  }

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  }

  loadFromStorage()

  watch(
    favorites,
    () => {
      persist()
    },
    { deep: true },
  )

  const ids = computed(() => new Set(favorites.value.map((movie) => movie.imdbID)))

  const isFavorite = (imdbID: string) => ids.value.has(imdbID)

  const add = (movie: Movie) => {
    if (isFavorite(movie.imdbID)) return
    favorites.value.push(movie)
  }

  const remove = (imdbID: string) => {
    favorites.value = favorites.value.filter((movie) => movie.imdbID !== imdbID)
  }

  const toggle = (movie: Movie) => {
    if (isFavorite(movie.imdbID)) {
      remove(movie.imdbID)
    } else {
      add(movie)
    }
  }

  return {
    favorites,
    ids,
    isFavorite,
    add,
    remove,
    toggle,
  }
})

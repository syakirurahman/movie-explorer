import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Movie } from '@/services/movies'

const STORAGE_KEY = 'movie-explorer:favorites'
const getStorage = () => (typeof window !== 'undefined' ? window.localStorage : null)

const parseStoredMovies = (raw: string | null): Movie[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is Movie =>
        Boolean(item) &&
        typeof item.Title === 'string' &&
        typeof item.Year === 'string' &&
        typeof item.imdbID === 'string',
    )
  } catch {
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Movie[]>([])

  const storage = getStorage()

  const persist = () => {
    if (!storage) return
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
    } catch {}
  }

  const ids = computed(() => new Set(favorites.value.map((movie) => movie.imdbID)))

  const isFavorite = (imdbID: string) => ids.value.has(imdbID)

  const add = (movie: Movie) => {
    if (isFavorite(movie.imdbID)) return
    favorites.value = [...favorites.value, movie]
    persist()
  }

  const remove = (imdbID: string) => {
    if (!isFavorite(imdbID)) return
    favorites.value = favorites.value.filter((movie) => movie.imdbID !== imdbID)
    persist()
  }

  const toggle = (movie: Movie) => {
    if (isFavorite(movie.imdbID)) {
      remove(movie.imdbID)
    } else {
      add(movie)
    }
  }

  const loadFromStorage = () => {
    favorites.value = parseStoredMovies(storage?.getItem(STORAGE_KEY) ?? null)
  }

  loadFromStorage()

  return {
    favorites,
    ids,
    isFavorite,
    add,
    remove,
    toggle,
  }
})

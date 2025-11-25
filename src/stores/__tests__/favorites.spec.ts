import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFavoritesStore } from '../favorites'

const STORAGE_KEY = 'movie-explorer:favorites'

const movie = {
  Title: 'Alien',
  Year: '1979',
  imdbID: 'tt0078748',
}

describe('useFavoritesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('loads valid movies from storage while discarding invalid entries', () => {
    const valid = { Title: 'Aliens', Year: '1986', imdbID: 'tt0090605' }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([valid, { wrong: true }, null, { Title: 'No id' }]),
    )

    const store = useFavoritesStore()

    expect(store.favorites).toEqual([valid])
    expect(store.ids.has(valid.imdbID)).toBe(true)
  })

  it('adds unique favorites and persists changes', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const store = useFavoritesStore()

    store.add(movie)

    expect(store.favorites).toEqual([movie])
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([movie]))

    store.add(movie)

    expect(store.favorites).toHaveLength(1)
    expect(setItemSpy).toHaveBeenCalledTimes(1)

    store.remove(movie.imdbID)

    expect(store.favorites).toHaveLength(0)
    expect(setItemSpy).toHaveBeenCalledTimes(2)
  })

  it('toggles favorites on and off', () => {
    const store = useFavoritesStore()

    store.toggle(movie)
    expect(store.isFavorite(movie.imdbID)).toBe(true)

    store.toggle(movie)
    expect(store.isFavorite(movie.imdbID)).toBe(false)
  })
})

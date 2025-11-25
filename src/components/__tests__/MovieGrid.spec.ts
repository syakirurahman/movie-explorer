import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'

import MovieGrid from '../MovieGrid.vue'
import type { Movie } from '@/services/movies'
import { useFavoritesStore } from '@/stores/favorites'
import { useMessagesStore } from '@/stores/messages'

const vuetify = createVuetify({ components, directives })

const sampleMovies: Movie[] = [
  { Title: 'Inception', Year: '2010', imdbID: 'tt1375666' },
  { Title: 'Interstellar', Year: '2014', imdbID: 'tt0816692' },
]

const mountMovieGrid = (props: { movies: Movie[]; loading?: boolean }) =>
  mount(MovieGrid, {
    props,
    global: {
      plugins: [vuetify],
      stubs: {
        transition: false,
        teleport: true,
      },
    },
  })

describe('MovieGrid', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders skeleton cards while loading', () => {
    const wrapper = mountMovieGrid({ movies: [], loading: true })

    expect(wrapper.findAll('.movie-card')).toHaveLength(10)
    expect(wrapper.findAll('.poster.skeleton')).toHaveLength(10)
  })

  it('renders movie cards with details', () => {
    const wrapper = mountMovieGrid({ movies: sampleMovies, loading: false })

    expect(wrapper.findAll('.movie-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('Inception')
    expect(wrapper.text()).toContain('(2014)')

    const imdbLink = wrapper.get('.imdb-link')
    expect(imdbLink.attributes('href')).toBe('https://www.imdb.com/title/tt1375666')
  })

  it('toggles favorites and posts messages when clicking the star', async () => {
    const favorites = useFavoritesStore()
    const messages = useMessagesStore()
    const toggleSpy = vi.spyOn(favorites, 'toggle')
    const messageSpy = vi.spyOn(messages, 'addMessage')

    const wrapper = mountMovieGrid({ movies: [sampleMovies[0]!], loading: false })

    const favoriteButton = wrapper.get('button[aria-label="Favorite"]')

    await favoriteButton.trigger('click')
    await nextTick()

    expect(toggleSpy).toHaveBeenCalledWith(sampleMovies[0])
    expect(messageSpy).toHaveBeenLastCalledWith('Inception added to favorites', 'success')
    expect(favoriteButton.attributes('aria-label')).toBe('Unfavorite')

    await favoriteButton.trigger('click')
    await nextTick()

    expect(messageSpy).toHaveBeenLastCalledWith('Inception removed from favorites', 'warning')
    expect(favoriteButton.attributes('aria-label')).toBe('Favorite')
  })
})

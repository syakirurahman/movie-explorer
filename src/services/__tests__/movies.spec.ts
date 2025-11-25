import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const loadService = async () => import('../movies')

describe('searchMovies', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('builds the query string and returns movie data', async () => {
    const mockResponse = {
      page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
      data: [{ Title: 'Alien', Year: '1979', imdbID: 'tt0078748' }],
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })
    vi.stubGlobal('fetch', fetchMock)

    const { searchMovies } = await loadService()

    const result = await searchMovies({ title: 'Alien', year: '1979', page: 1 })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://jsonmock.hackerrank.com/api/movies/search?Title=Alien&Year=1979&page=1',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(result).toEqual(mockResponse)
  })

  it('throws a MovieApiError when the API returns a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { searchMovies, MovieApiError } = await loadService()

    const promise = searchMovies({ title: 'Bad' })

    await expect(promise).rejects.toBeInstanceOf(MovieApiError)
    await expect(promise).rejects.toMatchObject({
      message: 'Failed to fetch movies',
      status: 500,
    })
  })

  it('rejects when the request times out', async () => {
    vi.useFakeTimers()

    const fetchMock = vi.fn((_, init?: RequestInit) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const { searchMovies, MovieApiError } = await loadService()

    const promise = searchMovies({ title: 'Slow' })
    const handled = promise.catch(() => {})

    await vi.advanceTimersByTimeAsync(10000)

    await expect(promise).rejects.toBeInstanceOf(MovieApiError)
    await expect(promise).rejects.toHaveProperty('message', 'Request timed out')
    await handled
    await vi.runAllTimersAsync()
  })

  it('discards stale responses if a newer request was made', async () => {
    const resolvers: Array<(value: unknown) => void> = []

    const fetchMock = vi.fn(() => {
      return new Promise((resolve) => resolvers.push(resolve))
    })
    vi.stubGlobal('fetch', fetchMock)

    const { searchMovies, MovieApiError } = await loadService()

    const firstPromise = searchMovies({ title: 'First' })
    const secondPromise = searchMovies({ title: 'Second' })

    expect(resolvers).toHaveLength(2)

    resolvers[0]!({
      ok: true,
      json: async () => ({
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [{ Title: 'First', Year: '2000', imdbID: 'tt0000001' }],
      }),
    })

    resolvers[1]!({
      ok: true,
      json: async () => ({
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [{ Title: 'Second', Year: '2001', imdbID: 'tt0000002' }],
      }),
    })

    await expect(firstPromise).rejects.toBeInstanceOf(MovieApiError)
    await expect(firstPromise).rejects.toHaveProperty('message', 'Stale response discarded')
    await expect(secondPromise).resolves.toMatchObject({
      data: [{ Title: 'Second', Year: '2001', imdbID: 'tt0000002' }],
    })
  })
})

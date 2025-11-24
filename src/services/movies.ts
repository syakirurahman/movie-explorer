export interface Movie {
  Title: string
  Year: string
  imdbID: string
}

export interface MovieSearchParams {
  title?: string
  year?: string
  imdbID?: string
  page?: number
}

export interface MovieSearchResponse {
  page: number
  per_page: number
  total: number
  total_pages: number
  data: Movie[]
}

export class MovieApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'MovieApiError'
  }
}

const BASE_URL = 'https://jsonmock.hackerrank.com/api/movies/search'
const REQUEST_TIMEOUT_MS = 10000

const buildQuery = (params: MovieSearchParams): string => {
  const search = new URLSearchParams()

  if (params.title) search.set('Title', params.title)
  if (params.year) search.set('Year', params.year)
  if (params.imdbID) search.set('imdbID', params.imdbID)
  search.set('page', String(params.page ?? 1))

  return search.toString()
}

let lastRequestId = 0

export const searchMovies = async (params: MovieSearchParams): Promise<MovieSearchResponse> => {
  const query = buildQuery(params)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const requestId = ++lastRequestId

  try {
    const res = await fetch(`${BASE_URL}?${query}`, {
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new MovieApiError('Failed to fetch movies', res.status)
    }

    const data = (await res.json()) as MovieSearchResponse

    if (requestId !== lastRequestId) {
      throw new MovieApiError('Stale response discarded')
    }

    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new MovieApiError('Request timed out')
    }
    if (error instanceof MovieApiError) {
      throw error
    }
    throw new MovieApiError(error instanceof Error ? error.message : 'Unknown error')
  } finally {
    clearTimeout(timeout)
  }
}

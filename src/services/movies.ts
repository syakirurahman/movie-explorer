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

const BASE_URL = 'https://jsonmock.hackerrank.com/api/movies/search'

const buildQuery = (params: MovieSearchParams): string => {
  const search = new URLSearchParams()

  if (params.title) search.set('Title', params.title)
  if (params.year) search.set('Year', params.year)
  if (params.imdbID) search.set('imdbID', params.imdbID)
  search.set('page', String(params.page ?? 1))

  return search.toString()
}

export const searchMovies = async (
  params: MovieSearchParams,
): Promise<MovieSearchResponse> => {
  const query = buildQuery(params)
  const res = await fetch(`${BASE_URL}?${query}`)

  if (!res.ok) {
    throw new Error('Failed to fetch movies')
  }

  const data = (await res.json()) as MovieSearchResponse
  return data
}

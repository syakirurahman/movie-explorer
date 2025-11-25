import { test, expect } from '@playwright/test'

const STORAGE_KEY = 'movie-explorer:favorites'

const sampleMovies = [
  { Title: 'Alpha Movie', Year: '1999', imdbID: 'tt0100001' },
  { Title: 'Beta Movie', Year: '2000', imdbID: 'tt0100002' },
]

test.describe('Favorites flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          per_page: 10,
          total: sampleMovies.length,
          total_pages: 1,
          data: sampleMovies,
        }),
      })
    })
  })

  test('favoriting from home shows snackbar, marks card, and lists in favorites page', async ({
    page,
  }) => {
    await page.goto('/')

    const alphaCard = page.locator('.movie-card', { hasText: 'Alpha Movie' })
    await expect(alphaCard).toBeVisible()

    await alphaCard.hover()
    await alphaCard.getByRole('button', { name: 'Favorite' }).click()

    await expect(page.locator('.v-snackbar')).toContainText('Alpha Movie added to favorites')
    await expect(alphaCard.getByRole('button', { name: 'Unfavorite' })).toBeVisible()

    await page.getByRole('link', { name: /Favorites/ }).click()

    const favoritesCard = page.locator('.movie-card', { hasText: 'Alpha Movie' })
    await expect(favoritesCard).toBeVisible()
  })

  test('unfavoriting from home shows snackbar, removes marker, and unlists from favorites', async ({
    page,
  }) => {
    await page.addInitScript(
      ([key, movies]) => localStorage.setItem(key as string, JSON.stringify(movies)),
      [STORAGE_KEY, [sampleMovies[0]]],
    )

    await page.goto('/')

    const alphaCard = page.locator('.movie-card', { hasText: 'Alpha Movie' })
    await expect(alphaCard).toBeVisible()

    await alphaCard.hover()
    await alphaCard.getByRole('button', { name: 'Unfavorite' }).click()

    await expect(page.locator('.v-snackbar')).toContainText('Alpha Movie removed from favorites')
    await expect(alphaCard.getByRole('button', { name: 'Favorite' })).toBeVisible()

    await page.getByRole('link', { name: /Favorites/ }).click()
    await expect(page.locator('.movie-card', { hasText: 'Alpha Movie' })).toHaveCount(0)
  })

  test('unfavoriting from favorites page removes favorited movie and shows snackbar', async ({
    page,
  }) => {
    await page.addInitScript(
      ([key, movies]) => localStorage.setItem(key as string, JSON.stringify(movies)),
      [STORAGE_KEY, [sampleMovies[0], sampleMovies[1]]],
    )

    await page.goto('/favorites')

    const alphaCard = page.locator('.movie-card', { hasText: 'Alpha Movie' })
    await expect(alphaCard).toBeVisible()

    await alphaCard.hover()
    await alphaCard.getByRole('button', { name: 'Unfavorite' }).click()

    await expect(page.locator('.v-snackbar')).toContainText('Alpha Movie removed from favorites')
    await expect(page.locator('.movie-card', { hasText: 'Alpha Movie' })).toHaveCount(0)
  })

  test('loads existing favorites with saved count', async ({ page }) => {
    await page.addInitScript(
      ([key, movies]) => localStorage.setItem(key as string, JSON.stringify(movies)),
      [STORAGE_KEY, [sampleMovies[0], sampleMovies[1]]],
    )

    await page.goto('/favorites')

    await expect(page.locator('.movie-card')).toHaveCount(2)
    await expect(page.locator('.v-chip')).toContainText('2 saved')
  })

  test('loads favorites page with no saved movies', async ({ page }) => {
    await page.addInitScript(
      ([key]) => localStorage.setItem(key, JSON.stringify([])),
      [STORAGE_KEY],
    )

    await page.goto('/favorites')

    await expect(
      page.getByText('No favorites yet. Mark some movies with the star to collect them here.'),
    ).toBeVisible()
    await expect(page.locator('.movie-card')).toHaveCount(0)
    await expect(page.locator('.v-chip')).toContainText('0 saved')
  })
})

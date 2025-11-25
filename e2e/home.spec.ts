import { test, expect } from '@playwright/test'

test.describe('Home page smoke', () => {
  test('loads layout, navigation and movie list', async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          per_page: 10,
          total: 2,
          total_pages: 1,
          data: [
            { Title: 'Alpha Movie', Year: '1999', imdbID: 'tt0100001' },
            { Title: 'Beta Movie', Year: '2000', imdbID: 'tt0100002' },
          ],
        }),
      })
    })

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Movie Explorer' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Browse Movies' })).toBeVisible()

    await expect(page.getByRole('link', { name: /Home/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Favorites/ })).toBeVisible()

    const movieCards = page.locator('.movie-card')
    await expect(movieCards).toHaveCount(2)
    await expect(movieCards.filter({ hasText: 'Alpha Movie' }).first()).toBeVisible()
    await expect(movieCards.filter({ hasText: 'Beta Movie' }).first()).toBeVisible()
  })
})

test.describe('Home page search', () => {
  test('searches by title and shows results', async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      const url = new URL(route.request().url())
      const title = url.searchParams.get('Title') || ''

      if (title.toLowerCase() === 'zeta') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            page: 1,
            per_page: 10,
            total: 2,
            total_pages: 1,
            data: [
              { Title: 'Zeta One', Year: '2001', imdbID: 'tt0000001' },
              { Title: 'Zeta Two', Year: '2002', imdbID: 'tt0000002' },
            ],
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          per_page: 10,
          total: 0,
          total_pages: 1,
          data: [],
        }),
      })
    })

    await page.goto('/')

    const titleInput = page.getByPlaceholder('e.g. Harry')

    await expect(titleInput).toBeVisible()

    await titleInput.fill('Zeta')

    const movieCards = page.locator('.movie-card')
    await expect(movieCards.filter({ hasText: 'Zeta One' }).first()).toBeVisible()
    await expect(movieCards.filter({ hasText: 'Zeta Two' }).first()).toBeVisible()
  })

  test('shows empty state when no results', async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          per_page: 10,
          total: 0,
          total_pages: 1,
          data: [],
        }),
      })
    })

    await page.goto('/')

    const titleInput = page.getByPlaceholder('e.g. Harry')
    await expect(titleInput).toBeVisible()

    await titleInput.fill('NoMatch')

    const emptyState = page.getByText('No movies found. Adjust filters and try again.')
    await expect(emptyState).toBeVisible()
  })

  test('shows alert and snackbar on API error', async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })

    await page.goto('/')

    const alert = page.getByRole('alert')
    await expect(alert).toContainText('Error fetching movies')
    await expect(alert).toContainText('Failed to fetch movies')

    const snackbar = page.locator('.v-snackbar')
    await expect(snackbar).toContainText('Failed to fetch movies')
  })

  test('resets filters and clears results', async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      const url = new URL(route.request().url())
      const title = (url.searchParams.get('Title') || '').trim()

      const unfiltered = {
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: [
          { Title: 'Default Alpha', Year: '1990', imdbID: 'tt0111111' },
          { Title: 'Default Beta', Year: '1991', imdbID: 'tt0222222' },
        ],
      }
      const populated = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [{ Title: 'Reset Movie', Year: '2001', imdbID: 'tt0999999' }],
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(title ? populated : unfiltered),
      })
    })

    await page.goto('/')

    const titleInput = page.getByPlaceholder('e.g. Harry')
    await expect(titleInput).toBeVisible()

    await titleInput.fill('Reset')

    const movieCards = page.locator('.movie-card')
    await expect(movieCards.filter({ hasText: 'Reset Movie' }).first()).toBeVisible()

    const resetButton = page.getByRole('button', { name: 'Reset' })
    await expect(resetButton).toBeVisible()

    await resetButton.click()

    await expect(titleInput).toHaveValue('')
    await expect(resetButton).toBeHidden()

    await expect(movieCards.filter({ hasText: 'Reset Movie' }).first()).toBeHidden()
    await expect(movieCards.filter({ hasText: 'Default Alpha' }).first()).toBeVisible()
    await expect(movieCards.filter({ hasText: 'Default Beta' }).first()).toBeVisible()
  })
})

test.describe('Home page pagination', () => {
  test('paginates search results', async ({ page }) => {
    await page.route('**/movies/search**', async (route) => {
      const url = new URL(route.request().url())
      const title = url.searchParams.get('Title') || ''
      const pageParam = Number(url.searchParams.get('page') || '1')

      if (title.toLowerCase() === 'zeta') {
        const page1 = {
          page: 1,
          per_page: 1,
          total: 2,
          total_pages: 2,
          data: [{ Title: 'Zeta One', Year: '2001', imdbID: 'tt0000001' }],
        }
        const page2 = {
          page: 2,
          per_page: 1,
          total: 2,
          total_pages: 2,
          data: [{ Title: 'Zeta Three', Year: '2003', imdbID: 'tt0000003' }],
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(pageParam === 2 ? page2 : page1),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          page: 1,
          per_page: 10,
          total: 0,
          total_pages: 1,
          data: [],
        }),
      })
    })

    await page.goto('/')

    const titleInput = page.getByPlaceholder('e.g. Harry')

    await expect(titleInput).toBeVisible()

    await titleInput.fill('Zeta')

    const paginationNav = page.getByRole('navigation')
    const pageTwoButton = paginationNav.getByRole('button', { name: '2' }).first()

    await expect(pageTwoButton).toBeVisible()

    const movieCards = page.locator('.movie-card')
    await expect(movieCards.filter({ hasText: 'Zeta One' }).first()).toBeVisible()

    await pageTwoButton.click()

    await expect(movieCards.filter({ hasText: 'Zeta One' }).first()).toBeHidden()
    await expect(movieCards.filter({ hasText: 'Zeta Three' }).first()).toBeVisible()
  })
})

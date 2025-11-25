# Movie Explorer

Movie Explorer is a Vue 3 single-page app for searching movies, paging through results, and saving favorites.

## Features

- Search by title, year, or IMDb ID with debounced requests.
- Paginated results with loading skeletons and graceful error handling.
- Responsive card grid with IMDb links.
- Favorite/unfavorite movies with toast feedback and local persistence.
- Dedicated favorites view to review saved movies.

## Project Setup

Install dependencies:

```sh
pnpm install
```

Run the project:

```sh
pnpm dev
```

Run unit tests:

```sh
pnpm test:unit
```

Run end-to-end tests (Playwright):

```sh
# Install browsers once
pnpm dlx playwright install

# Build first on CI
pnpm build

# Run the suite
pnpm test:e2e
```

## Tech Stack Used

- Vue 3, TypeScript, Vite
- Vuetify for UI components and styling
- Pinia for state, Vue Router for routing
- Vitest + Vue Test Utils for unit testing
- Playwright for end-to-end testing
- ESLint and Prettier for linting/formatting; Sass for styles

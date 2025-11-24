<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import FilterBar, { type MovieFilters } from '@/components/FilterBar.vue'
import MovieGrid from '@/components/MovieGrid.vue'
import { MovieApiError, searchMovies, type Movie } from '@/services/movies'
import { useMessagesStore } from '@/stores/messages'

const messages = useMessagesStore()

const filters = reactive<MovieFilters>({
  title: '',
  year: '',
  imdbID: '',
})

const movies = ref<Movie[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const total = ref(0)
let isDestroyed = false

const runSearch = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await searchMovies({
      title: filters.title?.trim(),
      year: filters.year?.trim(),
      imdbID: filters.imdbID?.trim(),
      page: page.value,
    })

    if (isDestroyed) return

    movies.value = response.data
    totalPages.value = response.total_pages || 1
    total.value = response.total || 0
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong'

    if (err instanceof MovieApiError && err.message === 'Stale response discarded') return

    error.value = message
    messages.addMessage(message, 'error')
    movies.value = []
  } finally {
    if (isDestroyed) return
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  runSearch()
}

const handleReset = () => {
  filters.title = ''
  filters.year = ''
  filters.imdbID = ''
  page.value = 1
  runSearch()
}

const handlePage = (value: number) => {
  page.value = value
  runSearch()
}

onMounted(() => {
  runSearch()
})

onBeforeUnmount(() => {
  isDestroyed = true
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <div>
        <h2>Browse Movies</h2>
        <p class="text-muted">Search by title, year, or IMDb ID to find something to watch.</p>
      </div>
    </header>

    <FilterBar
      :filters="filters"
      :loading="loading"
      @update:filters="(val) => Object.assign(filters, val)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div>
      <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        border="start"
        title="Error fetching movies"
        class="mb-4"
      >
        {{ error }}
        <template #append>
          <VBtn color="error" variant="text" size="small" @click="runSearch">Retry</VBtn>
        </template>
      </VAlert>

      <div v-if="!error && !loading && movies.length === 0" class="empty">
        <p>No movies found. Adjust filters and try again.</p>
      </div>

      <MovieGrid :movies="movies" :loading="loading" />

      <div class="pagination" v-if="totalPages > 1">
        <div class="result-note">
          Displaying {{ movies.length }} of {{ total }} movie<span v-if="total !== 1">s</span>
        </div>
        <VPagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          color="primary"
          density="comfortable"
          @update:model-value="handlePage"
        />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.result-note {
  color: #5c6b80;
  padding: 8px 0;
}

.pagination {
  padding-top: 16px;
  display: flex;
  width: 100%;
  gap: 16px;
  justify-content: space-between;
}

.chip-spin {
  .v-icon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import FilterBar, { type MovieFilters } from '@/components/FilterBar.vue'
import MovieGrid from '@/components/MovieGrid.vue'
import { searchMovies, type Movie } from '@/services/movies'
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

    movies.value = response.data
    totalPages.value = response.total_pages || 1
    total.value = response.total || 0
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong'
    messages.addMessage(error.value, 'error')
    movies.value = []
  } finally {
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
</script>

<template>
  <main class="page">
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
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .result-note {
    color: #5c6b80;
    padding: 8px 0;
  }

  .empty {
    text-align: center;
    padding: 32px 12px;
    color: #5c6b80;
    border: 1px dashed var(--ui-border);
    border-radius: 6px;
    margin-bottom: 12px;
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
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

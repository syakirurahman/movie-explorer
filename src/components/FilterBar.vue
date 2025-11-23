<script setup lang="ts">
import { mdiRestore } from '@mdi/js'
import { computed, onBeforeUnmount, watch } from 'vue'

export interface MovieFilters {
  title: string
  year: string
  imdbID: string
}

const props = defineProps<{
  filters: MovieFilters
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:filters', value: MovieFilters): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const filtersModel = computed({
  get: () => props.filters,
  set: (val) => emit('update:filters', val),
})

const handleReset = () => emit('reset')

let searchTimer: ReturnType<typeof setTimeout> | null = null

const scheduleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => emit('search'), 500)
}

watch(filtersModel, scheduleSearch, { deep: true })

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<template>
  <div class="filter">
    <form @submit.prevent>
      <div>
        <VTextField
          v-model="filtersModel.title"
          label="Title"
          density="compact"
          variant="outlined"
          placeholder="e.g. Harry"
          clearable
          width="300"
        />
        <VTextField
          v-model="filtersModel.year"
          label="Year"
          density="compact"
          variant="outlined"
          placeholder="1998"
          clearable
          type="number"
          min="1900"
          max="2100"
          width="150"
        />
        <VTextField
          v-model="filtersModel.imdbID"
          label="IMDb ID"
          density="compact"
          variant="outlined"
          placeholder="tt1234567"
          clearable
          width="200"
        />
      </div>

      <div class="actions" v-if="filters.imdbID || filters.title || filters.year">
        <VBtn
          variant="tonal"
          color="red"
          size="large"
          height="40px"
          :prepend-icon="mdiRestore"
          :disabled="loading"
          @click.prevent="handleReset"
        >
          Reset
        </VBtn>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.filter {
  padding: 16px 0 0;
  form {
    display: flex;
    gap: 12px;
    align-items: start;
    > div {
      display: flex;
      gap: 12px;
    }
  }
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

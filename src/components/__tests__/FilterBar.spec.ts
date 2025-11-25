import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VTextField, VBtn } from 'vuetify/components'

import FilterBar, { type MovieFilters } from '../FilterBar.vue'

const vuetify = createVuetify({ components, directives })

const mountFilterBar = (filters: MovieFilters, loading = false) =>
  mount(FilterBar, {
    props: {
      filters,
      loading,
    },
    global: {
      plugins: [vuetify],
      stubs: {
        transition: false,
        teleport: true,
      },
    },
  })

describe('FilterBar', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders provided filter values in the inputs', () => {
    const filters: MovieFilters = {
      title: 'Harry Potter',
      year: '2001',
      imdbID: 'tt0241527',
    }

    const wrapper = mountFilterBar(filters)

    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(3)
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('Harry Potter')
    expect((inputs[1]!.element as HTMLInputElement).value).toBe('2001')
    expect((inputs[2]!.element as HTMLInputElement).value).toBe('tt0241527')
  })

  it('updates filter object when fields change', async () => {
    const filters: MovieFilters = {
      title: '',
      year: '',
      imdbID: '',
    }

    const wrapper = mountFilterBar(filters)
    const [titleField, yearField, imdbField] = wrapper.findAllComponents(VTextField)

    await titleField!.vm.$emit('update:modelValue', 'The Matrix')
    await yearField!.vm.$emit('update:modelValue', '1999')
    await imdbField!.vm.$emit('update:modelValue', 'tt0133093')

    expect(filters).toMatchObject({ title: 'The Matrix', year: '1999', imdbID: 'tt0133093' })
  })

  it('debounces search emission when filters change', async () => {
    vi.useFakeTimers()
    const wrapper = mountFilterBar({ title: '', year: '', imdbID: '' })

    await wrapper.setProps({ filters: { title: 'Alien', year: '', imdbID: '' } })
    await wrapper.setProps({ filters: { title: 'Alien', year: '1979', imdbID: '' } })

    expect(wrapper.emitted('search')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(500)

    expect(wrapper.emitted('search')).toHaveLength(1)
  })

  it('shows and triggers reset when filters are populated', async () => {
    const wrapper = mountFilterBar({ title: 'Blade Runner', year: '', imdbID: '' })

    const resetButton = wrapper.findComponent<typeof VBtn>(VBtn)
    expect(resetButton.exists()).toBe(true)

    await resetButton.trigger('click')

    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})

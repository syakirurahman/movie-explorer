import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessagesStore } from '../messages'

describe('useMessagesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('adds messages with incrementing ids and colors, trimming to the max queue size', () => {
    const store = useMessagesStore()
    const now = new Date('2024-01-01T00:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    store.addMessage('a', 'success')
    store.addMessage('b', 'info')
    store.addMessage('c', 'warning')
    store.addMessage('d', 'error')
    store.addMessage('e', 'success')
    store.addMessage('f', 'warning')

    expect(store.queue).toHaveLength(5)
    expect(store.queue[0]).toMatchObject({ id: 2, text: 'b', color: 'info' })
    expect(store.queue.at(-1)).toMatchObject({ id: 6, text: 'f', color: 'warning' })
    expect(store.queue.every((item) => item.createdAt === now)).toBe(true)
  })

  it('removes a message by id', () => {
    const store = useMessagesStore()

    store.addMessage('keep')
    store.addMessage('remove-me')
    const idToRemove = store.queue[1]!.id

    store.remove(idToRemove)

    expect(store.queue.map((m) => m.text)).toEqual(['keep'])
  })

  it('clears the queue', () => {
    const store = useMessagesStore()
    store.addMessage('one')
    store.addMessage('two')

    store.clear()

    expect(store.queue).toHaveLength(0)
  })
})

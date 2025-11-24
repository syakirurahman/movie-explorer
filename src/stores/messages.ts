import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SnackbarQueueMessage } from 'vuetify'

export type MessageVariant = 'success' | 'info' | 'warning' | 'error'

const variantToColor: Record<MessageVariant, string> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
}

type Message = SnackbarQueueMessage & {
  id: number
  createdAt: number
}

const MAX_QUEUE = 5

export const useMessagesStore = defineStore('messages', () => {
  const queue = ref<Message[]>([])
  let idCounter = 0

  const addMessage = (text: string, variant: MessageVariant = 'info') => {
    const message: Message = {
      id: ++idCounter,
      createdAt: Date.now(),
      text,
      color: variantToColor[variant],
    }

    queue.value = [...queue.value.slice(-(MAX_QUEUE - 1)), message]
  }

  const remove = (id: number) => {
    queue.value = queue.value.filter((message) => message.id !== id)
  }

  const clear = () => {
    queue.value = []
  }

  return {
    queue,
    addMessage,
    remove,
    clear,
  }
})

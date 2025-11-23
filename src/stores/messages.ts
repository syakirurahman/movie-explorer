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

export const useMessagesStore = defineStore('messages', () => {
  const queue = ref<SnackbarQueueMessage[]>([])

  const addMessage = (text: string, variant: MessageVariant = 'info') => {
    queue.value.push({
      text,
      color: variantToColor[variant],
    })
  }

  const clear = () => {
    queue.value = []
  }

  return {
    queue,
    addMessage,
    clear,
  }
})

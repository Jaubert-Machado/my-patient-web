'use client'

import { useState } from 'react'
import { getAuthHeaders } from '@/lib/auth'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UseChatOptions {
  endpoint: string
  messages?: Message[]
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>
  extraBody?: Record<string, unknown>
}

export function useChat({
  endpoint,
  messages: externalMessages,
  setMessages: externalSetMessages,
  extraBody,
}: UseChatOptions) {
  const [internalMessages, setInternalMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const messages = externalMessages ?? internalMessages
  const setMessages = externalSetMessages ?? setInternalMessages

  function setLastContent(content: string) {
    setMessages((prev) => {
      const updated = [...prev]
      updated[updated.length - 1] = { ...updated[updated.length - 1], content }
      return updated
    })
  }

  function appendToLast(text: string) {
    setMessages((prev) => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      updated[updated.length - 1] = { ...last, content: last.content + text }
      return updated
    })
  }

  async function sendMessage(text: string) {
    const history = [...messages, { role: 'user' as const, content: text }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ messages: history, ...extraBody }),
      })

      if (!res.ok || !res.body) {
        setLastContent('Ocorreu um erro ao processar sua mensagem.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6).trim())
            if (event.type === 'text') appendToLast(event.text)
            if (event.type === 'done' || event.type === 'error') break
          } catch {
            // linha incompleta
          }
        }
      }
    } catch {
      setLastContent('Ocorreu um erro ao processar sua mensagem.')
    } finally {
      setIsStreaming(false)
    }
  }

  return { messages, isStreaming, sendMessage }
}

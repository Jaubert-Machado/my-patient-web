'use client'

import { cn } from '@/lib/utils'
import { useChat, type Message } from './use-chat'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'

export interface ChatWindowProps {
  endpoint: string
  className?: string
  messages?: Message[]
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>
  disabled?: boolean
  extraBody?: Record<string, unknown>
  markdown?: boolean
}

export function ChatWindow({
  endpoint,
  className,
  messages,
  setMessages,
  disabled,
  extraBody,
  markdown,
}: ChatWindowProps) {
  const {
    messages: chatMessages,
    isStreaming,
    sendMessage,
  } = useChat({ endpoint, messages, setMessages, extraBody })

  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      <MessageList messages={chatMessages} markdown={markdown} />
      <ChatInput onSend={sendMessage} disabled={isStreaming || disabled} />
    </div>
  )
}

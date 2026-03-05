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
}

export function ChatWindow({
  endpoint,
  className,
  messages,
  setMessages,
  disabled,
  extraBody,
}: ChatWindowProps) {
  const {
    messages: chatMessages,
    isStreaming,
    sendMessage,
  } = useChat({ endpoint, messages, setMessages, extraBody })

  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      <MessageList messages={chatMessages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming || disabled} />
    </div>
  )
}

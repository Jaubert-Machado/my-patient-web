'use client'

import { useState, useEffect, useRef, type KeyboardEvent, type SubmitEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus()
    }
  }, [disabled])

  function submit() {
    const text = input.trim()
    if (!text || disabled) return
    onSend(text)
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    submit()
  }

  return (
    <div className="p-3">
      <form
        onSubmit={handleSubmit}
        className="bg-background/60 border-border/50 mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border px-3 py-2 backdrop-blur-sm"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="max-h-15 min-h-9 flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-xl"
          disabled={!input.trim() || disabled}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}

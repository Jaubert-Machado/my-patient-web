'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Bot, User, Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from './use-chat'

interface MessageBubbleProps {
  message: Message
  userIcon?: LucideIcon
  assistantIcon?: LucideIcon
  markdown?: boolean
}

function renderMarkdownContent(content: string) {
  const lines = content.split('\n').filter((l) => l.trim() !== '')
  const items = lines.filter((l) => l.trimStart().startsWith('- '))
  const others = lines.filter((l) => !l.trimStart().startsWith('- '))

  return (
    <>
      {others.map((line, i) => (
        <p key={i} className="mb-1">
          {line}
        </p>
      ))}
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
              <span>{item.replace(/^-\s*/, '')}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function MessageBubble({
  message,
  userIcon: UserIcon = User,
  assistantIcon: AssistantIcon = Bot,
  markdown,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const bubbleBoxRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animatedCountRef = useRef(0)

  useGSAP(() => {
    if (!bubbleBoxRef.current) return
    gsap.from(bubbleBoxRef.current, {
      scale: 0.7,
      opacity: 0,
      duration: 0.35,
      ease: 'back.out(2)',
      transformOrigin: isUser ? 'right center' : 'left center',
    })
  }, [])

  const words = message.content ? message.content.split(' ') : []

  useGSAP(
    () => {
      if (!contentRef.current || !message.content) return
      const spans = contentRef.current.querySelectorAll<HTMLSpanElement>('.word-span')
      const newSpans = Array.from(spans).slice(animatedCountRef.current)
      if (newSpans.length === 0) return
      gsap.from(newSpans, {
        opacity: 0,
        y: 5,
        duration: 0.2,
        ease: 'power2.out',
        stagger: 0.03,
      })
      animatedCountRef.current = spans.length
    },
    { dependencies: [message.content], revertOnUpdate: false }
  )

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <UserIcon className="h-4 w-4" /> : <AssistantIcon className="h-4 w-4" />}
      </div>

      <div
        ref={bubbleBoxRef}
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        {words.length > 0 ? (
          <div ref={contentRef}>
            {markdown ? (
              renderMarkdownContent(message.content)
            ) : (
              words.map((word, i) => (
                <span key={i} className="word-span inline">
                  {word}
                  {i < words.length - 1 && ' '}
                </span>
              ))
            )}
          </div>
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin opacity-50" />
        )}
      </div>
    </div>
  )
}

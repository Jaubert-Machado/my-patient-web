'use client'

import { useRef, useEffect } from 'react'
import { Bot } from 'lucide-react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { MessageBubble } from './message-bubble'
import { SelectionPopover } from './selection-popover'
import type { Message } from './use-chat'

export function MessageList({ messages, markdown }: { messages: Message[]; markdown?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content) return

    const lenis = new Lenis({ wrapper, content, lerp: 0.08 })
    lenisRef.current = lenis

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lenis.resize()
        lenis.scrollTo(Infinity, { duration: 0.9 })
      })
    })

    return () => cancelAnimationFrame(id)
  }, [messages])

  return (
    <div ref={wrapperRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <SelectionPopover containerRef={contentRef} />
      <div ref={contentRef} className="mx-auto max-w-2xl space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bot className="text-muted-foreground/40 mb-4 h-10 w-10" />
            <p className="text-muted-foreground text-sm">Como posso ajudar hoje?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} markdown={markdown} />
        ))}
      </div>
    </div>
  )
}

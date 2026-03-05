'use client'

import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Bot, Stethoscope, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LabSheet } from '@/components/chat/lab-sheet'
import { type Dispatch, type SetStateAction } from 'react'
import type { Message } from '@/components/chat'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  labMessages: Message[]
  setLabMessages: Dispatch<SetStateAction<Message[]>>
  onFinish: () => void
  onToggleFicha: () => void
  isFinished: boolean
  hasMessages: boolean
  isStarted: boolean
  isFichaOpen: boolean
  patientName?: string | null
}

export function ChatHeader({
  labMessages,
  setLabMessages,
  onFinish,
  onToggleFicha,
  isFinished,
  hasMessages,
  isStarted,
  isFichaOpen,
  patientName,
}: ChatHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const dotRingRef = useRef<HTMLSpanElement>(null)
  const labButtonRef = useRef<HTMLDivElement>(null)
  const finishButtonRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)
  const statusInitialized = useRef(false)
  const [displayedStatus, setDisplayedStatus] = useState(
    isFinished ? 'Atendimento encerrado' : isStarted ? 'Em atendimento' : 'Aguardando atendimento',
  )

  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
    },
    { scope: containerRef, dependencies: [] },
  )

  useGSAP(
    () => {
      if (!isFinished && isStarted) {
        gsap.to(dotRingRef.current, {
          scale: 2,
          opacity: 0,
          duration: 1.4,
          repeat: -1,
          ease: 'power2.out',
        })
      }
    },
    { scope: containerRef, dependencies: [isFinished, isStarted] },
  )

  useEffect(() => {
    const next = isFinished ? 'Atendimento encerrado' : isStarted ? 'Em atendimento' : 'Aguardando atendimento'

    if (!statusInitialized.current) {
      statusInitialized.current = true
      return
    }

    gsap.to(statusRef.current, {
      y: 10,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete() {
        setDisplayedStatus(next)
        gsap.fromTo(statusRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' })
      },
    })
  }, [isStarted, isFinished])

  useGSAP(
    () => {
      if (!isStarted) return
      gsap.from([labButtonRef.current, finishButtonRef.current], {
        opacity: 0,
        x: 8,
        duration: 0.25,
        stagger: 0.1,
        ease: 'power2.out',
      })
    },
    { scope: containerRef, dependencies: [isStarted] },
  )

  return (
    <div
      ref={containerRef}
      className="bg-background/70 border-border/50 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        {isStarted && (
            <Button

                variant="outline"
                onClick={onToggleFicha}
                className={cn('rounded-xl', isFichaOpen && 'bg-muted')}
            >
              <FileText className="h-4 w-4" />
              Ficha
            </Button>
        )}
        <div className="bg-muted border-border/60 relative flex h-9 w-9 items-center justify-center rounded-xl border shadow-inner">
          <Bot className="text-foreground/70 h-4 w-4" />
          {!isFinished && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center">
              <span
                ref={dotRingRef}
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  isStarted ? 'bg-emerald-400' : 'bg-amber-400',
                )}
              />
              <span
                ref={dotRef}
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  isStarted ? 'bg-emerald-500' : 'bg-amber-500',
                )}
              />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0">
          <span className="text-foreground text-[13px] font-semibold tracking-tight">
            {patientName ?? 'Paciente'}
          </span>
          <span ref={statusRef} className="text-muted-foreground block text-[11px]">
            {displayedStatus}
          </span>
        </div>

      </div>
      {isStarted && (
        <div className="flex items-center gap-2">
          <div ref={labButtonRef}>
            <LabSheet messages={labMessages} setMessages={setLabMessages} />
          </div>
          <div ref={finishButtonRef}>
            <Button
              size="sm"
              onClick={onFinish}
              disabled={isFinished || !hasMessages}
              className={cn(
                'rounded-xl px-4 text-[13px] font-medium transition-all',
                !isFinished &&
                  hasMessages &&
                  'bg-foreground text-background hover:bg-foreground/85 shadow-sm',
              )}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Finalizar Atendimento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

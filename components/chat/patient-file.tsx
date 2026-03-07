'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Clock, AlertCircle, Stethoscope, Loader2 } from 'lucide-react'
import { PatientAvatar } from '@/components/chat/patient-avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PatientFicha as PatientFichaType } from '@/contexts/session-context'

interface PatientFichaProps {
  ficha: PatientFichaType | null
  isLoading: boolean
  variant?: 'centered' | 'panel'
  onStart: () => void
}

export function PatientFile({ ficha, isLoading, variant = 'centered', onStart }: PatientFichaProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!ficha) return
      if (variant === 'panel') {
        gsap.from(containerRef.current, {
          x: -20,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
        })
      } else {
        gsap.from(containerRef.current, {
          y: 24,
          opacity: 0,
          duration: 0.55,
          ease: 'power3.out',
        })
      }
    },
    { scope: containerRef, dependencies: [ficha, variant] },
  )

  function handleStart() {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -16,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onStart,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!ficha) return null

  if (variant === 'panel') {
    return (
      <div
        ref={containerRef}
        className="bg-background/70 border-border/50 flex w-96 flex-col gap-4 rounded-2xl border p-5 shadow-md backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="bg-muted border-border/60 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-inner">
            <PatientAvatar idade={ficha.idade} sexo={ficha.sexo} size="md" className="text-foreground/70" />
          </div>
          <div>
            <h2 className="text-foreground text-[13px] font-semibold tracking-tight">{ficha.nome}</h2>
            <p className="text-muted-foreground text-[11px]">
              {ficha.idade} anos &middot; {ficha.profissao}
            </p>
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="bg-background/60 border-border/40 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border">
              <AlertCircle className="text-foreground/60 h-3 w-3" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Queixa principal</p>
              <p className="text-foreground text-[13px]">{ficha.queixa_principal}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="bg-background/60 border-border/40 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border">
              <Clock className="text-foreground/60 h-3 w-3" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Duração dos sintomas</p>
              <p className="text-foreground text-[13px]">{ficha.tempo_sintomas}</p>
            </div>
          </div>
        </div>

        <div className="bg-background/40 border-border/30 rounded-xl border px-3 py-2.5">
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Contexto de triagem</p>
          <p className="text-foreground mt-1 text-[12px] leading-relaxed">{ficha.contexto}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-1 items-center justify-center p-6">
      <div className="bg-background/70 border-border/50 w-full max-w-lg space-y-5 rounded-3xl border p-8 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-muted border-border/60 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-inner">
            <PatientAvatar idade={ficha.idade} sexo={ficha.sexo} size="lg" className="text-foreground/70" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">{ficha.nome}</h2>
            <p className="text-muted-foreground text-[13px]">
              {ficha.idade} anos &middot; {ficha.profissao}
            </p>
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-background/60 border-border/40 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
              <AlertCircle className="text-foreground/60 h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">Queixa principal</p>
              <p className="text-foreground text-[15px]">{ficha.queixa_principal}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-background/60 border-border/40 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
              <Clock className="text-foreground/60 h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">Duração dos sintomas</p>
              <p className="text-foreground text-[13px]">{ficha.tempo_sintomas}</p>
            </div>
          </div>
        </div>

        <div className="bg-background/40 border-border/30 rounded-xl border px-4 py-3">
          <p className="text-muted-foreground text-[11px] uppercase tracking-wide">Contexto de triagem</p>
          <p className="text-foreground mt-1 text-[13px] leading-relaxed">{ficha.contexto}</p>
        </div>

        <Button
          className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/85"
          onClick={handleStart}
        >
          <Stethoscope className="h-4 w-4" />
          Iniciar Atendimento
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRouter } from 'next/navigation'
import { ClipboardList, CheckCircle2, AlertCircle, RotateCcw, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useSession } from '@/contexts/session-context'
import { getAuthHeaders } from '@/lib/auth'
import type { Message } from '@/components/chat'

interface EvalCategory {
  nota: number
  comentario: string
}

interface EvaluationResult {
  notas: {
    anamnese: EvalCategory
    exame_fisico: EvalCategory
    raciocinio_clinico: EvalCategory
    conduta: EvalCategory
    comunicacao: EvalCategory
  }
  pontos_positivos: string[]
  pontos_de_melhoria: string[]
  diagnostico_provavel: string
  conduta_esperada: string
  feedback_geral: string
}

const CATEGORY_LABELS: Record<keyof EvaluationResult['notas'], string> = {
  anamnese: 'Anamnese',
  exame_fisico: 'Exame Físico',
  raciocinio_clinico: 'Raciocínio Clínico',
  conduta: 'Conduta',
  comunicacao: 'Comunicação',
}

function ScoreCard({
  label,
  nota,
  comentario,
}: {
  label: string
  nota: number
  comentario: string
}) {
  const color = nota >= 8 ? 'text-emerald-600' : nota >= 6 ? 'text-yellow-600' : 'text-red-600'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${color}`}>{nota}/10</span>
      </div>
      <Progress value={nota * 10} className="h-1.5" />
      <p className="text-muted-foreground text-xs">{comentario}</p>
    </div>
  )
}

export default function AvaliacaoPage() {
  const router = useRouter()
  const { patientMessages, labMessages, isFinished, reset } = useSession()

  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluatorMessages, setEvaluatorMessages] = useState<Message[]>([])
  const [isChatting, setIsChatting] = useState(false)
  const hasEvaluated = useRef(false)
  const sessionRef = useRef({ isFinished, patientMessages, labMessages, router })

  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        y: -16,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
    },
    { scope: containerRef },
  )

  useEffect(() => {
    if (hasEvaluated.current) return
    hasEvaluated.current = true

    const { isFinished, patientMessages, labMessages, router } = sessionRef.current

    if (!isFinished || patientMessages.length === 0) {
      router.replace('/chat')
      return
    }

    async function evaluate() {
      setIsEvaluating(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ patientMessages, labMessages }),
        })

        if (!res.ok || !res.body) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''

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
              if (event.type === 'text') fullText += event.text
              if (event.type === 'done') break
            } catch {}
          }
        }

        try {
          const jsonMatch = fullText.match(/\{[\s\S]*}/)
          if (jsonMatch) setEvaluation(JSON.parse(jsonMatch[0]))
        } catch {}

        const contextContent = `Histórico da consulta:\n\n## Chat com o Paciente\n${JSON.stringify(patientMessages, null, 2)}\n\n## Exames Solicitados ao Laboratório\n${JSON.stringify(labMessages, null, 2)}`
        setEvaluatorMessages([
          { role: 'user', content: contextContent },
          { role: 'assistant', content: fullText },
        ])
      } finally {
        setIsEvaluating(false)
      }
    }

    void evaluate()
  }, [])

  async function handleFollowUp(text: string) {
    const history: Message[] = [...evaluatorMessages, { role: 'user', content: text }]
    setEvaluatorMessages([...history, { role: 'assistant', content: '' }])
    setIsChatting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientMessages,
          labMessages,
          evaluatorMessages: history,
        }),
      })

      if (!res.ok || !res.body) {
        setEvaluatorMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: 'Erro ao processar.',
          }
          return updated
        })
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
            if (event.type === 'text') {
              setEvaluatorMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                updated[updated.length - 1] = { ...last, content: last.content + event.text }
                return updated
              })
            }
            if (event.type === 'done' || event.type === 'error') break
          } catch {}
        }
      }
    } finally {
      setIsChatting(false)
    }
  }

  function handleReset() {
    reset()
    router.push('/chat')
  }

  const followUpMessages = evaluatorMessages.slice(2)

  const avgScore = evaluation
    ? Math.round(
        Object.values(evaluation.notas).reduce((sum, c) => sum + c.nota, 0) /
          Object.values(evaluation.notas).length,
      )
    : 0

  return (
    <div className="flex h-screen flex-col gap-4 p-6">
      <div
        ref={containerRef}
        className="bg-background/70 border-border/50 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="bg-muted border-border/60 flex h-9 w-9 items-center justify-center rounded-xl border shadow-inner">
            <ClipboardList className="text-foreground/70 h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-foreground text-[13px] font-semibold tracking-tight">
              Avaliação do Atendimento
            </span>
            <span className="text-muted-foreground text-[11px]">
              {isEvaluating ? 'Analisando...' : evaluation ? 'Análise concluída' : 'Aguardando'}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Nova consulta
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <div className="bg-background/60 border-border/50 flex-1 overflow-y-auto rounded-2xl border p-6 backdrop-blur-sm">
          <div className="space-y-5">
            {isEvaluating && (
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                Analisando o atendimento...
              </div>
            )}

            {evaluation && (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-4xl font-bold tabular-nums tracking-tight">
                    {avgScore}
                    <span className="text-muted-foreground text-2xl font-normal">/10</span>
                  </span>
                  <span className="text-muted-foreground text-sm">média geral</span>
                </div>

                <Card className="border-border/50 rounded-2xl bg-transparent shadow-none backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[13px] font-semibold tracking-tight">
                      Desempenho por categoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(Object.keys(evaluation.notas) as Array<keyof typeof evaluation.notas>).map(
                      (key) => (
                        <ScoreCard
                          key={key}
                          label={CATEGORY_LABELS[key]}
                          nota={evaluation.notas[key].nota}
                          comentario={evaluation.notas[key].comentario}
                        />
                      ),
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-border/50 rounded-2xl bg-transparent shadow-none backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Pontos positivos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {evaluation.pontos_positivos.map((p, i) => (
                          <li key={i} className="text-muted-foreground flex gap-2 text-sm">
                            <span className="mt-0.5 text-emerald-600">•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 rounded-2xl bg-transparent shadow-none backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Pontos de melhoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {evaluation.pontos_de_melhoria.map((p, i) => (
                          <li key={i} className="text-muted-foreground flex gap-2 text-sm">
                            <span className="mt-0.5 text-yellow-600">•</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50 rounded-2xl bg-transparent shadow-none backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[13px] font-semibold tracking-tight">
                      Diagnóstico esperado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline" className="mb-1.5 rounded-lg">
                        Diagnóstico provável
                      </Badge>
                      <p className="text-muted-foreground text-sm">
                        {evaluation.diagnostico_provavel}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Badge variant="outline" className="mb-1.5 rounded-lg">
                        Conduta esperada
                      </Badge>
                      <p className="text-muted-foreground text-sm">{evaluation.conduta_esperada}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 rounded-2xl bg-transparent shadow-none backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[13px] font-semibold tracking-tight">
                      Feedback geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{evaluation.feedback_geral}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {evaluation && (
          <div className="bg-background/60 border-border/50 flex w-96 min-h-0 flex-col rounded-2xl border backdrop-blur-sm">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
              <div className="bg-muted border-border/60 flex h-7 w-7 items-center justify-center rounded-lg border">
                <MessageSquare className="text-foreground/70 h-3.5 w-3.5" />
              </div>
              <span className="text-[13px] font-semibold tracking-tight">
                Tire dúvidas com o avaliador
              </span>
            </div>
            <MessageList messages={followUpMessages} />
            <ChatInput onSend={handleFollowUp} disabled={isChatting} />
          </div>
        )}
      </div>
    </div>
  )
}

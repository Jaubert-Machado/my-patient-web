'use client'

import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react'
import type { Message } from '@/components/chat'

export interface PatientFicha {
  nome: string
  idade: number
  profissao: string
  queixa_principal: string
  tempo_sintomas: string
  contexto: string
}

interface SessionContextValue {
  patientMessages: Message[]
  labMessages: Message[]
  isFinished: boolean
  patientFicha: PatientFicha | null
  patientSystemPrompt: string | null
  setPatientMessages: Dispatch<SetStateAction<Message[]>>
  setLabMessages: Dispatch<SetStateAction<Message[]>>
  setPatientFicha: Dispatch<SetStateAction<PatientFicha | null>>
  setPatientSystemPrompt: Dispatch<SetStateAction<string | null>>
  finish: () => void
  reset: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [patientMessages, setPatientMessages] = useState<Message[]>([])
  const [labMessages, setLabMessages] = useState<Message[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [patientFicha, setPatientFicha] = useState<PatientFicha | null>(
    process.env.NEXT_PUBLIC_MOCK_PATIENT === 'true'
      ? {
          nome: 'João Silva',
          idade: 52,
          profissao: 'Professor',
          queixa_principal: 'dor no peito há 3 horas',
          tempo_sintomas: '3 horas',
          contexto:
            'Paciente chega ao pronto-socorro com dor torácica em aperto, irradiando para o braço esquerdo, acompanhada de sudorese fria e náusea leve.',
        }
      : null,
  )
  const [patientSystemPrompt, setPatientSystemPrompt] = useState<string | null>(
    process.env.NEXT_PUBLIC_MOCK_PATIENT === 'true'
      ? 'Você é João Silva, 52 anos, professor hipertenso. Tem dor no peito há 3 horas.'
      : null,
  )

  function finish() {
    setIsFinished(true)
  }

  function reset() {
    setPatientMessages([])
    setLabMessages([])
    setIsFinished(false)
    setPatientFicha(null)
    setPatientSystemPrompt(null)
  }

  return (
    <SessionContext.Provider
      value={{
        patientMessages,
        labMessages,
        isFinished,
        patientFicha,
        patientSystemPrompt,
        setPatientMessages,
        setLabMessages,
        setPatientFicha,
        setPatientSystemPrompt,
        finish,
        reset,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession deve ser usado dentro de SessionProvider')
  return ctx
}

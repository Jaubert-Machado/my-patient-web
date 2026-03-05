'use client'

import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from 'react'
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
  physicalMessages: Message[]
  isFinished: boolean
  patientFicha: PatientFicha | null
  caseId: string | null
  setPatientMessages: Dispatch<SetStateAction<Message[]>>
  setLabMessages: Dispatch<SetStateAction<Message[]>>
  setPhysicalMessages: Dispatch<SetStateAction<Message[]>>
  setPatientFicha: Dispatch<SetStateAction<PatientFicha | null>>
  setCaseId: Dispatch<SetStateAction<string | null>>
  finish: () => void
  reset: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [patientMessages, setPatientMessages] = useState<Message[]>([])
  const [labMessages, setLabMessages] = useState<Message[]>([])
  const [physicalMessages, setPhysicalMessages] = useState<Message[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [patientFicha, setPatientFicha] = useState<PatientFicha | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)

  function finish() {
    setIsFinished(true)
  }

  function reset() {
    setPatientMessages([])
    setLabMessages([])
    setPhysicalMessages([])
    setIsFinished(false)
    setPatientFicha(null)
    setCaseId(null)
  }

  return (
    <SessionContext.Provider
      value={{
        patientMessages,
        labMessages,
        physicalMessages,
        isFinished,
        patientFicha,
        caseId,
        setPatientMessages,
        setLabMessages,
        setPhysicalMessages,
        setPatientFicha,
        setCaseId,
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

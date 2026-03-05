'use client'

import { useMemo, useState, useRef } from 'react'
import gsap from 'gsap'
import { useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/chat-window'
import { ChatHeader } from '@/components/chat/chat-header'
import { PatientFile } from '@/components/chat/patient-file'
import { NotesWidget } from '@/components/chat/notes-widget'
import { useSession } from '@/contexts/session-context'
import { usePatientInit } from '@/hooks/use-patient-init'

export default function ChatPage() {
  const router = useRouter()
  const {
    patientMessages,
    setPatientMessages,
    labMessages,
    setLabMessages,
    isFinished,
    finish,
    patientFicha,
    caseId,
  } = useSession()

  const { isLoading: isLoadingCase } = usePatientInit()
  const [isConsultationStarted, setIsConsultationStarted] = useState(false)
  const [isFichaVisible, setIsFichaVisible] = useState(false)
  const fichaWrapperRef = useRef<HTMLDivElement>(null)

  const extraBody = useMemo(
    () => (caseId ? { caseId } : undefined),
    [caseId],
  )

  function handleFinish() {
    finish()
    router.push('/avaliacao')
  }

  function handleStart() {
    setIsConsultationStarted(true)
    setIsFichaVisible(false)
  }

  function toggleFicha() {
    if (isFichaVisible) {
      gsap.to(fichaWrapperRef.current, {
        x: -20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setIsFichaVisible(false),
      })
    } else {
      setIsFichaVisible(true)
    }
  }

  return (
    <>
      <NotesWidget />
      <div className="flex h-screen flex-col gap-4 p-6">
        <ChatHeader
          labMessages={labMessages}
          setLabMessages={setLabMessages}
          onFinish={handleFinish}
          onToggleFicha={toggleFicha}
          isFinished={isFinished}
          hasMessages={patientMessages.length > 0}
          isStarted={isConsultationStarted}
          isFichaOpen={isFichaVisible}
          patientName={patientFicha?.nome ?? null}
        />

        {!isConsultationStarted ? (
          <PatientFile
            ficha={patientFicha}
            isLoading={isLoadingCase}
            onStart={handleStart}
          />
        ) : (
          <div className="relative flex-1 overflow-hidden">
            {isFichaVisible && (
              <div ref={fichaWrapperRef} className="absolute left-0 top-0 z-10">
                <PatientFile
                  ficha={patientFicha}
                  isLoading={isLoadingCase}
                  variant="panel"
                  onStart={handleStart}
                />
              </div>
            )}
            <ChatWindow
              endpoint="/agents/patient"
              messages={patientMessages}
              setMessages={setPatientMessages}
              disabled={isFinished}
              extraBody={extraBody}
              className="h-full"
            />
          </div>
        )}
      </div>
    </>
  )
}

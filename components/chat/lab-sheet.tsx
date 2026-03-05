'use client'

import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useSession } from '@/contexts/session-context'
import { ChatWindow } from './chat-window'
import type { Message } from './use-chat'

interface LabSheetProps {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export function LabSheet({ messages, setMessages }: LabSheetProps) {
  const { caseId } = useSession()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FlaskConical className="h-4 w-4" />
          Pedir Exame
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-125 flex-col p-0 sm:max-w-none">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <FlaskConical className="h-4 w-4" />
            Laboratório
          </SheetTitle>
        </SheetHeader>
        <ChatWindow
          endpoint="/agents/lab"
          messages={messages}
          setMessages={setMessages}
          className="flex-1"
          extraBody={caseId ? { caseId } : undefined}
          markdown
        />
      </SheetContent>
    </Sheet>
  )
}

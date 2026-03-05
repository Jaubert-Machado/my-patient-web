'use client'

import { useState } from 'react'
import { FlaskConical, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useSession } from '@/contexts/session-context'
import { ChatWindow } from './chat-window'

type Tab = 'lab' | 'physical'

const TABS = [
  { id: 'lab' as Tab, label: 'Laboratório', icon: FlaskConical, endpoint: '/agents/lab', markdown: true },
  { id: 'physical' as Tab, label: 'Exame Físico', icon: Stethoscope, endpoint: '/agents/physical', markdown: true },
]

export function LabSheet() {
  const { caseId, labMessages, setLabMessages, physicalMessages, setPhysicalMessages } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('lab')

  const extraBody = caseId ? { caseId } : undefined

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FlaskConical className="h-4 w-4" />
          Exames
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-125 flex-col p-0 sm:max-w-none">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-sm">Exames</SheetTitle>
          <div className="mt-3 flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </SheetHeader>

        {TABS.map(({ id, endpoint, markdown }) => (
          <ChatWindow
            key={id}
            endpoint={endpoint}
            messages={id === 'lab' ? labMessages : physicalMessages}
            setMessages={id === 'lab' ? setLabMessages : setPhysicalMessages}
            className={cn('flex-1', activeTab !== id && 'hidden')}
            extraBody={extraBody}
            markdown={markdown}
          />
        ))}
      </SheetContent>
    </Sheet>
  )
}

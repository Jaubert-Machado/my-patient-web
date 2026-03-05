'use client'

import { StickyNote, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useNotes } from '@/contexts/notes-context'

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  return date.toLocaleDateString('pt-BR')
}

export function NotesSheet() {
  const { notes, removeNote } = useNotes()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <StickyNote className="h-4 w-4" />
          Anotações
          {notes.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-xs">
              {notes.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-96 flex-col p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <StickyNote className="h-4 w-4" />
            Anotações
          </SheetTitle>
        </SheetHeader>

        {notes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <StickyNote className="text-muted-foreground/40 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              Selecione um trecho do chat para salvar como anotação.
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {notes.map((note) => (
              <div key={note.id} className="group bg-card relative rounded-lg border p-3 text-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeNote(note.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-foreground pr-6 leading-relaxed">{note.text}</p>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {formatRelativeTime(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

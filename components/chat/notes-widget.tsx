'use client'

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  type RefObject,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer'
import { StickyNote, ChevronDown, ChevronUp, X, Move, Pin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useNotesData, useNotesActions, type Note } from '@/contexts/notes-context'

gsap.registerPlugin(Draggable)

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  return date.toLocaleDateString('pt-BR')
}

interface NoteCardProps {
  note: Note
  onRemove: (id: string) => void
}

function NoteCard({ note, onRemove }: NoteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const isNew = Date.now() - note.createdAt.getTime() < 300
    if (!isNew) return
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 8,
      scale: 0.94,
      duration: 0.28,
      ease: 'back.out(1.4)',
    })
  })

  function handleRemove() {
    const card = cardRef.current
    if (!card) {
      onRemove(note.id)
      return
    }
    gsap.to(card, {
      opacity: 0,
      scale: 0.9,
      duration: 0.18,
      ease: 'power2.in',
      onComplete() {
        onRemove(note.id)
      },
    })
  }

  return (
    <div
      ref={cardRef}
      className="group bg-background/60 border-border/40 relative shrink-0 overflow-hidden rounded-xl border p-2.5 text-xs"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <p className="text-foreground pr-5 leading-relaxed">{note.text}</p>
      <p className="text-muted-foreground mt-1">{formatRelativeTime(note.createdAt)}</p>
    </div>
  )
}

function NotesBadge() {
  const notes = useNotesData()
  if (notes.length === 0) return null
  return (
    <Badge variant="secondary" className="h-4 px-1.5 text-xs">
      {notes.length}
    </Badge>
  )
}

interface NotesListProps {
  onNotesChange: () => void
}

function NotesList({ onNotesChange }: NotesListProps) {
  const notes = useNotesData()
  const { removeNote } = useNotesActions()

  useLayoutEffect(() => {
    onNotesChange()
  }, [notes, onNotesChange])

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-8 pb-3 text-center">
        <StickyNote className="text-muted-foreground/30 h-6 w-6" />
        <p className="text-muted-foreground text-xs">
          Selecione um trecho do chat ou escreva abaixo para adicionar uma anotação.
        </p>
      </div>
    )
  }

  return (
    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto p-3 pb-2">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onRemove={removeNote} />
      ))}
    </div>
  )
}

function NotesInput() {
  const [inputText, setInputText] = useState('')
  const { addNote } = useNotesActions()

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setInputText(event.target.value)
  }

  function handleSubmitNote() {
    const trimmedText = inputText.trim()
    if (!trimmedText) return
    addNote(trimmedText)
    setInputText('')
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmitNote()
    }
  }

  return (
    <div className="border-border/30 border-t p-2">
      <div className="flex items-center gap-1.5">
        <Input
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Escrever anotação..."
          className="h-7 flex-1 text-xs"
        />
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0 disabled:opacity-30"
          onClick={handleSubmitNote}
          disabled={!inputText.trim()}
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface NotesBodyProps {
  bodyRef: RefObject<HTMLDivElement | null>
  listContainerRef: RefObject<HTMLDivElement | null>
  onNotesChange: () => void
}

function NotesBody({ bodyRef, listContainerRef, onNotesChange }: NotesBodyProps) {
  return (
    <div ref={bodyRef} className="overflow-hidden">
      <div ref={listContainerRef}>
        <NotesList onNotesChange={onNotesChange} />
      </div>
      <NotesInput />
    </div>
  )
}

const FLOAT_MARGIN = 16

export function NotesWidget() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isFloating, setIsFloating] = useState(true)
  const widgetRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const isFloatingRef = useRef(true)
  const draggableRef = useRef<Draggable | null>(null)
  const prevListHeightRef = useRef(0)

  useEffect(() => {
    isFloatingRef.current = isFloating
  }, [isFloating])

  const handleNotesChange = useCallback(() => {
    const body = bodyRef.current
    const listContainer = listContainerRef.current
    const element = widgetRef.current
    if (!body || !listContainer || !element) return

    if (body.offsetHeight === 0) {
      prevListHeightRef.current = listContainer.scrollHeight
      return
    }

    const prevHeight = prevListHeightRef.current
    const newHeight = listContainer.scrollHeight
    const delta = newHeight - prevHeight
    prevListHeightRef.current = newHeight
    if (delta === 0) return

    gsap.set(listContainer, { height: prevHeight })
    gsap.to(listContainer, {
      height: newHeight,
      duration: 0.28,
      ease: 'power3.out',
      overwrite: true,
      onComplete() {
        gsap.set(listContainer, { height: 'auto' })
      },
    })

    if (!isFloatingRef.current) return
    const currentTop = gsap.getProperty(element, 'top') as number
    gsap.to(element, { top: currentTop - delta, duration: 0.28, ease: 'power3.out', overwrite: true })
  }, [])

  useGSAP(() => {
    const element = widgetRef.current
    const header = headerRef.current
    if (!element || !header) return

    gsap.set(element, {
      top: window.innerHeight - element.offsetHeight - FLOAT_MARGIN,
      left: FLOAT_MARGIN,
    })

    prevListHeightRef.current = listContainerRef.current?.scrollHeight ?? 0

    const [draggable] = Draggable.create(element, {
      type: 'top,left',
      trigger: header,
      bounds: {
        minX: 0,
        minY: 0,
        maxX: window.innerWidth - element.offsetWidth,
        maxY: window.innerHeight - element.offsetHeight,
      },
      edgeResistance: 0.65,
      inertia: false,
    })

    draggableRef.current = draggable
  }, [])

  useGSAP(
    () => {
      const body = bodyRef.current
      const element = widgetRef.current
      if (!body || !element) return

      if (!initializedRef.current) {
        initializedRef.current = true
        return
      }

      if (isExpanded) {
        const targetHeight = body.scrollHeight
        gsap.to(body, {
          height: targetHeight,
          opacity: 1,
          duration: 0.32,
          ease: 'power3.out',
          onComplete() {
            gsap.set(body, { height: 'auto' })
            draggableRef.current?.applyBounds({
              minX: 0,
              minY: 0,
              maxX: window.innerWidth - element.offsetWidth,
              maxY: window.innerHeight - element.offsetHeight,
            })
          },
        })
        if (isFloatingRef.current) {
          const currentTop = gsap.getProperty(element, 'top') as number
          gsap.to(element, { top: currentTop - targetHeight, duration: 0.32, ease: 'power3.out' })
        }
      } else {
        const currentBodyHeight = body.offsetHeight
        gsap.set(body, { height: currentBodyHeight })
        gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.22,
          ease: 'power3.inOut',
          onComplete() {
            draggableRef.current?.applyBounds({
              minX: 0,
              minY: 0,
              maxX: window.innerWidth - element.offsetWidth,
              maxY: window.innerHeight - element.offsetHeight,
            })
          },
        })
        if (isFloatingRef.current) {
          const currentTop = gsap.getProperty(element, 'top') as number
          gsap.to(element, { top: currentTop + currentBodyHeight, duration: 0.22, ease: 'power3.inOut' })
        }
      }
    },
    { dependencies: [isExpanded] }
  )

  function handleToggleExpanded() {
    setIsExpanded((current) => !current)
  }

  function handleToggleFloat() {
    const element = widgetRef.current
    const draggable = draggableRef.current
    if (!element || !draggable) return

    if (!isFloatingRef.current) {
      gsap.set(element, {
        top: window.innerHeight - element.offsetHeight - FLOAT_MARGIN,
        left: FLOAT_MARGIN,
        bottom: 'auto',
      })
      draggable.enable()
      setIsFloating(true)
    } else {
      draggable.disable()
      const targetTop = window.innerHeight - element.offsetHeight - FLOAT_MARGIN
      gsap.to(element, {
        top: targetTop,
        left: FLOAT_MARGIN,
        duration: 0.38,
        ease: 'power3.out',
        onComplete() {
          gsap.set(element, { top: 'auto', bottom: FLOAT_MARGIN, left: FLOAT_MARGIN })
          setIsFloating(false)
        },
      })
    }
  }

  return (
    <DismissableLayerBranch>
      <div
        ref={widgetRef}
        className={cn(
          'bg-background/80 border-border/50 pointer-events-auto fixed top-0 left-0 z-9999 w-72 overflow-hidden border shadow-xl backdrop-blur-md',
          'flex flex-col-reverse rounded-2xl'
        )}
      >
        <div
          ref={headerRef}
          className={cn(
            'bg-background/40 flex items-center gap-2 px-3 py-2.5 select-none',
            isFloating
              ? 'border-border/40 cursor-grab border-t active:cursor-grabbing'
              : 'border-border/40 cursor-default border-t'
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-5 w-5 shrink-0"
            onClick={handleToggleFloat}
          >
            {isFloating ? <Pin className="h-3 w-3" /> : <Move className="h-3 w-3" />}
          </Button>
          <StickyNote className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-xs font-medium">Anotações</span>
          <NotesBadge />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-5 w-5 shrink-0"
            onClick={handleToggleExpanded}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>

        <NotesBody bodyRef={bodyRef} listContainerRef={listContainerRef} onNotesChange={handleNotesChange} />
      </div>
    </DismissableLayerBranch>
  )
}

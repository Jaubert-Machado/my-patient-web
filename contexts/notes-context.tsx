'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export interface Note {
  id: string
  text: string
  createdAt: Date
}

interface NotesActions {
  addNote: (text: string) => void
  removeNote: (id: string) => void
}

const NotesDataContext = createContext<Note[]>([])
const NotesActionsContext = createContext<NotesActions | null>(null)

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])

  const addNote = useCallback((text: string) => {
    setNotes((prev) => [{ id: crypto.randomUUID(), text, createdAt: new Date() }, ...prev])
  }, [])

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  return (
    <NotesActionsContext.Provider value={{ addNote, removeNote }}>
      <NotesDataContext.Provider value={notes}>{children}</NotesDataContext.Provider>
    </NotesActionsContext.Provider>
  )
}

export function useNotesData(): Note[] {
  return useContext(NotesDataContext)
}

export function useNotesActions(): NotesActions {
  const ctx = useContext(NotesActionsContext)
  if (!ctx) throw new Error('useNotesActions must be used within NotesProvider')
  return ctx
}

export function useNotes() {
  return { notes: useNotesData(), ...useNotesActions() }
}

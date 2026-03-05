'use client'

import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { BookmarkPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotesActions } from '@/contexts/notes-context'

interface PopoverState {
  top: number
  left: number
  text: string
}

interface SelectionPopoverProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function SelectionPopover({ containerRef }: SelectionPopoverProps) {
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { addNote } = useNotesActions()

  useGSAP(
    () => {
      if (!popoverRef.current || !popover) return
      gsap.from(popoverRef.current, {
        opacity: 0,
        y: 6,
        duration: 0.18,
        ease: 'power2.out',
      })
    },
    { dependencies: [popover] }
  )

  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setPopover(null)
        return
      }

      const text = selection.toString().trim()
      if (!text) {
        setPopover(null)
        return
      }

      const container = containerRef.current
      if (!container) return

      const range = selection.getRangeAt(0)
      if (!container.contains(range.commonAncestorContainer)) {
        setPopover(null)
        return
      }

      const rect = range.getBoundingClientRect()
      setPopover({
        top: Math.max(8, rect.top - 44),
        left: rect.left + rect.width / 2,
        text,
      })
    }

    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return
      setPopover(null)
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [containerRef])

  function handleSave() {
    if (!popover) return
    addNote(popover.text)
    window.getSelection()?.removeAllRanges()
    setPopover(null)
  }

  if (!popover) return null

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: popover.top,
        left: popover.left,
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      <Button
        size="sm"
        onClick={handleSave}
        className="h-8 gap-1.5 rounded-full px-3 text-xs shadow-lg"
      >
        <BookmarkPlus className="h-3.5 w-3.5" />
        Salvar nota
      </Button>
    </div>
  )
}

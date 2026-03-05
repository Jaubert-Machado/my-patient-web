'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

export interface FileTab {
  id: string
  label: React.ReactNode
  content: React.ReactNode
  color?: string
}

interface FileTabsProps {
  tabs: FileTab[]
  defaultTab?: string
  className?: string
}

export function FileTabs({ tabs, defaultTab, className }: FileTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)
  const activeTab = tabs.find((t) => t.id === active)
  const activeColor = activeTab?.color

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('.file-tab-ear', {
        opacity: 0,
        y: 16,
        stagger: 0.08,
        duration: 0.35,
        ease: 'power2.out',
      })
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 28,
        duration: 0.4,
        delay: 0.1,
        ease: 'power2.out',
      })
    },
    { scope: containerRef }
  )

  function handleTabChange(tabId: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (tabId === active) return

    gsap.fromTo(
      e.currentTarget,
      { scale: 0.94 },
      { scale: 1, duration: 0.25, ease: 'back.out(2.5)' }
    )

    gsap.to(contentRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.14,
      ease: 'power2.in',
      onComplete: () => {
        setActive(tabId)
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
        )
      },
    })
  }

  return (
    <div ref={containerRef} className={cn('flex min-h-0 flex-col', className)}>
      <div className="flex items-end gap-1.5 select-none">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          const c = tab.color

          return (
            <button
              key={tab.id}
              onClick={(e) => handleTabChange(tab.id, e)}
              className={cn(
                'file-tab-ear',
                'relative px-5 py-2 text-sm font-medium',
                'rounded-t-2xl border-2 border-b-0',
                'transition-colors duration-200',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                isActive ? 'text-foreground z-10' : 'text-muted-foreground hover:text-foreground',
                'translate-y-0.5',
                !c &&
                  (isActive
                    ? 'bg-card border-border'
                    : 'bg-muted/40 border-border/30 hover:bg-muted hover:border-border/60')
              )}
              style={
                c
                  ? isActive
                    ? {
                        borderColor: c,
                        background: `linear-gradient(160deg, color-mix(in oklch, ${c} 14%, var(--card)) 0%, var(--card) 60%)`,
                      }
                    : {
                        borderColor: `color-mix(in oklch, ${c} 30%, transparent)`,
                        background: `color-mix(in oklch, ${c} 5%, var(--muted))`,
                      }
                  : undefined
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className="bg-card relative min-h-0 flex-1 overflow-hidden rounded-tr-2xl rounded-b-2xl border-2 transition-[border-color,box-shadow] duration-300"
        style={{
          borderColor: activeColor ?? 'var(--border)',
          boxShadow: activeColor
            ? `5px 5px 1px color-mix(in oklch, ${activeColor} 28%, transparent),
               10px 10px 1px color-mix(in oklch, ${activeColor} 13%, transparent),
               0 16px 40px color-mix(in oklch, ${activeColor} 10%, transparent)`
            : `5px 5px 1px var(--border),
               10px 10px 1px color-mix(in oklch, var(--border) 40%, transparent)`,
        }}
      >
        <div ref={contentRef} className="h-full">
          {activeTab?.content}
        </div>
      </div>
    </div>
  )
}

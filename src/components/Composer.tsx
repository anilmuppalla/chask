import * as React from 'react'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComposerProps {
  onSubmit: (value: string) => void
  placeholder?: string
  composerRef: React.RefObject<HTMLTextAreaElement | null>
}

export function Composer({ onSubmit, placeholder = 'Type a task and press Enter…', composerRef }: ComposerProps) {
  const [hasValue, setHasValue] = React.useState(false)
  const maxRows = 6

  const handleSubmit = React.useCallback(() => {
    const textarea = composerRef.current
    if (!textarea) return
    const trimmed = textarea.value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    textarea.value = ''
    textarea.style.height = ''
    setHasValue(false)
    textarea.focus()
  }, [composerRef, onSubmit])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget
    setHasValue(textarea.value.trim().length > 0)
    autoResize(textarea)
  }

  const autoResize = (textarea: HTMLTextAreaElement) => {
    const computed = window.getComputedStyle(textarea)
    const numericLineHeight = Number.parseFloat(computed.lineHeight)
    const lineHeight = Number.isFinite(numericLineHeight) ? numericLineHeight : 24
    const maxHeight = lineHeight * maxRows

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }

  React.useEffect(() => {
    if (composerRef.current) {
      autoResize(composerRef.current)
    }
  }, [composerRef])

  return (
    <form
      className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary focus-within:border-primary"
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <label className="sr-only" htmlFor="composer-input">
        Add a task
      </label>
      <textarea
        id="composer-input"
        ref={composerRef}
        defaultValue=""
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        aria-label="Task title"
        placeholder={placeholder}
        className={cn(
          'w-full resize-none rounded-xl bg-transparent px-3 py-2 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none',
          'min-h-[52px] max-h-48',
        )}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Enter to submit · Shift+Enter for newline</span>
        <Button type="submit" size="sm" disabled={!hasValue} aria-label="Add task">
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </form>
  )
}

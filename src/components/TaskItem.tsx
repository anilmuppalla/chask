import * as React from 'react'
import { Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/db'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, changes: Partial<Task>) => void
  isActive?: boolean
  onFocusTask?: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete, onUpdate, isActive = false, onFocusTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState(task.title)
  const [notesDraft, setNotesDraft] = React.useState(task.notes ?? '')
  const titleInputRef = React.useRef<HTMLInputElement | null>(null)
  const cardRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setTitleDraft(task.title)
    setNotesDraft(task.notes ?? '')
  }, [task])

  React.useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmedTitle = titleDraft.trim()
    if (!trimmedTitle) {
      setTitleDraft(task.title)
      setIsEditing(false)
      return
    }

    const trimmedNotes = notesDraft.trim()
    onUpdate(task.id, {
      title: trimmedTitle,
      notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTitleDraft(task.title)
    setNotesDraft(task.notes ?? '')
    setIsEditing(false)
  }

  const canStartEditing = (target: EventTarget | null) => {
    if (isEditing) return false
    if (target instanceof HTMLElement && target.closest('button, input, textarea')) {
      return false
    }
    return true
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canStartEditing(event.target)) return
    onFocusTask?.(task.id)
    setIsEditing(true)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!canStartEditing(event.target)) return
      onFocusTask?.(task.id)
      setIsEditing(true)
    }
    if (event.key === 'Escape' && isEditing) {
      handleCancel()
    }
  }

  React.useEffect(() => {
    if (!isActive) return
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isActive])

  return (
    <div role="listitem" className="space-y-3">
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className={cn(
          'rounded-2xl border border-transparent bg-card/85 p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          task.completed ? 'opacity-80' : 'opacity-100',
          isEditing ? 'border-primary/60 shadow-md' : 'border-border hover:border-primary/40',
          isActive ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background' : null,
        )}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            aria-label={task.completed ? 'Mark task as active' : 'Mark task as completed'}
            className="mt-1"
          />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              {isEditing ? (
                <Input
                  ref={titleInputRef}
                  value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSave()
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    handleCancel()
                  }
                }}
              />
            ) : (
              <p className={cn('text-base font-medium text-foreground', task.completed && 'line-through text-muted-foreground')}>
                {task.title}
              </p>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete task"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(task.id)
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isEditing ? (
            <Textarea
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              rows={4}
              className="resize-none"
              placeholder="Add more context…"
            />
          ) : task.notes ? (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{task.notes}</p>
          ) : null}

          {isEditing ? (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
      <div className="flex justify-end text-xs text-muted-foreground">
        <span className="uppercase tracking-wide">Created {new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

import * as React from 'react'

import { TaskItem } from '@/components/TaskItem'
import { useBottomAnchor } from '@/hooks/useBottomAnchor'
import type { Task } from '@/lib/db'

interface TaskListProps {
  tasks: Task[]
  activeTaskId: string | null
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, changes: Partial<Task>) => void
  onFocusTask: (id: string | null) => void
  pendingScroll: boolean
  setPendingScroll: (next: boolean) => void
}

export function TaskList({
  tasks,
  activeTaskId,
  onToggle,
  onDelete,
  onUpdate,
  onFocusTask,
  pendingScroll,
  setPendingScroll,
}: TaskListProps) {
  const { containerRef, anchorRef, isNearBottom, scrollToBottom } = useBottomAnchor<HTMLDivElement>()

  React.useEffect(() => {
    const shouldStick = pendingScroll || isNearBottom()
    if (shouldStick) {
      scrollToBottom(pendingScroll ? 'smooth' : 'auto')
      if (pendingScroll) {
        setPendingScroll(false)
      }
    }
  }, [tasks, pendingScroll, isNearBottom, scrollToBottom, setPendingScroll])

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (isNearBottom()) {
        scrollToBottom('auto')
      }
    })
    const container = containerRef.current
    if (container) {
      observer.observe(container)
    }
    return () => observer.disconnect()
  }, [containerRef, isNearBottom, scrollToBottom])

  if (tasks.length === 0) {
    return (
      <div
        ref={containerRef}
        className="flex h-full flex-1 items-end justify-center px-4 text-center text-sm text-muted-foreground"
      >
        <p aria-live="polite">Type below and press Enter to add your first task.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-1 flex-col gap-3 overflow-y-auto px-4 pb-24"
      role="list"
      aria-label="Tasks"
      aria-live="polite"
    >
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isActive={activeTaskId === task.id}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onFocus={onFocusTask}
          requestScrollToBottom={() => scrollToBottom('smooth')}
        />
      ))}
      <div ref={anchorRef} />
    </div>
  )
}

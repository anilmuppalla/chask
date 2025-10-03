import { describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import * as React from 'react'

import { TaskList } from '@/components/TaskList'
import type { Task } from '@/lib/db'

const baseTask: Task = {
  id: '1',
  title: 'Example task',
  completed: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('TaskList layout', () => {
  it('keeps the view anchored near the bottom when instructed', async () => {
    const scrollSpy = vi.fn()
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollSpy,
    })

    render(
      <TaskList
        tasks={[baseTask]}
        activeTaskId={null}
        onToggle={() => {}}
        onDelete={() => {}}
        onUpdate={() => {}}
        onFocusTask={() => {}}
        pendingScroll
        setPendingScroll={() => {}}
      />,
    )

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled()
    })
  })
})

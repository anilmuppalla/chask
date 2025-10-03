import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'

import { Composer } from '@/components/Composer'

describe('Composer', () => {
  it('submits on Enter and clears the input', () => {
    const handler = vi.fn()
    const ref = React.createRef<HTMLTextAreaElement>()

    render(<Composer composerRef={ref} onSubmit={handler} disabled={false} />)

    const field = screen.getByLabelText('Task title') as HTMLTextAreaElement
    fireEvent.change(field, { target: { value: 'Pick up groceries' } })
    fireEvent.keyDown(field, { key: 'Enter' })

    expect(handler).toHaveBeenCalledWith('Pick up groceries')
    expect(field.value).toBe('')
  })

  it('supports multi-line entry with Shift+Enter', () => {
    const handler = vi.fn()
    const ref = React.createRef<HTMLTextAreaElement>()

    render(<Composer composerRef={ref} onSubmit={handler} disabled={false} />)

    const field = screen.getByLabelText('Task title') as HTMLTextAreaElement
    fireEvent.change(field, { target: { value: 'Line 1' } })
    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })

    expect(handler).not.toHaveBeenCalled()
    expect(field.value).toContain('Line 1')
  })

  it('limits auto-growing rows to six lines', () => {
    const handler = vi.fn()
    const ref = React.createRef<HTMLTextAreaElement>()

    render(<Composer composerRef={ref} onSubmit={handler} disabled={false} />)

    const field = screen.getByLabelText('Task title') as HTMLTextAreaElement
    const multiLine = Array.from({ length: 8 }, (_, index) => `Line ${index}`).join('\n')
    fireEvent.change(field, { target: { value: multiLine } })

    expect(Number(field.getAttribute('rows'))).toBeLessThanOrEqual(6)
  })

  it('allows typing text via user events', async () => {
    const handler = vi.fn()
    const ref = React.createRef<HTMLTextAreaElement>()

    render(<Composer composerRef={ref} onSubmit={handler} />)

    const field = screen.getByLabelText('Task title')
    await userEvent.type(field, 'Hello world')

    expect((field as HTMLTextAreaElement).value).toBe('Hello world')
  })
})

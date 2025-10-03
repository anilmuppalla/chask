import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import * as React from 'react'

import { Home } from '@/pages/Home'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

describe('Tasks workflow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  function renderApp() {
    return render(
      <ThemeProvider>
        <Home />
        <Toaster />
      </ThemeProvider>,
    )
  }

  it('adds, toggles, filters, searches, and deletes tasks with undo', async () => {
    renderApp()

    const composer = screen.getByLabelText('Task title') as HTMLTextAreaElement
    await waitFor(() => expect(composer).not.toBeDisabled())

    const composerForm = composer.closest('form') as HTMLFormElement

    fireEvent.change(composer, { target: { value: 'Buy milk' } })
    fireEvent.submit(composerForm)
    await screen.findByText('Buy milk')

    fireEvent.change(composer, { target: { value: 'Write tests' } })
    fireEvent.submit(composerForm)
    await screen.findByText('Write tests')

    const taskList = await screen.findByRole('list', { name: 'Tasks' })
    const tasks = within(taskList).getAllByRole('listitem')
    expect(tasks).toHaveLength(2)

    const firstTaskTitle = within(tasks[0]).getByText('Buy milk')
    expect(firstTaskTitle.className).not.toContain('line-through')

    const toggleBoxes = screen.getAllByRole('checkbox', {
      name: /mark task as completed/i,
    })
    fireEvent.click(toggleBoxes[0])
    expect(within(tasks[0]).getByText('Buy milk').className).toContain('line-through')

    const completedFilter = screen.getByRole('button', { name: 'Completed' })
    fireEvent.click(completedFilter)
    const completedList = await screen.findByRole('list', { name: 'Tasks' })
    const completedView = within(completedList).getAllByRole('listitem')
    expect(completedView).toHaveLength(1)
    expect(within(completedView[0]).getByText('Buy milk')).toBeInTheDocument()

    const allFilterButton = screen.getByRole('button', { name: 'All' })
    fireEvent.click(allFilterButton)

    const searchInput = screen.getByPlaceholderText('Search')
    fireEvent.change(searchInput, { target: { value: 'write' } })
    const searchList = await screen.findByRole('list', { name: 'Tasks' })
    const searchResults = within(searchList).getAllByRole('listitem')
    expect(searchResults).toHaveLength(1)
    expect(within(searchResults[0]).getByText('Write tests')).toBeInTheDocument()

    // Clear search and filter back to all
    fireEvent.change(searchInput, { target: { value: '' } })
    const allFilter = screen.getByRole('button', { name: 'All' })
    fireEvent.click(allFilter)

    // Delete a task and undo
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete task' })
    fireEvent.click(deleteButtons[0])

    const toast = await screen.findByText('Task deleted')
    expect(toast).toBeInTheDocument()
    const undo = await screen.findByRole('button', { name: 'Undo' })
    fireEvent.click(undo)

    const restoredList = await screen.findByRole('list', { name: 'Tasks' })
    const restoredTasks = within(restoredList).getAllByRole('listitem')
    expect(restoredTasks).toHaveLength(2)
  })

  it('supports bulk actions and inline editing', async () => {
    renderApp()

    const composer = screen.getByLabelText('Task title') as HTMLTextAreaElement
    await waitFor(() => expect(composer).not.toBeDisabled())
    const composerForm = composer.closest('form') as HTMLFormElement
    fireEvent.change(composer, { target: { value: 'Task one' } })
    fireEvent.submit(composerForm)
    await screen.findByText('Task one')

    fireEvent.change(composer, { target: { value: 'Task two' } })
    fireEvent.submit(composerForm)
    await screen.findByText('Task two')

    const listNode = await screen.findByRole('list', { name: 'Tasks' })
    const listItems = within(listNode).getAllByRole('listitem')
    expect(listItems).toHaveLength(2)

    const completeAll = screen.getByRole('button', { name: /complete all/i })
    fireEvent.click(completeAll)

    const updatedList = await screen.findByRole('list', { name: 'Tasks' })
    const updatedItems = within(updatedList).getAllByRole('listitem')
    updatedItems.forEach((item) => {
      expect(within(item).getByText(/Task/).className).toContain('line-through')
    })

    const clearCompleted = screen.getByRole('button', { name: /clear completed/i })
    fireEvent.click(clearCompleted)

    const confirm = await screen.findByRole('button', { name: 'Clear' })
    fireEvent.click(confirm)

    expect(await screen.findByText('Type below and press Enter to add your first task.')).toBeInTheDocument()

    // Re-add and edit inline using keyboard
    fireEvent.change(composer, { target: { value: 'Edit me' } })
    fireEvent.submit(composerForm)
    const editList = await screen.findByRole('list', { name: 'Tasks' })
    const taskCard = within(editList).getAllByRole('listitem')[0]
    const title = within(taskCard).getByText('Edit me')
    fireEvent.click(title)
    const input = await screen.findByDisplayValue('Edit me')
    fireEvent.change(input, { target: { value: 'Edited value' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(await screen.findByText('Edited value')).toBeInTheDocument()
  })
})

import { afterEach, describe, expect, it } from 'vitest'
import { render, cleanup, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import * as React from 'react'

import { Home } from '@/pages/Home'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

describe('Accessibility', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders the home layout without axe violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <Home />
        <Toaster />
      </ThemeProvider>,
    )
    await screen.findByText('Type below and press Enter to add your first task.')
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

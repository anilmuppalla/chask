import * as React from 'react'

export type Theme = 'light' | 'dark'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

const ThemeContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'chask-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme
    }
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    if (stored) {
      return stored
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(nextTheme)
        window.localStorage.setItem(storageKey, nextTheme)
      }
    },
    [storageKey],
  )

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      applyTheme(nextTheme)
    },
    [applyTheme],
  )

  React.useEffect(() => {
    applyTheme(theme)
  }, [applyTheme, theme])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

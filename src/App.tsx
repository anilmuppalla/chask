import { useRegisterSW } from 'virtual:pwa-register/react'

import { Home } from '@/pages/Home'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

function App() {
  useRegisterSW({ immediate: true })

  return (
    <ThemeProvider>
      <Home />
      <Toaster />
    </ThemeProvider>
  )
}

export default App

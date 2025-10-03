import * as React from 'react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) {
      return
    }

    const handler = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    const installedHandler = () => {
      setInstallEvent(null)
      setDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  if (!installEvent || dismissed) {
    return null
  }

  const onInstall = async () => {
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome !== 'accepted') {
      setDismissed(true)
    }
    setInstallEvent(null)
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
      <div className="flex flex-col">
        <span className="font-semibold text-primary">Install Chask?</span>
        <span className="text-xs text-primary/80">Get the full app experience with offline support.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Not now
        </Button>
        <Button size="sm" onClick={onInstall}>
          Install
        </Button>
      </div>
    </div>
  )
}

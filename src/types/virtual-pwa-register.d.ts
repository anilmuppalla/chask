declare module 'virtual:pwa-register/react' {
  interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
  }

  export function useRegisterSW(options?: RegisterSWOptions): { updateServiceWorker: (reloadPage?: boolean) => Promise<void> }
}

declare module 'virtual:pwa-register' {
  interface RegisterSWOptions {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
  }

  export function registerSW(options?: RegisterSWOptions): () => Promise<void>
}

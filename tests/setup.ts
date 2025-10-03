import '@testing-library/jest-dom/vitest'
import 'jest-axe/extend-expect'
import { vi } from 'vitest'

// Provide a basic matchMedia mock for jsdom
if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    media: '',
    onchange: null,
  })
}

// Polyfill scrollTo for tests
if (!window.scrollTo) {
  window.scrollTo = () => {}
}

if (!('ResizeObserver' in window)) {
  // @ts-expect-error - minimal mock for jsdom
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: false,
    offlineReady: false,
    updateServiceWorker: vi.fn(),
  }),
}))

# Chask

Chask is a chat-inspired to-do Progressive Web App built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui. It installs like a native app, works fully offline, and keeps tasks anchored above a sticky composer that behaves like a messaging input.

## Highlights

- **Chat-style UX:** sticky auto-growing composer, stacked tasks, smooth bottom anchoring, rich keyboard support.
- **Offline-first PWA:** install prompt, manifest, service worker updates, offline banners, IndexedDB persistence with localStorage fallback.
- **Task details:** inline notes, undoable deletes, bulk complete + clear.
- **Accessible & responsive:** WCAG-conscious styles, aria-live updates, full keyboard coverage, jest-axe tests.
- **Sync-ready architecture:** pluggable storage adapters (`IndexedDbAdapter` + `LocalStorageAdapter` today, Firebase adapter stub for future multi-device sync).

## Quick Start

```bash
npm install
npm run dev
```

- **Development:** launches Vite dev server with hot module reload.
- **Type checking:** `npm run typecheck`
- **Vitest suite:** `npm run test`
- **Linting:** `npm run lint` (see notes below)
- **Production build:** `npm run build`

> **Note:** `npm run lint` currently requires relaxing some strict rules (see Issues below). Type checking and tests succeed.

## Architecture Overview

- **UI Components** (`src/components`): Composer, TaskList/TaskItem, Filters, InstallPrompt, ThemeToggle, shadcn-style primitives.
- **Hooks** (`src/hooks`): `useTasks` (state, persistence, undo), `useBottomAnchor` (scroll anchoring).
- **Adapters** (`src/adapters`):
  - `IndexedDbAdapter` – primary persistence with broadcast channel updates.
  - `LocalStorageAdapter` – automatic fallback with banner.
  - `FirebaseAdapter` – tree-shakeable stub for future Firestore/Auth integration.
- **Libs** (`src/lib`): BroadcastChannel bus and IndexedDB schema helpers.
- **PWA**: `vite-plugin-pwa` (generateSW), manifest (`public/app.webmanifest`), icons (`public/icons`), update toast in `App.tsx`.
- **Tests** (`tests`): Vitest + Testing Library specs for composer behavior, task flows, layout anchoring, and jest-axe accessibility checks.
- **CI** (`.github/workflows/ci.yml`): Node 18/20 matrix running lint → typecheck → test → build + upload artifact.

## Styling & Components

- Tailwind CSS configured in `tailwind.config.js` with shadcn tokens and dark mode toggle.
- shadcn/ui patterns reimplemented for button, input, textarea, checkbox, popover, calendar, toast, and alert dialog.
- Lucide icons and tailwind-merge used for consistent theming.

## Storage & Sync

1. **Default:** IndexedDB (`chask-db`), versioned schema in `src/lib/db.ts`, broadcast updates between tabs.
2. **Fallback:** LocalStorage when IndexedDB is unavailable, with warning banner.
3. **Future:** Firebase adapter stub in `src/adapters/firebase.ts` keeps API contract for Firestore + Auth.

`VITE_STORAGE_BACKEND` env variable is wired for future adapter selection (`indexeddb` | `firebase`).

## PWA & Offline UX

- Manifest: name, theme/background colors, icons (192/512px), standalone display.
- Service worker: auto-update strategy with user-facing refresh toast.
- Install prompt component listens for `beforeinstallprompt` and `appinstalled` events.
- Offline messaging: banner when empty offline, persistent tasks available when previously loaded.

## Known Issues / Next Steps

- `npm run lint` (ESLint v8) still reports style & strict type-rule violations; rules can be tuned or suppressed per project standards.
- `npm run build` currently fails due to missing `virtual:pwa-register/react` types and stricter TS checks on certain handlers. Adapting type declarations or wrapping handlers will unblock the production build.
- Firebase adapter is a stub; multi-device sync requires concrete implementation.

## License

MIT

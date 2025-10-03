import * as React from 'react'
import { nanoid } from 'nanoid'

import { ToastAction } from '@/components/ui/toast'
import { toast } from '@/components/ui/use-toast'
import { subscribeToTasks } from '@/lib/bus'
import {
  type StorageAdapter,
  type StorageBackend,
  type Task,
} from '@/lib/db'
import { createIndexedDbAdapter } from '@/adapters/indexeddb'
import { createLocalStorageAdapter } from '@/adapters/local-storage'
import { createFirebaseAdapter } from '@/adapters/firebase'

export type TaskFilter = 'all' | 'active' | 'completed'

interface UseTasksState {
  tasks: Task[]
  filtered: Task[]
  filter: TaskFilter
  search: string
  storageBackend: StorageBackend
  storageWarning: boolean
  offline: boolean
  loading: boolean
  hasCompletedTasks: boolean
  areAllCompleted: boolean
}

const DEFAULT_BACKEND = (import.meta.env.VITE_STORAGE_BACKEND as StorageBackend | undefined) ?? 'indexeddb'

type AdapterFactory = () => Promise<StorageAdapter>

async function initializeAdapter(
  preferred: StorageBackend,
): Promise<{ adapter: StorageAdapter; backend: StorageBackend; warning: boolean }> {
  const fallbacks: [StorageBackend, AdapterFactory, boolean][] = [
    ['indexeddb', createIndexedDbAdapter, false],
    ['localstorage', createLocalStorageAdapter, true],
  ]

  if (preferred === 'localstorage') {
    try {
      const adapter = await createLocalStorageAdapter()
      return { adapter, backend: 'localstorage', warning: true }
    } catch (error) {
      console.warn('localStorage unavailable, trying IndexedDB instead', error)
    }
  }

  if (preferred === 'firebase') {
    try {
      const firebaseAdapter = await createFirebaseAdapter()
      return { adapter: firebaseAdapter, backend: 'firebase', warning: false }
    } catch (error) {
      console.warn('Firebase adapter not ready, falling back to IndexedDB', error)
    }
  }

  if (preferred === 'indexeddb') {
    try {
      const adapter = await createIndexedDbAdapter()
      return { adapter, backend: 'indexeddb', warning: false }
    } catch (error) {
      console.warn('IndexedDB unavailable, falling back to localStorage', error)
    }
  }

  for (const [backend, factory, warning] of fallbacks) {
    try {
      const adapter = await factory()
      return { adapter, backend, warning }
    } catch (error) {
      console.error(`Failed to start ${backend} adapter`, error)
    }
  }

  throw new Error('No storage adapter available')
}

export function useTasks() {
  const composerRef = React.useRef<HTMLTextAreaElement | null>(null)

  const [adapter, setAdapter] = React.useState<StorageAdapter | null>(null)
  const [state, setState] = React.useState<UseTasksState>({
    tasks: [],
    filtered: [],
    filter: 'all',
    search: '',
    storageBackend: 'indexeddb',
    storageWarning: false,
    offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    loading: true,
    hasCompletedTasks: false,
    areAllCompleted: false,
  })
  const [pendingScroll, setPendingScroll] = React.useState(false)
  const lastDeletedTask = React.useRef<Task | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const { adapter: resolvedAdapter, backend, warning } = await initializeAdapter(DEFAULT_BACKEND)
        if (cancelled) return
        setAdapter(resolvedAdapter)
        const tasks = await resolvedAdapter.all()
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          tasks,
          filtered: applyFilters(tasks, prev.filter, prev.search),
          storageBackend: backend,
          storageWarning: warning,
          loading: false,
          hasCompletedTasks: tasks.some((task) => task.completed),
          areAllCompleted: tasks.every((task) => task.completed) && tasks.length > 0,
        }))
      } catch (error) {
        console.error('Failed to initialize storage adapter', error)
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    void boot()

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!adapter) return
    const unsubscribe = subscribeToTasks(async () => {
      const tasks = await adapter.all()
      setState((prev) => ({
        ...prev,
        tasks,
        filtered: applyFilters(tasks, prev.filter, prev.search),
        hasCompletedTasks: tasks.some((task) => task.completed),
        areAllCompleted: tasks.every((task) => task.completed) && tasks.length > 0,
      }))
    })
    return () => {
      unsubscribe()
    }
  }, [adapter])

  // Reload when adapter changes (after async init).
  React.useEffect(() => {
    if (!adapter) return
    let cancelled = false
    async function hydrate() {
      const tasks = await adapter.all()
      if (cancelled) return
      setState((prev) => ({
        ...prev,
        tasks,
        filtered: applyFilters(tasks, prev.filter, prev.search),
        hasCompletedTasks: tasks.some((task) => task.completed),
        areAllCompleted: tasks.every((task) => task.completed) && tasks.length > 0,
        loading: false,
      }))
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [adapter])

  // Offline detection banner
  React.useEffect(() => {
    const handleOnline = () => setState((prev) => ({ ...prev, offline: false }))
    const handleOffline = () => setState((prev) => ({ ...prev, offline: true }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncState = React.useCallback((tasks: Task[], overrides?: Partial<UseTasksState>) => {
    const uniqueTasks = dedupeTasks(tasks)
    setState((prev) => {
      const next = {
        ...prev,
        ...overrides,
        tasks: uniqueTasks,
        filtered: applyFilters(
          uniqueTasks,
          overrides?.filter ?? prev.filter,
          overrides?.search ?? prev.search,
        ),
        hasCompletedTasks: uniqueTasks.some((task) => task.completed),
        areAllCompleted: uniqueTasks.every((task) => task.completed) && uniqueTasks.length > 0,
      }
      return next
    })
  }, [])

  const addTask = React.useCallback(
    async (title: string) => {
      if (!adapter) return
      const trimmed = title.trim()
      if (!trimmed) return
      const now = Date.now()
      const task: Task = {
        id: nanoid(),
        title: trimmed,
        completed: false,
        createdAt: now,
        updatedAt: now,
        source: state.storageBackend === 'firebase' ? 'cloud' : 'local',
      }
      const nextTasks = [...state.tasks, task]
      syncState(nextTasks)
      setPendingScroll(true)
      await adapter.create(task)
    },
    [adapter, state.storageBackend, state.tasks, syncState],
  )

  const updateTask = React.useCallback(
    async (id: string, changes: Partial<Task>) => {
      if (!adapter) return
      const nextTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, ...changes, updatedAt: Date.now() } : task,
      )
      syncState(nextTasks)
      await adapter.update(id, changes)
    },
    [adapter, state.tasks, syncState],
  )

  const toggleTask = React.useCallback(
    async (id: string) => {
      if (!adapter) return
      const target = state.tasks.find((task) => task.id === id)
      if (!target) return
      const nextCompleted = !target.completed
      const nextTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, completed: nextCompleted, updatedAt: Date.now() } : task,
      )
      syncState(nextTasks)
      await adapter.update(id, { completed: nextCompleted })
    },
    [adapter, state.tasks, syncState],
  )

  const undoDelete = React.useCallback(async () => {
    if (!adapter) return
    if (!lastDeletedTask.current) return
    const restored: Task = { ...lastDeletedTask.current, updatedAt: Date.now() }
    const nextTasks = [...state.tasks, restored].sort((a, b) => a.createdAt - b.createdAt)
    syncState(nextTasks)
    await adapter.create(restored)
    lastDeletedTask.current = null
  }, [adapter, state.tasks, syncState])

  const removeTask = React.useCallback(
    async (id: string) => {
      if (!adapter) return
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return
      lastDeletedTask.current = task
      const nextTasks = state.tasks.filter((t) => t.id !== id)
      syncState(nextTasks)
      await adapter.delete(id)

      toast({
        title: 'Task deleted',
        description: 'Undo?',
        duration: 6000,
        action: (
          <ToastAction altText="Undo delete" onClick={() => undoDelete()}>
            Undo
          </ToastAction>
        ),
      })
    },
    [adapter, state.tasks, syncState, undoDelete],
  )

  const clearCompleted = React.useCallback(async () => {
    if (!adapter) return
    const nextTasks = state.tasks.filter((task) => !task.completed)
    syncState(nextTasks)
    await adapter.clearCompleted()
  }, [adapter, state.tasks, syncState])

  const toggleAll = React.useCallback(async () => {
    if (!adapter) return
    const allCompleted = state.tasks.every((task) => task.completed)
    const nextTasks = state.tasks.map((task) => ({
      ...task,
      completed: !allCompleted,
      updatedAt: Date.now(),
    }))
    syncState(nextTasks)
    await adapter.toggleAll(!allCompleted)
  }, [adapter, state.tasks, syncState])

  const setFilter = React.useCallback(
    (filter: TaskFilter) => {
      syncState(state.tasks, { filter })
    },
    [state.tasks, syncState],
  )

  const setSearch = React.useCallback(
    (search: string) => {
      syncState(state.tasks, { search })
    },
    [state.tasks, syncState],
  )

  const value = React.useMemo(
    () => ({
      ...state,
      composerRef,
      pendingScroll,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      undoDelete,
      clearCompleted,
      toggleAll,
      setFilter,
      setSearch,
      setPendingScroll,
    }),
    [
      state,
      composerRef,
      pendingScroll,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      undoDelete,
      clearCompleted,
      toggleAll,
      setFilter,
      setSearch,
    ],
  )

  return value
}

function applyFilters(tasks: Task[], filter: TaskFilter, search: string) {
  const query = search.trim().toLowerCase()
  return tasks
    .filter((task) => {
      if (filter === 'active') return !task.completed
      if (filter === 'completed') return task.completed
      return true
    })
    .filter((task) => {
      if (!query) return true
      return task.title.toLowerCase().includes(query) || task.notes?.toLowerCase().includes(query)
    })
    .sort((a, b) => a.createdAt - b.createdAt)
}

function dedupeTasks(tasks: Task[]) {
  const map = new Map<string, Task>()
  for (const task of tasks) {
    map.set(task.id, task)
  }
  return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt)
}

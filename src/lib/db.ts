import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'chask-db'
const DB_VERSION = 1
const STORE = 'tasks'

export interface Task {
  id: string
  title: string
  notes?: string
  completed: boolean
  createdAt: number
  updatedAt: number
  tags?: string[]
  source?: 'local' | 'cloud'
}

export type StorageBackend = 'indexeddb' | 'localstorage' | 'firebase'

export interface StorageAdapter {
  ready(): Promise<void>
  all(): Promise<Task[]>
  create(task: Task): Promise<void>
  update(id: string, changes: Partial<Task>): Promise<Task | undefined>
  delete(id: string): Promise<Task | undefined>
  clearCompleted(): Promise<void>
  toggleAll(nextCompleted: boolean): Promise<void>
  bulkUpsert(tasks: Task[]): Promise<void>
  subscribe?(handler: () => void): () => void
  teardown?(): void
}

export async function createDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('by-updatedAt', 'updatedAt')
      }
    },
  })
}

export { DB_NAME, DB_VERSION, STORE }

import { type IDBPDatabase } from 'idb'

import { emitTaskChanged } from '@/lib/bus'
import { createDatabase, STORE, type StorageAdapter, type Task } from '@/lib/db'

export class IndexedDbAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBPDatabase>

  constructor(db?: Promise<IDBPDatabase>) {
    this.dbPromise = db ?? createDatabase()
  }

  async ready() {
    await this.dbPromise
  }

  private async db() {
    return this.dbPromise
  }

  async all(): Promise<Task[]> {
    const database = await this.db()
    const records = await database.getAll(STORE)
    return records.sort((a, b) => a.createdAt - b.createdAt)
  }

  async create(task: Task): Promise<void> {
    const database = await this.db()
    await database.put(STORE, task)
    emitTaskChanged()
  }

  async update(id: string, changes: Partial<Task>): Promise<Task | undefined> {
    const database = await this.db()
    const current = await database.get(STORE, id)
    if (!current) return undefined
    const next = { ...current, ...changes, updatedAt: Date.now() }
    await database.put(STORE, next)
    emitTaskChanged()
    return next
  }

  async delete(id: string): Promise<Task | undefined> {
    const database = await this.db()
    const current = await database.get(STORE, id)
    await database.delete(STORE, id)
    emitTaskChanged()
    return current ?? undefined
  }

  async clearCompleted(): Promise<void> {
    const database = await this.db()
    const tx = database.transaction(STORE, 'readwrite')
    const index = tx.store.index('by-updatedAt')
    let cursor = await index.openCursor()
    while (cursor) {
      if (cursor.value.completed) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }
    await tx.done
    emitTaskChanged()
  }

  async toggleAll(nextCompleted: boolean): Promise<void> {
    const database = await this.db()
    const tx = database.transaction(STORE, 'readwrite')
    let cursor = await tx.store.openCursor()
    while (cursor) {
      const value = cursor.value
      await cursor.update({ ...value, completed: nextCompleted, updatedAt: Date.now() })
      cursor = await cursor.continue()
    }
    await tx.done
    emitTaskChanged()
  }

  async bulkUpsert(tasks: Task[]): Promise<void> {
    const database = await this.db()
    const tx = database.transaction(STORE, 'readwrite')
    for (const task of tasks) {
      await tx.store.put(task)
    }
    await tx.done
    emitTaskChanged()
  }
}

export async function createIndexedDbAdapter(): Promise<IndexedDbAdapter> {
  const adapter = new IndexedDbAdapter()
  await adapter.ready()
  return adapter
}

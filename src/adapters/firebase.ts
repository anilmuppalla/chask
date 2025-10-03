import { type StorageAdapter, type Task } from '@/lib/db'

export class FirebaseAdapter implements StorageAdapter {
  constructor() {
    if (import.meta.env.DEV) {
      console.info('Firebase adapter is a stub. Configure Firebase to enable sync.')
    }
  }

  async ready() {
    throw new Error('Firebase adapter is not implemented yet')
  }

  async all(): Promise<Task[]> {
    return []
  }

  async create(): Promise<void> {
    throw new Error('Firebase adapter is not implemented yet')
  }

  async update(): Promise<Task | undefined> {
    throw new Error('Firebase adapter is not implemented yet')
  }

  async delete(): Promise<Task | undefined> {
    throw new Error('Firebase adapter is not implemented yet')
  }

  async clearCompleted(): Promise<void> {
    throw new Error('Firebase adapter is not implemented yet')
  }

  async toggleAll(): Promise<void> {
    throw new Error('Firebase adapter is not implemented yet')
  }

  async bulkUpsert(): Promise<void> {
    throw new Error('Firebase adapter is not implemented yet')
  }
}

export async function createFirebaseAdapter(): Promise<FirebaseAdapter> {
  const adapter = new FirebaseAdapter()
  await adapter.ready()
  return adapter
}

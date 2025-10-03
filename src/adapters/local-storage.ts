import { emitTaskChanged } from '@/lib/bus'
import { type StorageAdapter, type Task } from '@/lib/db'

const KEY = 'chask-tasks'

export class LocalStorageAdapter implements StorageAdapter {
  async ready() {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available during SSR')
    }
  }

  async all(): Promise<Task[]> {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw) as Task[]
      return parsed.sort((a, b) => a.createdAt - b.createdAt)
    } catch (error) {
      console.error('Failed to parse tasks from localStorage', error)
      return []
    }
  }

  private persist(tasks: Task[]) {
    window.localStorage.setItem(KEY, JSON.stringify(tasks))
    emitTaskChanged()
  }

  async create(task: Task): Promise<void> {
    const tasks = await this.all()
    this.persist([...tasks, task])
  }

  async update(id: string, changes: Partial<Task>): Promise<Task | undefined> {
    const tasks = await this.all()
    const nextTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...changes, updatedAt: Date.now() } : task,
    )
    const updated = nextTasks.find((task) => task.id === id)
    this.persist(nextTasks)
    return updated
  }

  async delete(id: string): Promise<Task | undefined> {
    const tasks = await this.all()
    const deleted = tasks.find((task) => task.id === id)
    this.persist(tasks.filter((task) => task.id !== id))
    return deleted
  }

  async clearCompleted(): Promise<void> {
    const tasks = await this.all()
    this.persist(tasks.filter((task) => !task.completed))
  }

  async toggleAll(nextCompleted: boolean): Promise<void> {
    const tasks = await this.all()
    this.persist(tasks.map((task) => ({ ...task, completed: nextCompleted })))
  }

  async bulkUpsert(tasks: Task[]): Promise<void> {
    this.persist(tasks)
  }
}

export async function createLocalStorageAdapter(): Promise<LocalStorageAdapter> {
  const adapter = new LocalStorageAdapter()
  await adapter.ready()
  return adapter
}

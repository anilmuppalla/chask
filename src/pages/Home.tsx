import { InstallPrompt } from '@/components/InstallPrompt'
import { Composer } from '@/components/Composer'
import { Filters } from '@/components/Filters'
import { TaskList } from '@/components/TaskList'
import { useTasks } from '@/hooks/useTasks'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Home() {
  const {
    filtered,
    tasks,
    filter,
    setFilter,
    search,
    setSearch,
    hasCompletedTasks,
    areAllCompleted,
    toggleAll,
    clearCompleted,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
    storageWarning,
    offline,
    composerRef,
    pendingScroll,
    setPendingScroll,
  } = useTasks()

  const showOfflineBanner = offline && filtered.length === 0

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Chask</h1>
            <p className="text-xs text-muted-foreground">Chat-style tasks that stay with you, even offline.</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-4">
          {storageWarning ? (
            <div className="rounded-lg border border-amber-400/60 bg-amber-100/80 px-3 py-2 text-xs text-amber-900" role="alert">
              IndexedDB isn&rsquo;t available. Tasks are stored in this browser only. Enable storage permissions for offline sync later.
            </div>
          ) : null}
          {showOfflineBanner ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary" role="status">
              ⚠️ You&rsquo;re offline. Tasks will appear once you add them.
            </div>
          ) : null}
          <InstallPrompt />
          <Filters
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            hasCompletedTasks={hasCompletedTasks}
            areAllCompleted={areAllCompleted}
            toggleAll={toggleAll}
            clearCompleted={clearCompleted}
            totalCount={tasks.length}
          />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-32 pt-6">
        <TaskList
          tasks={filtered}
          onToggle={toggleTask}
          onDelete={removeTask}
          onUpdate={updateTask}
          pendingScroll={pendingScroll}
          setPendingScroll={setPendingScroll}
        />
      </main>
      <div className="sticky bottom-0 z-30 bg-gradient-to-t from-background via-background/95 to-background/30 px-4 pb-4 pt-6">
        <div className="mx-auto w-full max-w-3xl safe-area-b">
          <Composer composerRef={composerRef} onSubmit={addTask} />
          <p className="mt-2 text-center text-xs text-muted-foreground">Click a task to edit, or use Delete to remove.</p>
        </div>
      </div>
    </div>
  )
}

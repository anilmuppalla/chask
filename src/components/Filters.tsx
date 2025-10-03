import { useState } from 'react'
import { Filter, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import type { TaskFilter } from '@/hooks/useTasks'

interface FiltersProps {
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  search: string
  setSearch: (value: string) => void
  hasCompletedTasks: boolean
  areAllCompleted: boolean
  toggleAll: () => void
  clearCompleted: () => void
  totalCount: number
}

const filterOptions: Array<{ key: TaskFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

export function Filters({
  filter,
  setFilter,
  search,
  setSearch,
  hasCompletedTasks,
  areAllCompleted,
  toggleAll,
  clearCompleted,
  totalCount,
}: FiltersProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{totalCount} tasks</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.key}
            variant={filter === option.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(option.key)}
            aria-pressed={filter === option.key}
          >
            {option.label}
          </Button>
        ))}
        <div className="ml-auto flex-1 min-w-[180px]">
          <label className="sr-only" htmlFor="task-search">
            Search tasks
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="task-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Button variant="outline" size="sm" onClick={toggleAll}>
          {areAllCompleted ? 'Mark all active' : 'Complete all'}
        </Button>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={!hasCompletedTasks}>
              Clear completed
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all completed tasks. You can&rsquo;t undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearCompleted()
                  setDialogOpen(false)
                }}
              >
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

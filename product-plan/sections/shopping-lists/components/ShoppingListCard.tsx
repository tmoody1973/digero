import type { ShoppingList } from '../types'

interface ShoppingListCardProps {
  list: ShoppingList
  onView?: () => void
  onDelete?: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ShoppingListCard({ list, onView, onDelete }: ShoppingListCardProps) {
  const progress = list.totalItems > 0 ? (list.checkedItems / list.totalItems) * 100 : 0
  const isArchived = list.status === 'archived'

  return (
    <button
      onClick={onView}
      className={`group w-full text-left p-4 rounded-2xl border transition-all ${
        isArchived
          ? 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold ${
            isArchived
              ? 'text-stone-500 dark:text-stone-400'
              : 'text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
          }`}>
            {list.name}
          </h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {isArchived ? `Completed ${formatDate(list.completedAt || list.createdAt)}` : `Created ${formatDate(list.createdAt)}`}
          </p>
        </div>

        {!isArchived && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            title="Delete list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress === 100
                ? 'bg-green-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className={`text-sm ${
          isArchived
            ? 'text-stone-400 dark:text-stone-500'
            : 'text-stone-600 dark:text-stone-400'
        }`}>
          {list.checkedItems} of {list.totalItems} items
        </span>

        {progress === 100 && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Complete
          </span>
        )}

        {!isArchived && progress > 0 && progress < 100 && (
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            {Math.round(progress)}% done
          </span>
        )}
      </div>
    </button>
  )
}

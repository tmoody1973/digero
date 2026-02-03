import type { ShoppingListsProps } from '../types'
import { ShoppingListCard } from './ShoppingListCard'

export function ShoppingLists({
  lists,
  onViewList,
  onCreateList,
  onDeleteList,
  onGenerateFromMealPlan
}: ShoppingListsProps) {
  const activeLists = lists.filter(l => l.status === 'active')
  const archivedLists = lists.filter(l => l.status === 'archived')

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Shopping Lists</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {activeLists.length} active {activeLists.length === 1 ? 'list' : 'lists'}
              </p>
            </div>

            <button
              onClick={onGenerateFromMealPlan}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New List
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={onGenerateFromMealPlan}
            className="flex-1 flex items-center justify-center gap-3 p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold">From Meal Plan</p>
              <p className="text-xs text-orange-100">Generate from this week</p>
            </div>
          </button>

          <button
            onClick={onCreateList}
            className="flex-1 flex items-center justify-center gap-3 p-4 bg-white dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-orange-400 dark:hover:border-orange-500 text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 rounded-2xl transition-all"
          >
            <div className="p-2 bg-stone-100 dark:bg-stone-700 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold">Create Empty</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">Start from scratch</p>
            </div>
          </button>
        </div>

        {/* Active Lists */}
        {activeLists.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
              Active Lists
            </h2>
            <div className="space-y-3">
              {activeLists.map(list => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onView={() => onViewList?.(list.id)}
                  onDelete={() => onDeleteList?.(list.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activeLists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-1">No active lists</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Create a new list or generate one from your meal plan
            </p>
          </div>
        )}

        {/* Archived Lists */}
        {archivedLists.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
              History
            </h2>
            <div className="space-y-3">
              {archivedLists.map(list => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onView={() => onViewList?.(list.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

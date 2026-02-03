import type { CookbooksProps } from '../types'
import { CookbookCard } from './CookbookCard'

export function Cookbooks({
  cookbooks,
  viewMode = 'grid',
  onViewModeChange,
  onViewCookbook,
  onCreateCookbook,
  onEditCookbook,
  onDeleteCookbook,
  onShareCookbook
}: CookbooksProps) {
  // Separate built-in and user cookbooks
  const builtInCookbooks = cookbooks.filter(c => c.isBuiltIn)
  const userCookbooks = cookbooks.filter(c => !c.isBuiltIn)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Cookbooks</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {cookbooks.length} {cookbooks.length === 1 ? 'cookbook' : 'cookbooks'}
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={onCreateCookbook}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Cookbook</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Built-in Cookbooks */}
        {builtInCookbooks.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Quick Access
            </h2>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {builtInCookbooks.map((cookbook) => (
                  <CookbookCard
                    key={cookbook.id}
                    cookbook={cookbook}
                    viewMode={viewMode}
                    onView={() => onViewCookbook?.(cookbook.id)}
                    onEdit={() => onEditCookbook?.(cookbook.id)}
                    onShare={() => onShareCookbook?.(cookbook.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {builtInCookbooks.map((cookbook) => (
                  <CookbookCard
                    key={cookbook.id}
                    cookbook={cookbook}
                    viewMode={viewMode}
                    onView={() => onViewCookbook?.(cookbook.id)}
                    onEdit={() => onEditCookbook?.(cookbook.id)}
                    onShare={() => onShareCookbook?.(cookbook.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* User Cookbooks */}
        <section>
          <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
            My Cookbooks
          </h2>
          {userCookbooks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-stone-900 dark:text-white text-lg mb-2">No cookbooks yet</h3>
              <p className="text-stone-500 dark:text-stone-400 mb-4">
                Create your first cookbook to organize your recipes
              </p>
              <button
                onClick={onCreateCookbook}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Create Cookbook
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {userCookbooks.map((cookbook) => (
                <CookbookCard
                  key={cookbook.id}
                  cookbook={cookbook}
                  viewMode={viewMode}
                  onView={() => onViewCookbook?.(cookbook.id)}
                  onEdit={() => onEditCookbook?.(cookbook.id)}
                  onDelete={() => onDeleteCookbook?.(cookbook.id)}
                  onShare={() => onShareCookbook?.(cookbook.id)}
                />
              ))}
              {/* Add New Card */}
              <button
                onClick={onCreateCookbook}
                className="aspect-[4/3] flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500 hover:border-orange-400 hover:text-orange-500 dark:hover:border-orange-500 dark:hover:text-orange-400 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">New Cookbook</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {userCookbooks.map((cookbook) => (
                <CookbookCard
                  key={cookbook.id}
                  cookbook={cookbook}
                  viewMode={viewMode}
                  onView={() => onViewCookbook?.(cookbook.id)}
                  onEdit={() => onEditCookbook?.(cookbook.id)}
                  onDelete={() => onDeleteCookbook?.(cookbook.id)}
                  onShare={() => onShareCookbook?.(cookbook.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

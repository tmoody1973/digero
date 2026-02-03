import type { Cookbook } from '../types'

interface CookbookCardProps {
  cookbook: Cookbook
  viewMode: 'grid' | 'list'
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CookbookCard({
  cookbook,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onShare
}: CookbookCardProps) {
  if (viewMode === 'list') {
    return (
      <div
        className="group flex items-center gap-4 p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all cursor-pointer"
        onClick={onView}
      >
        {/* Cover Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-700">
          <img
            src={cookbook.coverUrl}
            alt={cookbook.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {cookbook.name}
            </h3>
            {cookbook.isBuiltIn && (
              <span className="flex-shrink-0 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded uppercase">
                Built-in
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
            {cookbook.recipeCount} {cookbook.recipeCount === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare?.()
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!cookbook.isBuiltIn && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Chevron */}
        <svg className="w-5 h-5 text-stone-300 dark:text-stone-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    )
  }

  // Grid view
  return (
    <div
      className="group relative bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all cursor-pointer"
      onClick={onView}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-700 overflow-hidden">
        <img
          src={cookbook.coverUrl}
          alt={cookbook.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Recipe Count Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white text-sm font-medium px-2.5 py-1 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {cookbook.recipeCount}
        </div>

        {/* Built-in Badge */}
        {cookbook.isBuiltIn && (
          <div className="absolute top-3 left-3 text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Built-in
          </div>
        )}

        {/* Action Menu */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare?.()
            }}
            className="w-8 h-8 bg-white/90 dark:bg-stone-900/90 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-colors"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="w-8 h-8 bg-white/90 dark:bg-stone-900/90 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {!cookbook.isBuiltIn && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.()
              }}
              className="w-8 h-8 bg-white/90 dark:bg-stone-900/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-stone-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {cookbook.name}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
          {cookbook.description}
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
          Updated {formatDate(cookbook.updatedAt)}
        </p>
      </div>
    </div>
  )
}

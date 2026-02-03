import type { CookbookRecipe } from '../types'

interface CookbookRecipeCardProps {
  recipe: CookbookRecipe
  viewMode: 'grid' | 'list'
  isSelected?: boolean
  isSelectMode?: boolean
  onView?: () => void
  onToggleSelect?: () => void
  onRemove?: () => void
}

const sourceIcons: Record<string, React.ReactNode> = {
  youtube: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  website: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  scanned: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  manual: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function CookbookRecipeCard({
  recipe,
  viewMode,
  isSelected,
  isSelectMode,
  onView,
  onToggleSelect,
  onRemove
}: CookbookRecipeCardProps) {
  const handleClick = () => {
    if (isSelectMode) {
      onToggleSelect?.()
    } else {
      onView?.()
    }
  }

  if (viewMode === 'list') {
    return (
      <div
        className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600'
            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md'
        }`}
        onClick={handleClick}
      >
        {/* Selection Checkbox */}
        {isSelectMode && (
          <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'border-stone-300 dark:border-stone-600'
          }`}>
            {isSelected && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}

        {/* Thumbnail */}
        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-700">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              {sourceIcons[recipe.source]}
              <span className="capitalize">{recipe.source}</span>
            </span>
            <span>•</span>
            <span>Added {formatDate(recipe.dateAdded)}</span>
          </div>
        </div>

        {/* Remove Button */}
        {!isSelectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
            title="Remove from cookbook"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Drag Handle */}
        {!isSelectMode && (
          <div className="flex-shrink-0 text-stone-300 dark:text-stone-600 cursor-grab">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        )}
      </div>
    )
  }

  // Grid view
  return (
    <div
      className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
        isSelected
          ? 'border-orange-400 dark:border-orange-500 ring-2 ring-orange-400/50'
          : 'border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg'
      }`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-stone-100 dark:bg-stone-700 overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Selection Overlay */}
        {isSelectMode && (
          <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-orange-500/20' : ''}`} />
        )}

        {/* Selection Checkbox */}
        {isSelectMode && (
          <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'bg-white/90 dark:bg-stone-900/90 border-stone-300 dark:border-stone-600'
          }`}>
            {isSelected && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 text-xs px-2 py-1 rounded-full">
          {sourceIcons[recipe.source]}
        </div>

        {/* Remove Button */}
        {!isSelectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 dark:bg-stone-900/90 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
            title="Remove from cookbook"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-white dark:bg-stone-800">
        <h3 className="font-medium text-stone-900 dark:text-white text-sm line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {recipe.title}
        </h3>
      </div>
    </div>
  )
}

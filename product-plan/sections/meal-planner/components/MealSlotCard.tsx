import type { PlannedMeal, MealSlot } from '../types'

interface MealSlotCardProps {
  meal: PlannedMeal | null
  day: string
  slot: MealSlot
  isSelected?: boolean
  isSelectionMode?: boolean
  onTap?: () => void
  onRemove?: () => void
  onToggleSelect?: () => void
  onViewRecipe?: () => void
}

export function MealSlotCard({
  meal,
  slot,
  isSelected,
  isSelectionMode,
  onTap,
  onRemove,
  onToggleSelect,
  onViewRecipe
}: MealSlotCardProps) {
  const handleClick = () => {
    if (isSelectionMode && meal) {
      onToggleSelect?.()
    } else if (meal) {
      onViewRecipe?.()
    } else {
      onTap?.()
    }
  }

  if (!meal) {
    // Empty slot
    return (
      <button
        onClick={onTap}
        className="w-full h-16 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg flex items-center justify-center text-stone-400 dark:text-stone-500 hover:border-orange-300 dark:hover:border-orange-600 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    )
  }

  // Filled slot
  return (
    <div
      className={`group relative w-full rounded-lg overflow-hidden border transition-all cursor-pointer ${
        isSelected
          ? 'border-orange-400 dark:border-orange-500 ring-2 ring-orange-400/50 bg-orange-50 dark:bg-orange-900/20'
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 p-2">
        {/* Selection Checkbox */}
        {isSelectionMode && (
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
        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-stone-100 dark:bg-stone-700">
          <img
            src={meal.recipeImage}
            alt={meal.recipeName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-900 dark:text-white text-sm truncate">
            {meal.recipeName}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {meal.prepTime}
          </p>
        </div>

        {/* Remove Button */}
        {!isSelectionMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

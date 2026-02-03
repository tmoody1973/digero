import { useState } from 'react'
import type { RecipePickerItem, MealSlot } from '../types'

interface RecipePickerProps {
  recipes: RecipePickerItem[]
  filterCategory?: MealSlot | 'all'
  searchQuery?: string
  onSelectRecipe?: (recipeId: string) => void
  onFilterChange?: (category: MealSlot | 'all') => void
  onSearch?: (query: string) => void
}

const slotLabels: Record<MealSlot | 'all', string> = {
  all: 'All',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks'
}

export function RecipePicker({
  recipes,
  filterCategory = 'all',
  searchQuery = '',
  onSelectRecipe,
  onFilterChange,
  onSearch
}: RecipePickerProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory
    const matchesSearch = !localSearch ||
      recipe.name.toLowerCase().includes(localSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearch?.(value)
  }

  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <h3 className="font-bold text-stone-900 dark:text-white mb-3">Add Recipe</h3>

        {/* Search */}
        <div className="relative mb-3">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-8 pr-3 py-2 bg-stone-100 dark:bg-stone-800 border-0 rounded-lg text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {(['all', 'breakfast', 'lunch', 'dinner', 'snacks'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange?.(cat)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {slotLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-sm">
            No recipes found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => onSelectRecipe?.(recipe.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-stone-200 dark:bg-stone-700">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 dark:text-white text-sm truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {recipe.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {recipe.prepTime}
                  </p>
                </div>
                <svg className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-400 dark:text-stone-500 text-center">
        Tap a recipe to add, or drag to a slot
      </div>
    </div>
  )
}

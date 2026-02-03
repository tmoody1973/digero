import { useState } from 'react'
import type { CookbookDetailProps } from '../types'
import { CookbookRecipeCard } from './CookbookRecipeCard'

export function CookbookDetail({
  cookbook,
  recipes,
  sortBy = 'position',
  viewMode = 'grid',
  onSortChange,
  onViewModeChange,
  onViewRecipe,
  onRemoveRecipe,
  onRemoveRecipes,
  onEditCookbook,
  onShareCookbook,
  onBack
}: CookbookDetailProps) {
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([])

  // Sort recipes
  const sortedRecipes = [...recipes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'dateAdded':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case 'position':
      default:
        return a.position - b.position
    }
  })

  const handleToggleSelect = (recipeId: string) => {
    setSelectedRecipes(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRecipes.length === recipes.length) {
      setSelectedRecipes([])
    } else {
      setSelectedRecipes(recipes.map(r => r.recipeId))
    }
  }

  const handleRemoveSelected = () => {
    onRemoveRecipes?.(selectedRecipes)
    setSelectedRecipes([])
    setIsSelectMode(false)
  }

  const handleCancelSelect = () => {
    setSelectedRecipes([])
    setIsSelectMode(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
          <img
            src={cookbook.coverUrl}
            alt={cookbook.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onShareCookbook}
            className="w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
            title="Share"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={onEditCookbook}
            className="w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Cookbook Info Card */}
        <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                    {cookbook.name}
                  </h1>
                  {cookbook.isBuiltIn && (
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full uppercase">
                      Built-in
                    </span>
                  )}
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-1">
                  {cookbook.description}
                </p>
                <p className="text-sm text-stone-400 dark:text-stone-500 mt-2">
                  {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800 mt-4">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {isSelectMode ? (
            // Select Mode Controls
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {selectedRecipes.length === recipes.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {selectedRecipes.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelSelect}
                  className="px-4 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveSelected}
                  disabled={selectedRecipes.length === 0}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Remove ({selectedRecipes.length})
                </button>
              </div>
            </div>
          ) : (
            // Normal Controls
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange?.(e.target.value as 'position' | 'dateAdded' | 'title')}
                  className="text-sm font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="position">Manual Order</option>
                  <option value="dateAdded">Date Added</option>
                  <option value="title">Alphabetical</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                  <button
                    onClick={() => onViewModeChange?.('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onViewModeChange?.('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Select Mode Toggle */}
              {recipes.length > 0 && (
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Select
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipes */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {recipes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-white text-lg mb-2">No recipes yet</h3>
            <p className="text-stone-500 dark:text-stone-400">
              Add recipes from your library to this cookbook
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedRecipes.map((recipe) => (
              <CookbookRecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                viewMode={viewMode}
                isSelected={selectedRecipes.includes(recipe.recipeId)}
                isSelectMode={isSelectMode}
                onView={() => onViewRecipe?.(recipe.recipeId)}
                onToggleSelect={() => handleToggleSelect(recipe.recipeId)}
                onRemove={() => onRemoveRecipe?.(recipe.recipeId)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRecipes.map((recipe) => (
              <CookbookRecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                viewMode={viewMode}
                isSelected={selectedRecipes.includes(recipe.recipeId)}
                isSelectMode={isSelectMode}
                onView={() => onViewRecipe?.(recipe.recipeId)}
                onToggleSelect={() => handleToggleSelect(recipe.recipeId)}
                onRemove={() => onRemoveRecipe?.(recipe.recipeId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

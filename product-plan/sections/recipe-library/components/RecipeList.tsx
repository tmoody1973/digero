import { useState } from 'react'
import { Search, LayoutGrid, List, Youtube, Globe, Camera, PenLine, X } from 'lucide-react'
import type { RecipeLibraryProps } from '../types'
import { RecipeCard } from './RecipeCard'
import { AddRecipeMenu } from './AddRecipeMenu'

const filterOptions = [
  { value: 'all', label: 'All', icon: null },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { value: 'website', label: 'Website', icon: Globe, color: 'text-blue-500' },
  { value: 'scanned', label: 'Scanned', icon: Camera, color: 'text-amber-500' },
  { value: 'manual', label: 'Manual', icon: PenLine, color: 'text-green-500' },
] as const

export function RecipeList({
  recipes,
  viewMode = 'grid',
  onViewModeChange,
  searchQuery = '',
  onSearch,
  sourceFilter = 'all',
  onSourceFilterChange,
  onView,
  onSearchYouTube,
  onAddFromUrl,
  onStartScanSession,
  onManualEntry,
}: RecipeLibraryProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [localViewMode, setLocalViewMode] = useState(viewMode)
  const [localFilter, setLocalFilter] = useState(sourceFilter)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearch?.(value)
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setLocalViewMode(mode)
    onViewModeChange?.(mode)
  }

  const handleFilterChange = (filter: typeof sourceFilter) => {
    setLocalFilter(filter)
    onSourceFilterChange?.(filter)
  }

  // Filter recipes based on search and source
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      localSearch === '' ||
      recipe.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      recipe.ingredients.some((i) => i.name.toLowerCase().includes(localSearch.toLowerCase()))

    const matchesFilter = localFilter === 'all' || recipe.source === localFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="relative min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-lg dark:border-stone-800 dark:bg-stone-900/80">
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-12 text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500"
            />
            {localSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-600 dark:hover:bg-stone-700 dark:hover:text-stone-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters and View Toggle */}
          <div className="mt-4 flex items-center justify-between gap-4">
            {/* Source Filters */}
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {filterOptions.map((option) => {
                const isActive = localFilter === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`h-4 w-4 ${isActive ? 'text-white' : option.color}`}
                      />
                    )}
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>

            {/* View Toggle */}
            <div className="flex shrink-0 items-center rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-800">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`rounded-md p-2 transition-all ${
                  localViewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`rounded-md p-2 transition-all ${
                  localViewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Results count */}
        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
          {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
          {localFilter !== 'all' && ` in ${localFilter}`}
          {localSearch && ` matching "${localSearch}"`}
        </p>

        {/* Recipe Grid/List */}
        {filteredRecipes.length > 0 ? (
          <div
            className={
              localViewMode === 'grid'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                viewMode={localViewMode}
                onView={() => onView?.(recipe.id)}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
              <Search className="h-10 w-10 text-stone-300 dark:text-stone-600" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              No recipes found
            </h3>
            <p className="mt-1 text-stone-500 dark:text-stone-400">
              {localSearch
                ? 'Try a different search term'
                : 'Add your first recipe to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <AddRecipeMenu
          onSearchYouTube={onSearchYouTube}
          onAddFromUrl={onAddFromUrl}
          onStartScanSession={onStartScanSession}
          onManualEntry={onManualEntry}
        />
      </div>
    </div>
  )
}

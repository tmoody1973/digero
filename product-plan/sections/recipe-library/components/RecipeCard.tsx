import { Clock, Youtube, Globe, Camera, PenLine } from 'lucide-react'
import type { Recipe } from '../types'

interface RecipeCardProps {
  recipe: Recipe
  viewMode: 'grid' | 'list'
  onView?: () => void
}

const sourceConfig = {
  youtube: { icon: Youtube, label: 'YouTube', color: 'bg-red-500' },
  website: { icon: Globe, label: 'Website', color: 'bg-blue-500' },
  scanned: { icon: Camera, label: 'Scanned', color: 'bg-amber-500' },
  manual: { icon: PenLine, label: 'Manual', color: 'bg-green-500' },
}

export function RecipeCard({ recipe, viewMode, onView }: RecipeCardProps) {
  const source = sourceConfig[recipe.source]
  const SourceIcon = source.icon
  const totalTime = recipe.prepTime + recipe.cookTime

  if (viewMode === 'list') {
    return (
      <button
        onClick={onView}
        className="group flex w-full items-center gap-4 rounded-xl border border-stone-200 bg-white p-3 text-left transition-all hover:border-orange-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-orange-600"
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Source badge */}
          <div
            className={`absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full ${source.color}`}
          >
            <SourceIcon className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-stone-900 dark:text-stone-100">
            {recipe.title}
          </h3>
          {recipe.scannedFromBook && (
            <p className="truncate text-sm text-stone-500 dark:text-stone-400">
              from {recipe.scannedFromBook.name}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalTime} min
            </span>
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="text-stone-300 transition-colors group-hover:text-orange-500 dark:text-stone-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    )
  }

  // Grid view
  return (
    <button
      onClick={onView}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left transition-all hover:border-orange-300 hover:shadow-lg dark:border-stone-700 dark:bg-stone-800 dark:hover:border-orange-600"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Source badge */}
        <div
          className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white ${source.color}`}
        >
          <SourceIcon className="h-3.5 w-3.5" />
          <span>{source.label}</span>
        </div>

        {/* Time badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm dark:bg-stone-900/90 dark:text-stone-200">
          <Clock className="h-3.5 w-3.5" />
          {totalTime} min
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-tight text-stone-900 dark:text-stone-100">
          {recipe.title}
        </h3>
        {recipe.scannedFromBook && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            from {recipe.scannedFromBook.name}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <span>{recipe.servings} servings</span>
          <span className="text-stone-300 dark:text-stone-600">•</span>
          <span>{recipe.nutrition.calories} cal</span>
        </div>
      </div>
    </button>
  )
}

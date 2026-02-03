import { useState } from 'react'
import {
  ArrowLeft,
  Clock,
  Users,
  Youtube,
  Globe,
  Camera,
  PenLine,
  Minus,
  Plus,
  Leaf,
  ShoppingCart,
  Calendar,
  BookOpen,
  Share2,
  Trash2,
  Edit,
  Check,
  Flame,
} from 'lucide-react'
import type { Ingredient, RecipeDetailProps } from '../types'

const sourceConfig = {
  youtube: { icon: Youtube, label: 'YouTube', color: 'bg-red-500' },
  website: { icon: Globe, label: 'Website', color: 'bg-blue-500' },
  scanned: { icon: Camera, label: 'Scanned', color: 'bg-amber-500' },
  manual: { icon: PenLine, label: 'Manual', color: 'bg-green-500' },
}

interface NutritionBadgeProps {
  label: string
  value: number
  unit: string
  color: string
}

function NutritionBadge({ label, value, unit, color }: NutritionBadgeProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-stone-100 px-4 py-3 dark:bg-stone-800">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-stone-500 dark:text-stone-400">{unit}</span>
      <span className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-300">{label}</span>
    </div>
  )
}

export function RecipeDetail({
  recipe,
  currentServings,
  scaledIngredients,
  onScaleServings,
  onConvertVegan,
  onConvertVegetarian,
  onAddAllToShoppingList,
  onAddSelectedToShoppingList,
  onAddToMealPlan,
  onAddToCookbook,
  onEdit,
  onShare,
  onDelete,
  onBack,
}: RecipeDetailProps) {
  const [servings, setServings] = useState(currentServings ?? recipe.servings)
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([])
  const [showIngredientSelect, setShowIngredientSelect] = useState(false)

  const source = sourceConfig[recipe.source]
  const SourceIcon = source.icon
  const totalTime = recipe.prepTime + recipe.cookTime

  // Calculate scaled ingredients
  const scaleFactor = servings / recipe.servings
  const displayIngredients: Ingredient[] = scaledIngredients ?? recipe.ingredients.map((ing) => ({
    ...ing,
    quantity: Math.round(ing.quantity * scaleFactor * 100) / 100,
  }))

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, servings + delta)
    setServings(newServings)
    onScaleServings?.(newServings)
  }

  const toggleIngredientSelection = (index: number) => {
    setSelectedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const handleAddSelectedToShoppingList = () => {
    onAddSelectedToShoppingList?.(selectedIngredients)
    setSelectedIngredients([])
    setShowIngredientSelect(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Hero Image */}
      <div className="relative">
        <div className="aspect-[16/10] w-full overflow-hidden sm:aspect-[21/9]">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white dark:bg-stone-900/90 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Action buttons */}
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={onShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white dark:bg-stone-900/90 dark:text-stone-200"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={onEdit}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white dark:bg-stone-900/90 dark:text-stone-200"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div
            className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white ${source.color}`}
          >
            <SourceIcon className="h-4 w-4" />
            <span>{source.label}</span>
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{recipe.title}</h1>
          {recipe.scannedFromBook && (
            <p className="mt-1 text-white/80">from {recipe.scannedFromBook.name}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Total Time</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{totalTime} min</p>
            </div>
          </div>
          <div className="h-10 w-px bg-stone-200 dark:bg-stone-700" />
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Prep</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{recipe.prepTime} min</p>
            </div>
          </div>
          <div className="h-10 w-px bg-stone-200 dark:bg-stone-700" />
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-stone-400" />
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Cook</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{recipe.cookTime} min</p>
            </div>
          </div>
        </div>

        {/* YouTube Video Embed */}
        {recipe.youtubeVideoId && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Watch the Video
            </h2>
            <div className="aspect-video overflow-hidden rounded-2xl bg-stone-900">
              <iframe
                src={`https://www.youtube.com/embed/${recipe.youtubeVideoId}`}
                title={recipe.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Nutrition */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Nutrition per Serving
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <NutritionBadge
              label="Calories"
              value={recipe.nutrition.calories}
              unit="kcal"
              color="text-orange-500"
            />
            <NutritionBadge
              label="Protein"
              value={recipe.nutrition.protein}
              unit="g"
              color="text-red-500"
            />
            <NutritionBadge
              label="Carbs"
              value={recipe.nutrition.carbs}
              unit="g"
              color="text-amber-500"
            />
            <NutritionBadge
              label="Fat"
              value={recipe.nutrition.fat}
              unit="g"
              color="text-green-500"
            />
          </div>
        </div>

        {/* Diet Conversion */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Dietary Options
          </h2>
          <div className="flex gap-3">
            <button
              onClick={onConvertVegan}
              className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-700 transition-all hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            >
              <Leaf className="h-5 w-5" />
              Convert to Vegan
            </button>
            <button
              onClick={onConvertVegetarian}
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
            >
              <Leaf className="h-5 w-5" />
              Convert to Vegetarian
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Ingredients
            </h2>
            {/* Servings adjuster */}
            <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-2 py-1 dark:border-stone-700 dark:bg-stone-800">
              <button
                onClick={() => handleServingsChange(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-stone-400" />
                <span className="min-w-[2ch] text-center font-semibold text-stone-900 dark:text-stone-100">
                  {servings}
                </span>
              </div>
              <button
                onClick={() => handleServingsChange(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
            {displayIngredients.map((ingredient, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-b-0 dark:border-stone-700 ${
                  showIngredientSelect ? 'cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50' : ''
                }`}
                onClick={() => showIngredientSelect && toggleIngredientSelection(index)}
              >
                {showIngredientSelect && (
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      selectedIngredients.includes(index)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    {selectedIngredients.includes(index) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                )}
                <span className="min-w-[4rem] font-mono text-sm text-orange-600 dark:text-orange-400">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span className="text-stone-900 dark:text-stone-100">{ingredient.name}</span>
              </div>
            ))}
          </div>

          {/* Shopping list actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            {showIngredientSelect ? (
              <>
                <button
                  onClick={handleAddSelectedToShoppingList}
                  disabled={selectedIngredients.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-white transition-all hover:bg-orange-600 disabled:opacity-50"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add {selectedIngredients.length} Selected
                </button>
                <button
                  onClick={() => {
                    setShowIngredientSelect(false)
                    setSelectedIngredients([])
                  }}
                  className="rounded-xl border border-stone-200 px-4 py-3 font-medium text-stone-600 transition-all hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAddAllToShoppingList}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-white transition-all hover:bg-orange-600"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add All to Shopping List
                </button>
                <button
                  onClick={() => setShowIngredientSelect(true)}
                  className="rounded-xl border border-stone-200 px-4 py-3 font-medium text-stone-600 transition-all hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Select Items
                </button>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Instructions
          </h2>
          <div className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
                  {index + 1}
                </div>
                <p className="pt-1 text-stone-700 dark:text-stone-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Notes
            </h2>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              {recipe.notes}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-stone-200 pt-6 dark:border-stone-700">
          <button
            onClick={onAddToMealPlan}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 font-medium text-stone-700 transition-all hover:border-orange-300 hover:bg-orange-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-orange-600 dark:hover:bg-orange-900/30"
          >
            <Calendar className="h-5 w-5 text-orange-500" />
            Add to Meal Plan
          </button>
          <button
            onClick={onAddToCookbook}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 font-medium text-stone-700 transition-all hover:border-orange-300 hover:bg-orange-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-orange-600 dark:hover:bg-orange-900/30"
          >
            <BookOpen className="h-5 w-5 text-orange-500" />
            Add to Cookbook
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-800 dark:bg-stone-800 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-5 w-5" />
            Delete Recipe
          </button>
        </div>
      </div>
    </div>
  )
}

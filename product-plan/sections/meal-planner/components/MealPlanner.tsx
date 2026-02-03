import { useState } from 'react'
import type { MealPlannerProps, MealSlot, PlannedMeal } from '../types'
import { MealSlotCard } from './MealSlotCard'
import { RecipePicker } from './RecipePicker'

const slotLabels: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks'
}

const slotIcons: Record<MealSlot, React.ReactNode> = {
  breakfast: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  lunch: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  dinner: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  snacks: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function getDayInfo(dateString: string): { dayName: string; dateNumber: string; isToday: boolean } {
  const date = new Date(dateString)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dateNumber = date.getDate().toString()
  return { dayName, dateNumber, isToday }
}

function getWeekDays(startDate: string): string[] {
  const start = new Date(startDate)
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day.toISOString().split('T')[0])
  }
  return days
}

export function MealPlanner({
  currentWeek,
  mealSlots,
  plannedMeals,
  recipePickerItems,
  isSelectionMode = false,
  selectedMealIds = [],
  onPreviousWeek,
  onNextWeek,
  onToday,
  onRemoveMeal,
  onSlotTap,
  onViewRecipe,
  onClearDay,
  onClearWeek,
  onEnterSelectionMode,
  onExitSelectionMode,
  onToggleMealSelection,
  onSelectDay,
  onGenerateShoppingList
}: MealPlannerProps) {
  const [showPicker, setShowPicker] = useState(true)
  const [filterCategory, setFilterCategory] = useState<MealSlot | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const weekDays = getWeekDays(currentWeek.startDate)

  const getMealForSlot = (day: string, slot: MealSlot): PlannedMeal | null => {
    return plannedMeals.find(m => m.day === day && m.slot === slot) || null
  }

  const getMealsForDay = (day: string): PlannedMeal[] => {
    return plannedMeals.filter(m => m.day === day)
  }

  const handleGenerateList = () => {
    onGenerateShoppingList?.(selectedMealIds)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Meal Plan</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {plannedMeals.length} meals planned this week
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isSelectionMode ? (
                <>
                  <button
                    onClick={onExitSelectionMode}
                    className="px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateList}
                    disabled={selectedMealIds.length === 0}
                    className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Shopping List ({selectedMealIds.length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onEnterSelectionMode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Shop
                  </button>
                  <button
                    onClick={onClearWeek}
                    className="px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-red-500 transition-colors"
                  >
                    Clear Week
                  </button>
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className={`p-2 rounded-lg transition-colors ${
                      showPicker
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                    title={showPicker ? 'Hide recipe picker' : 'Show recipe picker'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onPreviousWeek}
              className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-stone-900 dark:text-white">
                {currentWeek.weekLabel}
              </span>
              <button
                onClick={onToday}
                className="px-3 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              >
                Today
              </button>
            </div>

            <button
              onClick={onNextWeek}
              className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map((day) => {
                const { dayName, dateNumber, isToday } = getDayInfo(day)
                const dayMeals = getMealsForDay(day)
                return (
                  <div
                    key={day}
                    className={`text-center p-2 rounded-xl ${
                      isToday
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-stone-800'
                    }`}
                  >
                    <p className={`text-xs font-medium ${isToday ? 'text-orange-100' : 'text-stone-500 dark:text-stone-400'}`}>
                      {dayName}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-stone-900 dark:text-white'}`}>
                      {dateNumber}
                    </p>
                    {isSelectionMode && dayMeals.length > 0 && (
                      <button
                        onClick={() => onSelectDay?.(day)}
                        className={`mt-1 text-xs font-medium ${
                          isToday ? 'text-orange-100 hover:text-white' : 'text-orange-500 hover:text-orange-600'
                        }`}
                      >
                        Select all
                      </button>
                    )}
                    {!isSelectionMode && dayMeals.length > 0 && (
                      <button
                        onClick={() => onClearDay?.(day)}
                        className={`mt-1 text-xs ${
                          isToday ? 'text-orange-100 hover:text-white' : 'text-stone-400 hover:text-red-500'
                        }`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Meal Slots Grid */}
            {mealSlots.map((slot) => (
              <div key={slot} className="mb-4">
                {/* Slot Label */}
                <div className="flex items-center gap-2 mb-2 text-stone-500 dark:text-stone-400">
                  {slotIcons[slot]}
                  <span className="text-sm font-medium">{slotLabels[slot]}</span>
                </div>

                {/* Slot Row */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const meal = getMealForSlot(day, slot)
                    return (
                      <MealSlotCard
                        key={`${day}-${slot}`}
                        meal={meal}
                        day={day}
                        slot={slot}
                        isSelected={meal ? selectedMealIds.includes(meal.id) : false}
                        isSelectionMode={isSelectionMode}
                        onTap={() => onSlotTap?.(day, slot)}
                        onRemove={() => meal && onRemoveMeal?.(meal.id)}
                        onToggleSelect={() => meal && onToggleMealSelection?.(meal.id)}
                        onViewRecipe={() => meal && onViewRecipe?.(meal.recipeId)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recipe Picker Sidebar */}
        {showPicker && !isSelectionMode && (
          <RecipePicker
            recipes={recipePickerItems}
            filterCategory={filterCategory}
            searchQuery={searchQuery}
            onSelectRecipe={(recipeId) => console.log('Select recipe:', recipeId)}
            onFilterChange={setFilterCategory}
            onSearch={setSearchQuery}
          />
        )}
      </div>
    </div>
  )
}

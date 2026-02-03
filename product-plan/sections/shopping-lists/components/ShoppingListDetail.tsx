import { useState } from 'react'
import type { ShoppingListDetailProps, ItemCategory, ShoppingItem } from '../types'
import { ShoppingItemRow } from './ShoppingItemRow'

const categoryIcons: Record<ItemCategory, React.ReactNode> = {
  'Produce': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  'Meat & Seafood': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  'Dairy & Eggs': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  'Pantry': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  'Bakery': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
    </svg>
  ),
  'Frozen': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18l4 4m-4-4L8 7m4 14l4-4m-4 4l-4-4m-5-5h18M3 12l4-4M3 12l4 4m14-4l-4-4m4 4l-4 4" />
    </svg>
  ),
  'Beverages': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Household': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

export function ShoppingListDetail({
  list,
  categories,
  viewMode,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onViewModeChange,
  onRenameList,
  onShareList,
  onBack
}: ShoppingListDetailProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemUnit, setNewItemUnit] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Pantry')
  const [isRenaming, setIsRenaming] = useState(false)
  const [listName, setListName] = useState(list.name)

  const progress = list.totalItems > 0 ? (list.checkedItems / list.totalItems) * 100 : 0

  // Group items by category
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = list.items.filter(item => item.category === cat)
    return acc
  }, {} as Record<ItemCategory, ShoppingItem[]>)

  // Group items by recipe
  const itemsByRecipe = list.items.reduce((acc, item) => {
    const recipeName = item.recipeName || 'Custom Items'
    if (!acc[recipeName]) acc[recipeName] = []
    acc[recipeName].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem?.(
        newItemName.trim(),
        parseFloat(newItemQuantity) || 1,
        newItemUnit.trim() || 'item',
        newItemCategory
      )
      setNewItemName('')
      setNewItemQuantity('1')
      setNewItemUnit('')
      setShowAddForm(false)
    }
  }

  const handleRename = () => {
    if (listName.trim() && listName !== list.name) {
      onRenameList?.(listName.trim())
    }
    setIsRenaming(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="text-xl font-bold bg-transparent border-b-2 border-orange-500 text-stone-900 dark:text-white focus:outline-none"
                    autoFocus
                    onBlur={handleRename}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsRenaming(true)}
                  className="flex items-center gap-2 group"
                >
                  <h1 className="text-xl font-bold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {list.name}
                  </h1>
                  <svg className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={onShareList}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {list.checkedItems} of {list.totalItems} items
              </span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress === 100 ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange?.('category')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'category'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                By Aisle
              </button>
              <button
                onClick={() => onViewModeChange?.('recipe')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'recipe'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                By Recipe
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showAddForm
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="p-4 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <div className="space-y-3">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />

            <div className="flex gap-3">
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="Qty"
                className="w-20 px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                step="0.5"
                min="0"
              />
              <input
                type="text"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="Unit (e.g., lbs)"
                className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-stone-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Add to List
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {viewMode === 'category' ? (
          // Category View
          categories.map(category => {
            const items = itemsByCategory[category]
            if (!items || items.length === 0) return null

            const checkedCount = items.filter(i => i.isChecked).length
            const allChecked = checkedCount === items.length

            return (
              <section key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${allChecked ? 'text-stone-400 dark:text-stone-500' : 'text-orange-500 dark:text-orange-400'}`}>
                    {categoryIcons[category]}
                  </span>
                  <h2 className={`font-semibold ${
                    allChecked
                      ? 'text-stone-400 dark:text-stone-500'
                      : 'text-stone-900 dark:text-white'
                  }`}>
                    {category}
                  </h2>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {checkedCount}/{items.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map(item => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => onToggleItem?.(item.id)}
                      onEdit={(qty, unit) => onEditItem?.(item.id, qty, unit)}
                      onDelete={() => onDeleteItem?.(item.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          // Recipe View
          Object.entries(itemsByRecipe).map(([recipeName, items]) => {
            const checkedCount = items.filter(i => i.isChecked).length
            const allChecked = checkedCount === items.length

            return (
              <section key={recipeName}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${allChecked ? 'text-stone-400 dark:text-stone-500' : 'text-orange-500 dark:text-orange-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </span>
                  <h2 className={`font-semibold ${
                    allChecked
                      ? 'text-stone-400 dark:text-stone-500'
                      : 'text-stone-900 dark:text-white'
                  }`}>
                    {recipeName}
                  </h2>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {checkedCount}/{items.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map(item => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => onToggleItem?.(item.id)}
                      onEdit={(qty, unit) => onEditItem?.(item.id, qty, unit)}
                      onDelete={() => onDeleteItem?.(item.id)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}

        {/* Empty State */}
        {list.items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-1">No items yet</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Add items manually or generate from your meal plan
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

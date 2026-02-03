import { useState } from 'react'
import type { ShoppingItem } from '../types'

interface ShoppingItemRowProps {
  item: ShoppingItem
  onToggle?: () => void
  onEdit?: (quantity: number, unit: string) => void
  onDelete?: () => void
}

export function ShoppingItemRow({
  item,
  onToggle,
  onEdit,
  onDelete
}: ShoppingItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [unit, setUnit] = useState(item.unit)

  const handleSave = () => {
    const newQuantity = parseFloat(quantity) || item.quantity
    onEdit?.(newQuantity, unit)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setQuantity(item.quantity.toString())
    setUnit(item.unit)
    setIsEditing(false)
  }

  return (
    <div
      className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
        item.isChecked
          ? 'bg-stone-50 dark:bg-stone-800/50'
          : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/50'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          item.isChecked
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-stone-300 dark:border-stone-600 hover:border-green-400 dark:hover:border-green-500'
        }`}
      >
        {item.isChecked && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-16 px-2 py-1 text-sm bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              step="0.5"
              min="0"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-20 px-2 py-1 text-sm bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-stone-400 hover:text-stone-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              className={`font-medium ${
                item.isChecked
                  ? 'text-stone-400 dark:text-stone-500 line-through'
                  : 'text-stone-900 dark:text-white'
              }`}
            >
              {item.name}
            </span>
            <span
              className={`text-sm ${
                item.isChecked
                  ? 'text-stone-400 dark:text-stone-500'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {item.quantity} {item.unit}
            </span>
            {item.isCustom && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                Custom
              </span>
            )}
          </div>
        )}

        {/* Recipe source (only shown in category view when not editing) */}
        {!isEditing && item.recipeName && (
          <p className={`text-xs mt-0.5 ${
            item.isChecked
              ? 'text-stone-400 dark:text-stone-500'
              : 'text-stone-400 dark:text-stone-500'
          }`}>
            from {item.recipeName}
          </p>
        )}
      </div>

      {/* Actions */}
      {!isEditing && !item.isChecked && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-stone-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Link, Camera, PenLine, X } from 'lucide-react'

interface AddRecipeMenuProps {
  onSearchYouTube?: () => void
  onAddFromUrl?: () => void
  onStartScanSession?: () => void
  onManualEntry?: () => void
}

export function AddRecipeMenu({
  onSearchYouTube,
  onAddFromUrl,
  onStartScanSession,
  onManualEntry,
}: AddRecipeMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    {
      icon: Search,
      label: 'Search YouTube',
      description: 'Find recipe videos',
      onClick: onSearchYouTube,
      color: 'text-red-500',
    },
    {
      icon: Link,
      label: 'Paste URL',
      description: 'From YouTube or website',
      onClick: onAddFromUrl,
      color: 'text-blue-500',
    },
    {
      icon: Camera,
      label: 'Scan Cookbook',
      description: 'Take photos of recipes',
      onClick: onStartScanSession,
      color: 'text-amber-500',
    },
    {
      icon: PenLine,
      label: 'Manual Entry',
      description: 'Create from scratch',
      onClick: onManualEntry,
      color: 'text-green-500',
    },
  ]

  return (
    <div className="relative" ref={menuRef}>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl active:scale-95 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-800">
          <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-700">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Add Recipe</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Choose how to add your recipe
            </p>
          </div>
          <div className="p-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 ${item.color}`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">{item.label}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Settings, LogOut, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user: {
    name: string
    avatarUrl?: string
  }
  onLogout?: () => void
  onSettings?: () => void
}

export function UserMenu({ user, onLogout, onSettings }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get initials from name
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600 dark:bg-orange-900 dark:text-orange-300">
            {initials}
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-800">
          <div className="border-b border-stone-100 px-4 py-2 dark:border-stone-700">
            <p className="font-medium text-stone-900 dark:text-stone-100">{user.name}</p>
          </div>
          <button
            onClick={() => {
              onSettings?.()
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => {
              onLogout?.()
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-700"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

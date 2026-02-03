import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  onNavigate?: (href: string) => void
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
              item.isActive
                ? 'text-orange-500'
                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
            }`}
          >
            <span className="h-6 w-6">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

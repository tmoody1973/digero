import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: {
    name: string
    avatarUrl?: string
  }
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSettings?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
  onSettings,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans dark:bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-orange-500">Digero</span>
        </div>
        {user && (
          <UserMenu
            user={user}
            onLogout={onLogout}
            onSettings={onSettings}
          />
        )}
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-auto pb-16">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <MainNav
        items={navigationItems}
        onNavigate={onNavigate}
      />
    </div>
  )
}

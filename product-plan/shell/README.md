# Application Shell

The application shell provides the persistent navigation and layout for Digero.

## Components

### AppShell.tsx

The main wrapper component that provides:
- Fixed header with app logo
- User menu dropdown
- Bottom tab navigation
- Content area for section screens

```tsx
import { AppShell } from './components'

<AppShell
  navigationItems={[
    { label: 'Recipes', href: '/recipes', icon: <BookOpen />, isActive: true },
    { label: 'Discover', href: '/discover', icon: <Compass /> },
    { label: 'Cookbooks', href: '/cookbooks', icon: <Library /> },
    { label: 'Planner', href: '/planner', icon: <Calendar /> },
    { label: 'Lists', href: '/lists', icon: <ShoppingCart /> },
  ]}
  user={{ name: 'John Doe' }}
  onNavigate={(href) => router.push(href)}
  onLogout={() => signOut()}
  onSettings={() => router.push('/settings')}
>
  {/* Your section content */}
</AppShell>
```

### MainNav.tsx

Bottom tab navigation bar. Used internally by AppShell.

### UserMenu.tsx

Dropdown menu with user avatar, settings, and logout. Used internally by AppShell.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Section content to render |
| `navigationItems` | `NavigationItem[]` | Tab items for bottom nav |
| `user` | `{ name, avatarUrl? }` | Current user for header |
| `onNavigate` | `(href) => void` | Handle tab navigation |
| `onLogout` | `() => void` | Handle logout action |
| `onSettings` | `() => void` | Handle settings navigation |

## Design Tokens

The shell uses:
- **Orange** (`orange-500`) for logo and active nav items
- **Stone** palette for backgrounds and text
- Mobile-first with fixed header and bottom nav

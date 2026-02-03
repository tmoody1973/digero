# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Colors:**
- Primary: `orange` — buttons, links, accents
- Secondary: `green` — success states, checkmarks
- Neutral: `stone` — backgrounds, text, borders

**Typography:**
- Nunito Sans for headings and body
- IBM Plex Mono for technical/code text

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

### 3. Routing Structure

Create placeholder routes for each section:

| Route | Section |
|-------|---------|
| `/recipes` | Recipe Library (default) |
| `/recipes/:id` | Recipe Detail |
| `/discover` | Discover Channels |
| `/discover/channel/:id` | Channel Detail |
| `/cookbooks` | Cookbooks List |
| `/cookbooks/:id` | Cookbook Detail |
| `/plan` | Meal Planner |
| `/shop` | Shopping Lists |
| `/shop/:id` | Shopping List Detail |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with header and bottom nav
- `MainNav.tsx` — Bottom tab bar navigation
- `UserMenu.tsx` — User avatar with dropdown menu

**Wire Up Navigation:**

Connect navigation to your routing:

| Tab | Icon | Route |
|-----|------|-------|
| Recipes | UtensilsCrossed | `/recipes` |
| Discover | Compass | `/discover` |
| Cookbooks | BookOpen | `/cookbooks` |
| Plan | Calendar | `/plan` |
| Shop | ShoppingCart | `/shop` |

**User Menu:**

The user menu expects:
- User name (or email)
- Avatar URL (optional, falls back to initials)
- Settings callback
- Logout callback

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, fonts)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with header and bottom navigation
- [ ] Navigation links to correct routes
- [ ] Active tab is highlighted
- [ ] User menu shows user info
- [ ] Responsive on mobile
- [ ] Dark mode works

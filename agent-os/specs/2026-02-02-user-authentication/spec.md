# Specification: User Authentication

## Goal

Implement Clerk authentication with email/password, Apple Sign-In, and Google Sign-In, including session management, protected routes, and a first-time user onboarding flow that captures cooking skill level and dietary restrictions.

## User Stories

- As a new user, I want to sign up with my email or social account so that I can securely access my recipe data
- As a returning user, I want to remain signed in until I explicitly log out so that I can quickly access the app

## Specific Requirements

**Email/Password Authentication**
- Implement Clerk email/password sign-up and sign-in flows
- Include password reset functionality via Clerk's built-in flow
- Display appropriate error messages for invalid credentials or existing accounts
- Support email verification if enabled in Clerk dashboard

**Apple Sign-In**
- Integrate Apple Sign-In using `@clerk/clerk-expo` OAuth flow
- Required for iOS App Store compliance when offering social login
- Handle both first-time and returning Apple ID users
- Extract name and email from Apple ID token when available

**Google Sign-In**
- Integrate Google Sign-In using `@clerk/clerk-expo` OAuth flow
- Configure Google OAuth credentials in Clerk dashboard
- Handle both first-time and returning Google account users

**First-Time User Onboarding Flow**
- Display 3-4 feature introduction screens after first sign-up (recipe saving, cookbook organization, meal planning, shopping lists)
- Include profile setup screen capturing cooking skill level (Beginner, Intermediate, Advanced)
- Include multi-select for dietary restrictions: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Halal, Kosher, Low-Carb/Keto
- Navigate to main app (Recipe List) upon completion
- Skip onboarding for returning users who already completed it

**Convex User Sync via Webhook**
- Configure Clerk webhook to notify Convex on user creation/update events
- Create/update user record in Convex `users` table with Clerk data (clerkId, email, name, avatarUrl)
- Store custom profile fields (cookingSkillLevel, dietaryRestrictions) in Convex
- Index `users` table by `clerkId` for efficient lookups

**Protected Routes and Navigation Guard**
- Wrap all app routes (except auth screens) with authentication check
- Redirect unauthenticated users to sign-in screen
- Use expo-router navigation guards or layout-based auth checks
- Ensure deep links respect authentication state

**Session Management**
- Use Clerk default persistent sessions with automatic token refresh
- Users remain signed in until explicit logout
- Provide logout functionality via existing UserMenu component's `onLogout` callback

**Account Deletion**
- Implement account deletion with confirmation dialog
- Delete user data immediately upon confirmation (no recovery window)
- Clear local session and navigate to sign-in screen after deletion
- Remove associated Convex user record via webhook or direct API call

## Existing Code to Leverage

**UserMenu Component (`product-plan/shell/components/UserMenu.tsx`)**
- Already designed with `onLogout` and `onSettings` callbacks
- Expects user object with `name: string` and optional `avatarUrl: string`
- Displays user initials fallback when no avatar provided
- Integrate Clerk `signOut()` with the `onLogout` callback

**AppShell Component (`product-plan/shell/components/AppShell.tsx`)**
- Wraps authenticated app content with header and bottom navigation
- Conditionally renders UserMenu when `user` prop is provided
- Pass Clerk user data (name, avatarUrl) to the `user` prop
- Connect navigation callbacks to expo-router

**Design System Tokens (`product-plan/design-system/`)**
- Use orange-500 for primary buttons and active states
- Use stone palette for backgrounds, text, and borders
- Nunito Sans for typography
- Support dark mode with Tailwind `dark:` variants

**Data Model Types (`product-plan/data-model/types.ts`)**
- Follow existing TypeScript interface patterns
- Add User interface to types following same structure
- Use consistent naming conventions (camelCase for properties)

## Out of Scope

- Multi-device session management UI (viewing/revoking sessions on other devices)
- Profile editing screen after initial onboarding (profile set once during onboarding for MVP)
- Custom dietary restriction input (only predefined options)
- Social features (following other users, sharing profiles)
- Two-factor authentication
- Biometric authentication (Face ID, Touch ID)
- Username-based login (email only)
- Phone number authentication
- Magic link authentication
- Guest mode or anonymous browsing
- User role/permission system

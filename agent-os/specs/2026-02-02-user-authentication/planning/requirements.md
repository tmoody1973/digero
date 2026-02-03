# Spec Requirements: User Authentication

## Initial Description

Implement Clerk authentication with email/social sign-in, session management, and protected routes. Users can create accounts and securely access their data.

**Source:** Product Roadmap - Week 1: Foundation and Core Flow (Feature #1)

**Effort Estimate:** Small (S) - 2-3 days

**Priority:** Critical - Required for all user-specific features

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll implement both email/password and Apple Sign-In as authentication methods, since Apple Sign-In is required for iOS App Store apps that offer social login. Should we also include Google Sign-In, or keep it minimal with just email and Apple for the hackathon?

**Answer:** Use ALL THREE - Email/Password, Apple Sign-In, AND Google Sign-In.

**Q2:** For user profile data, I assume we'll only store the minimal user information Clerk provides by default (email, name, profile image) and not build a custom profile editing screen for the MVP. Is that correct, or do you need users to set additional profile fields?

**Answer:** Include ADDITIONAL fields beyond Clerk defaults: cooking skill level and dietary restrictions.

**Q3:** For session management, I assume we'll use Clerk's default behavior - keeping users signed in until they explicitly sign out, with automatic token refresh. Is that acceptable?

**Answer:** Yes, use Clerk defaults (persistent sessions with auto-refresh).

**Q4:** I assume the authentication flow will be: splash/onboarding screen, then sign-in/sign-up screens, with automatic navigation to the main app once authenticated. Should we include a brief onboarding tutorial after first sign-up?

**Answer:** YES, include onboarding tutorial after first sign-up.

**Q5:** For protected routes, I assume ALL app screens (except sign-in/sign-up) require authentication - there's no "guest mode" or public browsing. Is that correct?

**Answer:** Yes, all screens require authentication. No guest mode.

**Q6:** Is there anything that should explicitly be excluded from this authentication feature? For example, should we defer password reset flows, account deletion, or multi-device session management to a later phase?

**Answer:** No - include everything (password reset, account deletion, etc.).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: UserMenu component - Path: `product-plan/ui-components/shell/` (expects `{ name: string, avatarUrl?: string }`, `onLogout`, `onSettings` callbacks)
- Feature: AppShell component - Path: `product-plan/ui-components/shell/` (needs user object, onLogout, onSettings callbacks)
- Design System: Tailwind colors (orange primary, green secondary, stone neutral), Nunito Sans font - Path: `product-plan/`
- Data Model Types: Path: `product-plan/data-model/types.ts`
- Foundation Instructions: Path: `product-plan/instructions/incremental/01-foundation.md`

**Notes from Existing Product Plan:**
- UI components (UserMenu, AppShell) are already designed and expect auth integration
- No separate auth screens exist in the provided components - need to be built
- All routes require authentication based on routing structure

### Follow-up Questions

**Follow-up 1:** What options should users choose from for cooking skill level?

**Answer:** Simple 3-level scale: Beginner, Intermediate, Advanced.

**Follow-up 2:** Which dietary restrictions should users be able to select? Should users be able to add custom dietary restrictions?

**Answer:** Predefined multi-select list only (no custom additions): Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Halal, Kosher, Low-Carb/Keto.

**Follow-up 3:** What should the onboarding tutorial cover? Should profile setup be part of onboarding or a separate settings screen?

**Answer:** Profile setup (cooking skill + dietary restrictions) should be PART of the onboarding flow, not a separate settings screen. Tutorial covers 3-4 screens explaining key features.

**Follow-up 4:** For account deletion, should there be a grace period with recovery window?

**Answer:** Immediate deletion with confirmation dialog (no recovery window).

## Visual Assets

### Files Provided:
No visual assets provided.

### Design Context Available:
- Design system tokens exist in product-plan for consistent styling
- Shell/UserMenu components show expected authenticated state
- PNG mockups exist for other app sections (not auth-specific)

## Requirements Summary

### Functional Requirements

**Authentication Methods:**
- Email/Password authentication
- Apple Sign-In (required for iOS App Store)
- Google Sign-In

**User Profile Data (stored in Convex, synced from Clerk):**
- `name` (from Clerk)
- `email` (from Clerk)
- `avatarUrl` (from Clerk, optional)
- `cookingSkillLevel`: "beginner" | "intermediate" | "advanced"
- `dietaryRestrictions`: string[] (multi-select from predefined list)

**Dietary Restriction Options:**
- Vegetarian
- Vegan
- Gluten-Free
- Dairy-Free
- Nut-Free
- Halal
- Kosher
- Low-Carb/Keto

**Authentication Flow:**
1. Splash screen (app launch)
2. Sign-in / Sign-up screens (with Email, Apple, Google options)
3. For NEW users only: Onboarding flow
   - 3-4 feature introduction screens (recipe saving, cookbook organization, meal planning, shopping lists)
   - Profile setup screen (cooking skill level + dietary restrictions selection)
4. Navigate to main app (Recipe List)

**Session Management:**
- Persistent sessions using Clerk defaults
- Automatic token refresh
- Users remain signed in until explicit logout

**Account Management:**
- Password reset flow (via Clerk built-in)
- Account deletion with confirmation dialog
- Immediate deletion upon confirmation (no recovery window)

**Protected Routes:**
- All app screens require authentication
- No guest mode or public browsing
- Unauthenticated users redirected to sign-in

### Reusability Opportunities

- UserMenu component: Already designed, expects user object and callbacks
- AppShell component: Already designed, wraps authenticated app content
- Design system: Tailwind colors and typography already defined
- Data model patterns: TypeScript types structure exists in product-plan

### Scope Boundaries

**In Scope:**
- Sign-in screen with Email, Apple, Google options
- Sign-up screen with Email, Apple, Google options
- Onboarding tutorial flow (3-4 feature screens)
- Profile setup during onboarding (cooking skill, dietary restrictions)
- Protected route wrapper/guard
- Clerk-Convex user sync via webhook
- Password reset flow
- Account deletion with confirmation
- Integration with existing UserMenu and AppShell components
- Convex users table with custom profile fields

**Out of Scope:**
- Multi-device session management UI
- Profile editing screen (profile set during onboarding only for MVP)
- Custom dietary restriction input
- Social features (following other users, sharing profiles)
- Two-factor authentication

### Technical Considerations

**Integration Points:**
- Clerk SDK (`@clerk/clerk-expo`) for authentication UI and logic
- Convex webhook for user sync (Clerk to Convex)
- Convex users table for storing custom profile fields
- Existing UserMenu component callbacks: `onLogout`, `onSettings`
- Existing AppShell component: requires user object prop

**Technology Stack:**
- React Native + Expo (SDK 52+)
- Clerk for authentication (`@clerk/clerk-expo`)
- Convex for backend/database
- expo-router for navigation

**Environment Variables Required:**
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- Clerk webhook secret (stored in Convex environment)

**Clerk Configuration Required:**
- Enable Email/Password authentication
- Enable Apple Sign-In
- Enable Google Sign-In
- Configure webhook to Convex endpoint

**Data Schema (Convex users table):**
```typescript
{
  clerkId: string,           // Clerk user ID (indexed)
  email: string,
  name: string,
  avatarUrl?: string,
  cookingSkillLevel: "beginner" | "intermediate" | "advanced",
  dietaryRestrictions: string[],
  createdAt: number,
  updatedAt: number,
}
```

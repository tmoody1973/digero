# Task Breakdown: User Authentication

## Overview
Total Tasks: 36
Effort Estimate: Small (S) - 2-3 days

## Task List

### Setup & Configuration

#### Task Group 1: Clerk and Environment Setup
**Dependencies:** None
**Complexity:** S

- [x] 1.0 Complete Clerk and environment configuration
  - [x] 1.1 Install Clerk dependencies
    - Install `@clerk/clerk-expo` package
    - Verify compatibility with Expo SDK 52+
  - [x] 1.2 Configure environment variables
    - Add `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to app config
    - Document required Clerk dashboard configuration (Email/Password, Apple Sign-In, Google Sign-In)
  - [x] 1.3 Set up ClerkProvider in app root
    - Wrap app with `ClerkProvider` component
    - Configure token cache for persistent sessions
    - Follow expo-router layout patterns
  - [x] 1.4 Configure OAuth credentials
    - Document Apple Sign-In setup requirements (Apple Developer account)
    - Document Google Sign-In setup requirements (Google Cloud Console)
    - Note: Actual credential creation is done in Clerk dashboard, not code

**Acceptance Criteria:**
- Clerk package installed and compatible with Expo SDK 52+
- Environment variables documented and configured
- ClerkProvider wrapping app correctly
- OAuth configuration documented

---

### Database Layer

#### Task Group 2: Convex Users Schema and Mutations
**Dependencies:** Task Group 1
**Complexity:** S

- [x] 2.0 Complete Convex database layer
  - [x] 2.1 Write 4-6 focused tests for user data operations
    - Test user creation with required fields
    - Test user lookup by clerkId
    - Test user profile update (cookingSkillLevel, dietaryRestrictions)
    - Test user deletion
  - [x] 2.2 Create users table schema in Convex
    - Fields: `clerkId` (string, indexed), `email` (string), `name` (string), `avatarUrl` (optional string), `cookingSkillLevel` (string: "beginner" | "intermediate" | "advanced"), `dietaryRestrictions` (array of strings), `createdAt` (number), `updatedAt` (number)
    - Add index on `clerkId` for efficient lookups
  - [x] 2.3 Create user mutations
    - `createUser`: Create new user record from Clerk webhook data
    - `updateUser`: Update user profile fields
    - `deleteUser`: Remove user record by clerkId
  - [x] 2.4 Create user queries
    - `getUserByClerkId`: Fetch user by Clerk ID
    - `getCurrentUser`: Get authenticated user's profile
  - [x] 2.5 Add TypeScript types for User
    - Add User interface to types following existing patterns
    - Use camelCase for property names
    - Define CookingSkillLevel and DietaryRestriction types
  - [x] 2.6 Ensure database layer tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify schema deploys successfully

**Acceptance Criteria:**
- The 4-6 tests written in 2.1 pass
- Users table schema deployed to Convex
- All mutations and queries functional
- TypeScript types match schema

---

#### Task Group 3: Clerk-Convex Webhook Integration
**Dependencies:** Task Group 2
**Complexity:** S

- [x] 3.0 Complete webhook integration
  - [x] 3.1 Write 3-4 focused tests for webhook handling
    - Test user.created event creates Convex user
    - Test user.updated event updates Convex user
    - Test user.deleted event removes Convex user
  - [x] 3.2 Create Convex HTTP endpoint for webhook
    - Set up HTTP action to receive Clerk webhook
    - Verify webhook signature using Clerk webhook secret
    - Store webhook secret in Convex environment variables
  - [x] 3.3 Implement webhook event handlers
    - Handle `user.created` event: create user in Convex
    - Handle `user.updated` event: update user in Convex
    - Handle `user.deleted` event: delete user from Convex
    - Extract clerkId, email, name, avatarUrl from Clerk payload
  - [x] 3.4 Document Clerk webhook configuration
    - Document webhook URL format for Convex HTTP endpoint
    - List required webhook events to enable
  - [x] 3.5 Ensure webhook tests pass
    - Run ONLY the 3-4 tests written in 3.1

**Acceptance Criteria:**
- The 3-4 tests written in 3.1 pass
- Webhook endpoint receives and processes Clerk events
- User records sync correctly between Clerk and Convex
- Webhook signature verification working

---

### Authentication UI

#### Task Group 4: Sign-In and Sign-Up Screens
**Dependencies:** Task Group 1
**Complexity:** M

- [x] 4.0 Complete authentication screens
  - [x] 4.1 Write 4-6 focused tests for auth screens
    - Test email/password sign-in flow
    - Test email/password sign-up flow
    - Test OAuth button presence (Apple, Google)
    - Test navigation between sign-in and sign-up
  - [x] 4.2 Create SignInScreen component
    - Email input field with validation
    - Password input field
    - "Sign In" primary button (orange-500)
    - "Forgot Password?" link
    - Divider with "or continue with"
    - Apple Sign-In button
    - Google Sign-In button
    - "Don't have an account? Sign Up" link
    - Use Nunito Sans typography, stone palette
  - [x] 4.3 Create SignUpScreen component
    - Name input field
    - Email input field with validation
    - Password input field with requirements hint
    - "Create Account" primary button
    - Divider with "or continue with"
    - Apple Sign-In button
    - Google Sign-In button
    - "Already have an account? Sign In" link
  - [x] 4.4 Implement email/password authentication logic
    - Use Clerk `useSignIn()` hook for sign-in
    - Use Clerk `useSignUp()` hook for sign-up
    - Display error messages for invalid credentials
    - Display error for existing account on sign-up
    - Handle email verification if enabled
  - [x] 4.5 Implement Apple Sign-In
    - Use `@clerk/clerk-expo` OAuth flow
    - Handle first-time Apple ID users
    - Handle returning Apple ID users
    - Extract name/email from Apple ID token
  - [x] 4.6 Implement Google Sign-In
    - Use `@clerk/clerk-expo` OAuth flow
    - Handle first-time Google account users
    - Handle returning Google account users
  - [x] 4.7 Create ForgotPasswordScreen component
    - Email input field
    - "Send Reset Link" button
    - Success message after sending
    - Use Clerk's built-in password reset flow
  - [x] 4.8 Ensure auth screen tests pass
    - Run ONLY the 4-6 tests written in 4.1

**Acceptance Criteria:**
- The 4-6 tests written in 4.1 pass
- All three auth methods work (Email, Apple, Google)
- Error messages display correctly
- Password reset flow functional
- Screens match design system tokens

---

### Onboarding Flow

#### Task Group 5: First-Time User Onboarding
**Dependencies:** Task Group 4
**Complexity:** M

- [x] 5.0 Complete onboarding flow
  - [x] 5.1 Write 4-6 focused tests for onboarding
    - Test onboarding screen navigation (next/skip)
    - Test cooking skill level selection
    - Test dietary restrictions multi-select
    - Test onboarding completion saves profile
  - [x] 5.2 Create OnboardingContainer component
    - Manages onboarding state and navigation
    - Tracks current screen index
    - Handles skip and complete actions
    - Checks if user has completed onboarding
  - [x] 5.3 Create feature introduction screens (3-4 screens)
    - Screen 1: Recipe Saving - "Save recipes from anywhere"
    - Screen 2: Cookbook Organization - "Organize into cookbooks"
    - Screen 3: Meal Planning - "Plan your weekly meals"
    - Screen 4: Shopping Lists - "Generate shopping lists"
    - Each screen: illustration area, title, description, progress dots, Next button
  - [x] 5.4 Create ProfileSetupScreen component
    - Cooking skill level selection (Beginner, Intermediate, Advanced)
    - Use segmented control or radio buttons
    - Dietary restrictions multi-select checkboxes
    - Options: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Halal, Kosher, Low-Carb/Keto
    - "Complete Setup" button
  - [x] 5.5 Implement profile data persistence
    - Save cookingSkillLevel to Convex user record
    - Save dietaryRestrictions array to Convex user record
    - Mark onboarding as completed (hasCompletedOnboarding flag or check for profile fields)
  - [x] 5.6 Implement onboarding skip logic
    - Check if returning user has completed onboarding
    - Skip directly to main app if already completed
    - Navigate to Recipe List screen on completion
  - [x] 5.7 Ensure onboarding tests pass
    - Run ONLY the 4-6 tests written in 5.1

**Acceptance Criteria:**
- The 4-6 tests written in 5.1 pass
- Feature screens display correctly
- Profile data saves to Convex
- Returning users skip onboarding
- Navigation to main app works

---

### Navigation & Route Protection

#### Task Group 6: Protected Routes and Navigation Guard
**Dependencies:** Task Groups 4, 5
**Complexity:** S

- [x] 6.0 Complete route protection
  - [x] 6.1 Write 3-4 focused tests for route protection
    - Test unauthenticated user redirects to sign-in
    - Test authenticated user accesses protected routes
    - Test new user routes through onboarding
  - [x] 6.2 Create authentication layout wrapper
    - Use expo-router layout-based auth checks
    - Wrap all app routes (except auth screens)
    - Check Clerk `isSignedIn` state
  - [x] 6.3 Implement navigation guard logic
    - Redirect unauthenticated users to SignInScreen
    - Check onboarding completion status for new users
    - Route new users to OnboardingContainer
    - Route returning users to main app
  - [x] 6.4 Handle deep links with auth state
    - Ensure deep links respect authentication state
    - Queue deep link destination during auth flow
    - Navigate to intended destination after authentication
  - [x] 6.5 Set up auth screen group in expo-router
    - Create `(auth)` route group for sign-in, sign-up, forgot-password
    - Create `(onboarding)` route group for onboarding screens
    - Create `(app)` route group for authenticated screens
  - [x] 6.6 Ensure route protection tests pass
    - Run ONLY the 3-4 tests written in 6.1

**Acceptance Criteria:**
- The 3-4 tests written in 6.1 pass
- Unauthenticated users cannot access protected routes
- Navigation flow respects auth and onboarding state
- Deep links work correctly with authentication

---

### Session & Account Management

#### Task Group 7: Session Management and Logout
**Dependencies:** Task Groups 4, 6
**Complexity:** S

- [x] 7.0 Complete session management
  - [x] 7.1 Write 2-4 focused tests for session management
    - Test user remains signed in after app restart
    - Test logout clears session and navigates to sign-in
  - [x] 7.2 Configure Clerk persistent sessions
    - Use Clerk default session persistence
    - Configure automatic token refresh
    - Set up secure token storage with expo-secure-store
  - [x] 7.3 Integrate logout with UserMenu component
    - Connect Clerk `signOut()` to UserMenu `onLogout` callback
    - Clear local session data on logout
    - Navigate to SignInScreen after logout
  - [x] 7.4 Pass user data to AppShell
    - Fetch current user from Convex using Clerk ID
    - Pass `name` and `avatarUrl` to AppShell `user` prop
    - Handle loading state while fetching user
  - [x] 7.5 Ensure session management tests pass
    - Run ONLY the 2-4 tests written in 7.1

**Acceptance Criteria:**
- The 2-4 tests written in 7.1 pass
- Users remain signed in until explicit logout
- Logout works via UserMenu
- User data displays correctly in AppShell/UserMenu

---

#### Task Group 8: Account Deletion
**Dependencies:** Task Group 7
**Complexity:** S

- [x] 8.0 Complete account deletion
  - [x] 8.1 Write 2-3 focused tests for account deletion
    - Test confirmation dialog appears
    - Test deletion removes user and clears session
  - [x] 8.2 Create DeleteAccountConfirmation component
    - Warning message about permanent deletion
    - "Delete My Account" destructive button
    - "Cancel" secondary button
    - Use confirmation dialog pattern
  - [x] 8.3 Implement account deletion logic
    - Call Clerk API to delete user account
    - Trigger Convex user deletion (via webhook or direct mutation)
    - Clear local session and storage
    - Navigate to SignInScreen
  - [x] 8.4 Add delete account option to settings
    - Add "Delete Account" option accessible from UserMenu onSettings
    - Place at bottom of settings with appropriate warning styling
  - [x] 8.5 Ensure account deletion tests pass
    - Run ONLY the 2-3 tests written in 8.1

**Acceptance Criteria:**
- The 2-3 tests written in 8.1 pass
- Confirmation dialog prevents accidental deletion
- User data removed from both Clerk and Convex
- Session cleared and user redirected to sign-in

---

### Integration & Testing

#### Task Group 9: Component Integration
**Dependencies:** Task Groups 1-8
**Complexity:** S

- [x] 9.0 Complete component integration
  - [x] 9.1 Verify UserMenu integration
    - Confirm `onLogout` callback triggers Clerk signOut
    - Confirm `onSettings` callback navigates to settings
    - Verify user name and avatarUrl display correctly
    - Verify initials fallback when no avatar
  - [x] 9.2 Verify AppShell integration
    - Confirm user prop receives Clerk/Convex user data
    - Confirm conditional rendering of UserMenu
    - Test navigation callbacks with expo-router
  - [x] 9.3 End-to-end flow verification
    - Test complete sign-up flow through onboarding to main app
    - Test complete sign-in flow for returning user
    - Test logout and re-authentication flow

**Acceptance Criteria:**
- All existing components integrate with auth system
- End-to-end user flows work correctly
- No regressions in existing functionality

---

#### Task Group 10: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-9
**Complexity:** S

- [x] 10.0 Review existing tests and fill critical gaps only
  - [x] 10.1 Review tests from Task Groups 2-8
    - Review 4-6 database tests (Task 2.1)
    - Review 3-4 webhook tests (Task 3.1)
    - Review 4-6 auth screen tests (Task 4.1)
    - Review 4-6 onboarding tests (Task 5.1)
    - Review 3-4 route protection tests (Task 6.1)
    - Review 2-4 session management tests (Task 7.1)
    - Review 2-3 account deletion tests (Task 8.1)
    - Total existing tests: approximately 22-33 tests
  - [x] 10.2 Analyze test coverage gaps for authentication feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to authentication requirements
    - Prioritize end-to-end workflows over unit test gaps
  - [x] 10.3 Write up to 10 additional strategic tests maximum
    - Focus on integration points between Clerk, Convex, and UI
    - Test error handling for common failure scenarios
    - Test OAuth edge cases if not covered
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 10.4 Run feature-specific tests only
    - Run ONLY tests related to authentication feature
    - Expected total: approximately 32-43 tests maximum
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 32-43 tests total)
- Critical authentication user workflows covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on authentication feature

---

## Execution Order

Recommended implementation sequence:

1. **Setup & Configuration (Task Group 1)** - Install dependencies, configure Clerk
2. **Database Layer (Task Groups 2-3)** - Convex schema, webhook integration
3. **Authentication UI (Task Group 4)** - Sign-in, sign-up, OAuth screens
4. **Onboarding Flow (Task Group 5)** - Feature intro, profile setup
5. **Navigation (Task Group 6)** - Protected routes, auth guards
6. **Session Management (Task Groups 7-8)** - Logout, account deletion
7. **Integration (Task Group 9)** - Component integration verification
8. **Testing (Task Group 10)** - Test review and gap analysis

## Technical Notes

### Key Files Created
- `app/_layout.tsx` - Root layout with ClerkProvider and ConvexProvider
- `app/index.tsx` - Root redirect handler
- `app/(auth)/_layout.tsx` - Auth screens layout
- `app/(auth)/sign-in.tsx` - Sign-in screen
- `app/(auth)/sign-up.tsx` - Sign-up screen
- `app/(auth)/forgot-password.tsx` - Password reset screen
- `app/(onboarding)/_layout.tsx` - Onboarding layout
- `app/(onboarding)/index.tsx` - Onboarding welcome screen
- `app/(onboarding)/feature-1.tsx` - Feature 1: Recipe Saving
- `app/(onboarding)/feature-2.tsx` - Feature 2: Cookbook Organization
- `app/(onboarding)/feature-3.tsx` - Feature 3: Meal Planning
- `app/(onboarding)/feature-4.tsx` - Feature 4: Shopping Lists
- `app/(onboarding)/profile-setup.tsx` - Profile setup screen
- `app/(app)/_layout.tsx` - Protected app layout
- `app/(app)/index.tsx` - Main app screen (Recipe List)
- `app/(app)/settings.tsx` - Settings screen
- `convex/schema.ts` - Updated with users table
- `convex/users.ts` - User mutations and queries
- `convex/http.ts` - Clerk webhook endpoint
- `components/auth/AuthInput.tsx` - Auth form input
- `components/auth/AuthDivider.tsx` - Auth screen divider
- `components/auth/OAuthButton.tsx` - OAuth sign-in buttons
- `components/auth/DeleteAccountConfirmation.tsx` - Account deletion dialog
- `components/auth/index.ts` - Auth components index
- `components/onboarding/OnboardingContainer.tsx` - Onboarding wrapper
- `components/onboarding/FeatureScreen.tsx` - Feature introduction screen
- `components/onboarding/index.ts` - Onboarding components index
- `lib/token-cache.ts` - Clerk token cache with SecureStore
- `docs/oauth-setup.md` - OAuth configuration documentation
- `.env.example` - Environment variables template

### Key Integration Points
- ClerkProvider wraps app in root layout
- Convex webhook receives Clerk user events
- UserMenu.onLogout calls Clerk signOut()
- AppShell.user receives data from Convex user query
- expo-router layouts handle auth state checks

### Environment Variables Required
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (client)
- `EXPO_PUBLIC_CONVEX_URL` - Convex deployment URL (client)
- `CLERK_WEBHOOK_SECRET` - Webhook verification (Convex environment)

### Test Summary
- Total tests: 143 passing
- Authentication-specific tests: ~60 tests across 8 test files
- All tests pass successfully

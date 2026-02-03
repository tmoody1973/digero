# Specification: RevenueCat Subscription Integration

## Goal

Implement a freemium subscription model using RevenueCat SDK with three premium tiers (Monthly, Annual, Lifetime), enforcing free tier limits (10 recipes, 3 scans per rolling 30-day window), and syncing entitlement status to Convex via webhooks.

## User Stories

- As a free user, I want to clearly see my remaining usage limits so that I understand when I need to upgrade
- As a user hitting a limit, I want a clear upgrade path with pricing options so that I can unlock unlimited access

## Specific Requirements

**Subscription Products Configuration**
- Configure three products in RevenueCat dashboard: `digero_premium_monthly` ($4.99/month), `digero_premium_annual` ($39.99/year, 7-day trial), `digero_premium_lifetime` (price TBD)
- Create single "premium" entitlement granting access to all premium features
- Create "default" offering containing all three products for paywall display
- Configure 7-day free trial for annual product in App Store Connect (trial only on annual)

**Free Tier Limit Enforcement**
- Recipe limit: Maximum 10 saved recipes for free users
- Scan limit: Maximum 3 cookbook scans per rolling 30-day window (not calendar month)
- Check limits server-side in Convex mutations before creating recipes or processing scans
- Return structured error response with limit details when exceeded

**Rolling 30-Day Scan Tracking**
- Create `scanHistory` table in Convex with userId and scannedAt (timestamp) fields
- Query count of scans where scannedAt is within last 30 days
- Calculate "resets in X days" based on oldest scan in the 30-day window
- Display remaining scans to free users: "X scans remaining (resets in Y days)"

**RevenueCat SDK Initialization**
- Initialize RevenueCat SDK on app launch using Clerk user ID as app_user_id
- Use `@revenuecat/purchases-expo` package for Expo compatibility
- Store RevenueCat public API key in environment variable (not hardcoded)
- Configure SDK in app entry point before rendering main app tree

**Purchase Flow Implementation**
- Display paywall modal as hard block when user hits free tier limit
- Show all three product options with pricing and savings callout ("Save 33%")
- Highlight annual plan with "7-day free trial" badge
- Call `purchasePackage()` for selected product
- Optimistic UI update on purchase success (don't wait for webhook)
- Handle purchase errors with user-friendly messages and retry option

**Restore Purchases Flow**
- "Restore Purchases" button always visible in Settings screen
- Automatic restore attempt on app launch for users with free status in Convex
- Call `restorePurchases()` and sync resulting CustomerInfo
- Display loading state during restore process
- Show success toast on successful restore, error message on failure

**Webhook Endpoint for Convex Sync**
- Create Convex HTTP action at `/webhooks/revenuecat`
- Verify webhook signature using RevenueCat shared secret from environment
- Handle events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE, PRODUCT_CHANGE
- Update user record fields: subscriptionStatus, subscriptionType, subscriptionExpiresAt, hasBillingIssue

**User Subscription Fields in Convex**
- Add to users table: subscriptionStatus ("free" | "premium" | "trial"), subscriptionType ("monthly" | "annual" | "lifetime" | null)
- Add subscriptionExpiresAt (timestamp | null), subscriptionCanceledAt (timestamp | null), hasBillingIssue (boolean)
- Store revenuecatUserId for cross-reference with RevenueCat dashboard
- Default new users to subscriptionStatus: "free"

**Client-Side Entitlement Checks**
- Check CustomerInfo.entitlements.active["premium"] before gated actions
- Cache entitlement status in React context for instant UI access
- Listen for CustomerInfo updates to sync changes from other devices
- Use server-side check as source of truth for security-sensitive operations (scan processing)

**Settings Screen Subscription Section**
- Display current plan: Free, Premium Monthly, Premium Annual, or Premium Lifetime
- For subscribers: Show renewal date or "Lifetime access", "Manage Subscription" link to App Store
- For free users: Show "Upgrade to Premium" button and usage stats (X/10 recipes, X/3 scans)
- "Restore Purchases" button visible for all users

## Existing Code to Leverage

**User Authentication Spec (`/Users/tarikmoody/Documents/Projects/digero/agent-os/specs/2026-02-02-user-authentication/spec.md`)**
- Clerk user ID used as RevenueCat app_user_id for cross-platform identity
- Users table in Convex already defined with clerkId - extend with subscription fields
- Webhook pattern for Clerk can inform RevenueCat webhook structure
- Protected routes pattern can be extended with entitlement checks

**Recipe Data Model Spec (`/Users/tarikmoody/Documents/Projects/digero/agent-os/specs/2026-02-02-recipe-data-model/spec.md`)**
- Recipes table has userId field for counting user's saved recipes
- Query pattern getRecipes with userId filter can be adapted for count query
- Mutation pattern with user ownership validation applies to subscription checks

**UserMenu Component (`/Users/tarikmoody/Documents/Projects/digero/product-plan/shell/components/UserMenu.tsx`)**
- onSettings callback already connected to UserMenu dropdown
- Pattern for dropdown menu items can extend to subscription status display
- Existing Tailwind styles with stone palette and orange accents

**ScanSession Component (`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/recipe-library/components/ScanSession.tsx`)**
- Entry point where scan limit check must occur before starting session
- Processing state UI can be adapted for subscription loading states
- Full-screen modal pattern suitable for paywall modal

**Data Model Types (`/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`)**
- TypeScript interface patterns for defining SubscriptionStatus type
- Follow existing naming conventions (camelCase properties)
- Use as reference for new subscription-related type definitions

## Out of Scope

- Android implementation (iOS-only for hackathon)
- Family sharing support
- Subscription gifting functionality
- Custom paywall A/B testing
- Subscription analytics dashboard (use RevenueCat dashboard)
- Refund processing (handled by App Store)
- Introductory offer pricing beyond standard trial
- Promotional offer deep links
- Referral discount code system (RevenueCat promo codes supported, custom referral system is not)
- Subscription downgrade handling (only upgrade paths)

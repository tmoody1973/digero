# Task Breakdown: RevenueCat Subscription Integration

## Overview
Total Tasks: 6 Task Groups (approximately 35 sub-tasks)

**Critical Note:** This implementation is REQUIRED for RevenueCat Shipyard 2026 hackathon eligibility.

## Task List

### Database & Backend Layer

#### Task Group 1: Convex Schema Extensions
**Dependencies:** None (requires existing users table from User Authentication spec)

- [x] 1.0 Complete Convex schema extensions for subscription management
  - [x] 1.1 Write 2-4 focused tests for subscription data models
    - Test user subscription field defaults (new user gets `subscriptionStatus: "free"`)
    - Test subscription status transitions (free -> premium -> expired)
    - Test scanHistory record creation with timestamp
    - Test rolling 30-day scan count query
  - [x] 1.2 Extend users table schema with subscription fields
    - Add `subscriptionStatus`: `"free" | "premium" | "trial"` (default: `"free"`)
    - Add `subscriptionType`: `"monthly" | "annual" | "lifetime" | null` (default: `null`)
    - Add `subscriptionExpiresAt`: `number | null` (timestamp, default: `null`)
    - Add `subscriptionCanceledAt`: `number | null` (timestamp, default: `null`)
    - Add `hasBillingIssue`: `boolean` (default: `false`)
    - Add `revenuecatUserId`: `string | null` (default: `null`)
  - [x] 1.3 Create `scanHistory` table schema
    - Fields: `userId` (Id<"users">), `scannedAt` (number timestamp)
    - Add index on `userId` for efficient queries
    - Add index on `scannedAt` for time-based queries
  - [x] 1.4 Create query for rolling 30-day scan count
    - Query `scanHistory` where `scannedAt > Date.now() - 30 days`
    - Filter by `userId`
    - Return count and oldest scan timestamp for "resets in X days" calculation
  - [x] 1.5 Create query for user recipe count
    - Query `recipes` table filtered by `userId`
    - Return count for limit enforcement
  - [x] 1.6 Ensure schema tests pass
    - Run ONLY the 2-4 tests written in 1.1
    - Verify schema compiles without errors

**Acceptance Criteria:**
- Users table extended with all subscription fields
- scanHistory table created with proper indexes
- Rolling 30-day scan count query returns accurate counts
- Recipe count query works correctly
- Schema tests pass

---

#### Task Group 2: Convex Mutations & Limit Enforcement
**Dependencies:** Task Group 1

- [x] 2.0 Complete server-side limit enforcement mutations
  - [x] 2.1 Write 2-4 focused tests for limit enforcement
    - Test recipe creation blocked at 10 recipes for free user
    - Test recipe creation allowed for premium user
    - Test scan blocked at 3 scans in 30-day window for free user
    - Test scan allowed for premium user
  - [x] 2.2 Create `checkRecipeLimit` mutation helper
    - Query user's subscription status
    - Query user's recipe count
    - Return `{ allowed: boolean, currentCount: number, limit: number }` for free users
    - Always return `{ allowed: true }` for premium users
  - [x] 2.3 Create `checkScanLimit` mutation helper
    - Query user's subscription status
    - Query rolling 30-day scan count
    - Calculate "resets in X days" from oldest scan
    - Return `{ allowed: boolean, currentCount: number, limit: number, resetsInDays: number | null }`
    - Always return `{ allowed: true }` for premium users
  - [x] 2.4 Integrate limit check into recipe creation mutation
    - Call `checkRecipeLimit` before creating recipe
    - Return structured error with limit details if exceeded
    - Error format: `{ code: "RECIPE_LIMIT_EXCEEDED", currentCount, limit }`
  - [x] 2.5 Create `recordScan` mutation for scan tracking
    - Insert record into `scanHistory` with current timestamp
    - Called after successful scan processing
  - [x] 2.6 Integrate limit check into scan processing mutation
    - Call `checkScanLimit` before processing scan
    - Return structured error with limit details if exceeded
    - Error format: `{ code: "SCAN_LIMIT_EXCEEDED", currentCount, limit, resetsInDays }`
  - [x] 2.7 Ensure limit enforcement tests pass
    - Run ONLY the 2-4 tests written in 2.1
    - Verify limit checks work correctly

**Acceptance Criteria:**
- Recipe limit enforced at 10 for free users
- Scan limit enforced at 3 per rolling 30-day window for free users
- Premium users bypass all limits
- Structured error responses include limit details
- Limit enforcement tests pass

---

#### Task Group 3: RevenueCat Webhook Handler
**Dependencies:** Task Group 1

- [x] 3.0 Complete RevenueCat webhook integration
  - [x] 3.1 Write 2-4 focused tests for webhook handler
    - Test INITIAL_PURCHASE event updates user to premium
    - Test EXPIRATION event updates user to free
    - Test webhook signature verification rejects invalid signatures
    - Test BILLING_ISSUE event sets `hasBillingIssue: true`
  - [x] 3.2 Create Convex HTTP action at `/webhooks/revenuecat`
    - Accept POST requests with JSON body
    - Parse RevenueCat webhook event payload
    - Return appropriate HTTP status codes
  - [x] 3.3 Implement webhook signature verification
    - Read `REVENUECAT_WEBHOOK_SECRET` from environment
    - Verify HMAC signature from request headers
    - Return 401 Unauthorized if signature invalid
  - [x] 3.4 Handle INITIAL_PURCHASE event
    - Extract `app_user_id` (Clerk user ID) from payload
    - Set `subscriptionStatus: "premium"` or `"trial"` based on trial status
    - Set `subscriptionType` based on product ID (`monthly`, `annual`, `lifetime`)
    - Set `subscriptionExpiresAt` from payload (null for lifetime)
    - Store `revenuecatUserId` for cross-reference
  - [x] 3.5 Handle RENEWAL event
    - Update `subscriptionExpiresAt` with new expiration
    - Clear `hasBillingIssue` if previously set
    - Maintain `subscriptionStatus: "premium"`
  - [x] 3.6 Handle CANCELLATION event
    - Set `subscriptionCanceledAt` to cancellation timestamp
    - Keep `subscriptionStatus: "premium"` until expiration
    - User retains access until `subscriptionExpiresAt`
  - [x] 3.7 Handle EXPIRATION event
    - Set `subscriptionStatus: "free"`
    - Set `subscriptionType: null`
    - Clear billing issue flag
  - [x] 3.8 Handle BILLING_ISSUE event
    - Set `hasBillingIssue: true`
    - Keep subscription active (grace period)
  - [x] 3.9 Handle PRODUCT_CHANGE event
    - Update `subscriptionType` to new product type
    - Update `subscriptionExpiresAt` if changed
  - [x] 3.10 Ensure webhook tests pass
    - Run ONLY the 2-4 tests written in 3.1
    - Verify signature verification works
    - Verify event handling updates user correctly

**Acceptance Criteria:**
- Webhook endpoint accessible at `/webhooks/revenuecat`
- Signature verification blocks invalid requests
- All event types handled correctly
- User subscription fields updated appropriately
- Webhook tests pass

---

### SDK & Client Layer

#### Task Group 4: RevenueCat SDK Setup & Purchase Flow
**Dependencies:** Task Groups 1, 2 (can be done in parallel with Task Group 3)

- [x] 4.0 Complete RevenueCat SDK integration and purchase flow
  - [x] 4.1 Write 2-4 focused tests for SDK integration
    - Test SDK initialization with Clerk user ID
    - Test `purchasePackage` call with mock SDK
    - Test CustomerInfo entitlement check returns correct premium status
    - Test restore purchases updates local state
  - [x] 4.2 Install and configure RevenueCat SDK
    - Add `@revenuecat/purchases-expo` package
    - Add `REVENUECAT_PUBLIC_API_KEY` to environment variables
    - Configure in app entry point (before main app tree renders)
  - [x] 4.3 Initialize SDK with Clerk user ID
    - Wait for Clerk authentication to complete
    - Call `Purchases.configure()` with API key
    - Call `Purchases.logIn()` with Clerk user ID as app_user_id
    - Handle initialization errors gracefully
  - [x] 4.4 Create SubscriptionContext for React state management
    - Store `isPremium` boolean for quick UI checks
    - Store `subscriptionType` for plan display
    - Store `expiresAt` for renewal date display
    - Store `customerInfo` for detailed entitlement checks
    - Provide `refreshSubscription` method
  - [x] 4.5 Implement CustomerInfo listener for real-time updates
    - Subscribe to `Purchases.addCustomerInfoUpdateListener()`
    - Update SubscriptionContext when CustomerInfo changes
    - Handle subscription changes from other devices
  - [x] 4.6 Implement `getOfferings` utility
    - Fetch current offerings from RevenueCat
    - Extract products from "default" offering
    - Return formatted product data with pricing
  - [x] 4.7 Implement `purchasePackage` utility
    - Accept package/product identifier
    - Call RevenueCat `purchasePackage()`
    - Return purchase result or error
    - Handle user cancellation gracefully
  - [x] 4.8 Implement `restorePurchases` utility
    - Call RevenueCat `restorePurchases()`
    - Update SubscriptionContext with result
    - Return success/failure status
  - [x] 4.9 Implement automatic restore on app launch
    - Check if user's Convex status is "free"
    - Call `restorePurchases()` silently in background
    - Update local state if active entitlement found
    - Do not show UI for automatic restore
  - [x] 4.10 Ensure SDK tests pass
    - Run ONLY the 2-4 tests written in 4.1
    - Use mocked RevenueCat SDK for tests

**Acceptance Criteria:**
- SDK initializes successfully with Clerk user ID
- SubscriptionContext provides reactive subscription state
- CustomerInfo updates sync across devices
- Purchase flow completes successfully
- Restore purchases works for reinstalls
- SDK tests pass

---

### Frontend UI Layer

#### Task Group 5: Paywall Modal & Settings UI
**Dependencies:** Task Group 4

- [x] 5.0 Complete subscription UI components
  - [x] 5.1 Write 2-4 focused tests for UI components
    - Test PaywallModal renders with all three product options
    - Test PaywallModal calls purchasePackage on product selection
    - Test Settings subscription section shows correct plan status
    - Test "Restore Purchases" button triggers restore flow
  - [x] 5.2 Create PaywallModal component
    - Full-screen modal (hard block, cannot dismiss by tapping outside)
    - Header: "Upgrade to Premium"
    - Value proposition text: "Unlimited recipes and cookbook scans"
    - Close button returns to previous screen (action remains blocked)
    - Follow existing modal patterns from ScanSession component
  - [x] 5.3 Implement product selection cards in PaywallModal
    - Monthly option: "$4.99/month" - simple card
    - Annual option: "$39.99/year" with "Save 33%" badge and "7-day free trial" highlight
    - Lifetime option: "One-time purchase" (price from RevenueCat)
    - Visual highlight on annual plan (recommended)
    - Selected state styling
  - [x] 5.4 Implement purchase flow in PaywallModal
    - Loading state during purchase
    - Call `purchasePackage` for selected product
    - Optimistic UI update on success (don't wait for webhook)
    - Success confirmation animation/message
    - Dismiss modal and allow blocked action to proceed
  - [x] 5.5 Implement error handling in PaywallModal
    - User-friendly error messages for purchase failures
    - "Try Again" button for retry
    - Handle user cancellation (return to product selection)
    - Network error: "Unable to complete purchase. Please check your connection."
  - [x] 5.6 Add "Restore Purchases" link to PaywallModal
    - Secondary action below product cards
    - Loading state during restore
    - Success toast on successful restore
    - Error message if no purchases found
  - [x] 5.7 Implement limit trigger integration
    - Show PaywallModal when recipe creation returns RECIPE_LIMIT_EXCEEDED
    - Show PaywallModal when scan returns SCAN_LIMIT_EXCEEDED
    - Pass limit context to modal for personalized messaging
  - [x] 5.8 Create SubscriptionSection component for Settings screen
    - Display current plan: Free, Premium Monthly, Premium Annual, or Premium Lifetime
    - Use existing Settings screen styling patterns
  - [x] 5.9 Implement subscriber view in SubscriptionSection
    - Show renewal date: "Renews [date]" or "Lifetime access"
    - If canceled: "Access until [date]"
    - "Manage Subscription" button linking to App Store subscription management
    - Handle billing issue display: "Update payment method" warning
  - [x] 5.10 Implement free tier view in SubscriptionSection
    - Show usage stats: "X/10 recipes saved"
    - Show scan usage: "X/3 scans remaining (resets in Y days)"
    - "Upgrade to Premium" button (opens PaywallModal)
  - [x] 5.11 Add "Restore Purchases" button to SubscriptionSection
    - Always visible for all users
    - Loading state during restore
    - Success toast: "Purchases restored successfully"
    - Error toast: "No purchases found to restore"
  - [x] 5.12 Ensure UI component tests pass
    - Run ONLY the 2-4 tests written in 5.1
    - Verify component rendering and interactions

**Acceptance Criteria:**
- PaywallModal displays as hard block when limits exceeded
- All three product options visible with correct pricing
- Annual plan highlighted with trial badge
- Purchase flow completes with success feedback
- Settings screen shows accurate subscription status
- Free users see usage limits
- Subscribers see renewal info and manage link
- UI component tests pass

---

### Testing & Integration

#### Task Group 6: Test Review & Integration Testing
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps only
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review 2-4 schema/query tests from Task 1.1
    - Review 2-4 limit enforcement tests from Task 2.1
    - Review 2-4 webhook handler tests from Task 3.1
    - Review 2-4 SDK integration tests from Task 4.1
    - Review 2-4 UI component tests from Task 5.1
    - Total existing tests: approximately 10-20 tests
  - [x] 6.2 Analyze test coverage gaps for subscription feature only
    - Identify critical end-to-end workflows lacking coverage
    - Focus on user journeys: free user hits limit -> purchases -> gains access
    - Do NOT assess entire application test coverage
  - [x] 6.3 Write up to 10 additional strategic tests maximum
    - End-to-end: Free user saves 10th recipe, sees limit message
    - End-to-end: Free user hits scan limit, purchases annual, scan succeeds
    - Integration: Webhook updates Convex, client receives update via listener
    - Integration: Restore purchases syncs entitlements correctly
    - Edge case: Expired subscription user correctly downgraded to free
    - Edge case: Billing issue handling shows appropriate UI warning
  - [x] 6.4 Run feature-specific tests only
    - Run ONLY tests related to RevenueCat subscription feature
    - Expected total: approximately 20-30 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical subscription workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-30 tests total)
- Critical user journeys covered (purchase, restore, limit enforcement)
- No more than 10 additional tests added to fill gaps
- Testing focused exclusively on subscription feature requirements

---

## Execution Order

Recommended implementation sequence:

```
1. Task Group 1: Convex Schema Extensions (foundation)
       |
       v
   +---+---+
   |       |
   v       v
Task Group 2    Task Group 3
(Mutations)     (Webhook)
   |               |
   +-------+-------+
           |
           v
   Task Group 4: SDK Setup
           |
           v
   Task Group 5: UI Components
           |
           v
   Task Group 6: Test Review
```

**Parallel Work Opportunities:**
- Task Groups 2 and 3 can be developed in parallel after Group 1 completes
- Backend engineers can work on Groups 1-3 while mobile/frontend prepares for Groups 4-5

---

## RevenueCat Dashboard Configuration (Pre-Development)

Before starting implementation, ensure the following is configured in RevenueCat dashboard:

1. **Products Created:**
   - `digero_premium_monthly` - $4.99/month
   - `digero_premium_annual` - $39.99/year
   - `digero_premium_lifetime` - Price TBD

2. **Entitlement Created:**
   - `premium` - grants access to all premium features

3. **Offering Created:**
   - `default` - contains all three products

4. **App Store Connect:**
   - 7-day free trial configured for annual product

5. **Webhook Configured:**
   - URL pointing to Convex HTTP endpoint
   - Shared secret stored in Convex environment

---

## Environment Variables Required

```
# Client-side (Expo)
REVENUECAT_PUBLIC_API_KEY=<RevenueCat public iOS API key>

# Server-side (Convex)
REVENUECAT_WEBHOOK_SECRET=<RevenueCat webhook shared secret>
```

---

## Definition of Done

This feature is complete when:
- [x] Free users are limited to 10 recipes and 3 scans per 30-day window
- [x] Premium users have unlimited access to all features
- [x] PaywallModal appears as hard block when limits exceeded
- [x] All three subscription options purchasable through PaywallModal
- [x] Restore purchases works for reinstalls and device switches
- [x] Webhook syncs subscription status to Convex in real-time
- [x] Settings screen displays accurate subscription status and usage
- [x] All feature-specific tests pass
- [x] Ready for RevenueCat Shipyard 2026 hackathon submission

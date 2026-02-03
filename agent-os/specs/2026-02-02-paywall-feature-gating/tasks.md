# Task Breakdown: Paywall and Feature Gating

## Overview
Total Tasks: 7 Task Groups

This feature implements free tier limits (10 recipes, 3 scans per 30 days), paywall UI, usage tracking displays, nudge banners, premium badges, and graceful downgrade behavior. It integrates with RevenueCat subscription status from Convex.

## Task List

### Core UI Components

#### Task Group 1: Reusable Base Components
**Dependencies:** None

- [ ] 1.0 Complete reusable base components
  - [ ] 1.1 Write 2-8 focused tests for base components
    - Test ProgressBar renders correct fill percentage
    - Test ProgressBar applies warning color at threshold
    - Test Badge component renders with correct variant styles
    - Test CountdownTimer displays correct remaining time format
    - Test Banner component handles dismiss action
  - [ ] 1.2 Create ProgressBar component
    - Props: `value`, `max`, `variant` (default/warning/danger), `showLabel`
    - Fill colors: orange-500 default, red-500 for danger threshold
    - Animated fill transition on value change
    - Accessible: `role="progressbar"`, `aria-valuenow`, `aria-valuemax`
  - [ ] 1.3 Create Badge component
    - Props: `variant` (premium/achievement/count), `size` (sm/md), `icon`
    - Premium variant: amber-500/gold color, crown icon option
    - Achievement variant: for milestone badges
    - Count variant: small pill style for usage display (e.g., "8/10")
  - [ ] 1.4 Create CountdownTimer component
    - Props: `expiresAt` (timestamp), `format` (days/hours/full)
    - Display: "X days remaining" or "X hours remaining" based on proximity
    - Auto-update every minute (or every second in final hour)
    - Handle expired state gracefully
  - [ ] 1.5 Create Banner component (NudgeBanner)
    - Props: `message`, `variant` (info/warning/urgent), `onDismiss`, `onAction`, `actionLabel`
    - Dismissible with X button
    - Tap action opens paywall
    - Variants: gentle nudge (info), approaching limit (warning), final warning (urgent/red)
    - Position: sticky at top of screen
  - [ ] 1.6 Ensure base component tests pass
    - Run ONLY the tests written in 1.1
    - Verify all components render correctly

**Acceptance Criteria:**
- All base component tests pass
- ProgressBar shows correct fill percentage and color transitions
- Badge component supports premium, achievement, and count variants
- CountdownTimer auto-updates and handles expiration
- Banner component is dismissible and triggers action on tap

---

### Paywall UI

#### Task Group 2: Paywall Bottom Sheet
**Dependencies:** Task Group 1 (Badge, CountdownTimer components)

- [ ] 2.0 Complete paywall bottom sheet
  - [ ] 2.1 Write 2-8 focused tests for paywall bottom sheet
    - Test bottom sheet renders with product options
    - Test bottom sheet opens when triggered programmatically
    - Test dismiss action closes sheet and blocks original action
    - Test promo code field accepts input
    - Test restore purchases link is clickable
    - Test accessibility: focus trap and keyboard navigation
  - [ ] 2.2 Create PaywallBottomSheet component structure
    - Follow RecipePreviewModal pattern: `fixed inset-0`, backdrop blur, `rounded-t-3xl`
    - Animation: `animate-in slide-in-from-bottom-4`
    - Sticky header with close button
    - Scrollable content area
    - Sticky footer with action buttons
  - [ ] 2.3 Implement paywall header section
    - Value-focused headline: "Unlock Unlimited Recipes"
    - Subheadline with key benefits
    - Optional hero illustration or icon
  - [ ] 2.4 Build product options display
    - Monthly option: "$4.99/month" card
    - Annual option: "$39.99/year" with "Save 33%" and "7-day free trial" badge
    - Lifetime option: one-time purchase card
    - Selection state with visual indicator (border, checkmark)
    - Use CountdownTimer for trial badge during trial period
  - [ ] 2.5 Implement promo code section
    - Collapsible "Have a promo code?" link
    - Text input field with apply button
    - Success/error states for code validation
  - [ ] 2.6 Add footer with action buttons and links
    - Primary CTA: "Continue" or "Start Free Trial" (orange-500)
    - "Restore Purchases" text link
    - Legal links: Terms of Service, Privacy Policy
    - Links open in external browser
  - [ ] 2.7 Implement accessibility features
    - Focus trap when open (no focus escape to background)
    - Keyboard navigation between product options
    - Escape key to dismiss
    - Screen reader labels for all interactive elements
    - `aria-modal="true"`, `role="dialog"`
  - [ ] 2.8 Create usePaywall hook for triggering paywall
    - `showPaywall(trigger: 'recipe_limit' | 'scan_limit' | 'feature_gate')` function
    - Callback for purchase success/dismiss
    - Track trigger context for analytics
  - [ ] 2.9 Ensure paywall bottom sheet tests pass
    - Run ONLY the tests written in 2.1
    - Verify paywall opens, displays options, and closes correctly

**Acceptance Criteria:**
- Paywall slides up from bottom with smooth animation
- All three product options display correctly
- Promo code entry works
- Keyboard navigation and focus management work correctly
- Screen reader announces dialog and options appropriately

---

### Usage Tracking & Display

#### Task Group 3: Usage Tracking Display
**Dependencies:** Task Group 1 (ProgressBar, Badge components)

- [ ] 3.0 Complete usage tracking display
  - [ ] 3.1 Write 2-8 focused tests for usage tracking
    - Test Settings subscription section renders correct plan status
    - Test free user sees recipe/scan counts with progress bars
    - Test premium user sees "Unlimited" labels
    - Test recipe list header shows usage pill badge
    - Test usage indicator tap navigates to Settings
    - Test progress bar shows warning color at 80% threshold
  - [ ] 3.2 Create SubscriptionSection component for Settings
    - Display current plan: Free / Premium Monthly / Annual / Lifetime
    - Free users: recipe usage with ProgressBar ("X/10 recipes used")
    - Free users: scan usage with ProgressBar ("X/3 scans remaining")
    - Show "Resets in Y days" for scan limit
    - Premium users: "Unlimited recipes" and "Unlimited scans" labels
    - Tappable: opens paywall (free) or Manage Subscription (premium)
  - [ ] 3.3 Create UsageIndicator component for recipe list header
    - Small pill badge format: "8/10 recipes"
    - Style: subtle, non-intrusive, stone background
    - Warning state at 8+ recipes (orange border)
    - Danger state at 9-10 recipes (red text)
    - Tappable: navigates to Settings subscription section
  - [ ] 3.4 Implement premium user display variant
    - Recipe list: show small "Unlimited" badge or hide indicator entirely
    - Settings: show premium status with green checkmark
    - No usage limits displayed for premium users
  - [ ] 3.5 Create useUsageTracking hook
    - Query recipe count from Convex
    - Query rolling 30-day scan count from Convex
    - Calculate days until scan reset
    - Return: `{ recipeCount, recipeLimit, scanCount, scanLimit, daysUntilScanReset }`
  - [ ] 3.6 Integrate UsageIndicator into RecipeList header
    - Add to existing sticky header structure in RecipeList.tsx
    - Position near filter/view toggle area
    - Follow existing header styling: `bg-white/80 backdrop-blur-lg`
  - [ ] 3.7 Integrate SubscriptionSection into Settings screen
    - Add as dedicated section in Settings
    - Include navigation chevron indicator
  - [ ] 3.8 Ensure usage tracking tests pass
    - Run ONLY the tests written in 3.1
    - Verify usage displays correctly for free and premium users

**Acceptance Criteria:**
- Settings shows correct plan and usage for free/premium users
- Recipe list header shows usage pill for free users
- Premium users see appropriate "Unlimited" indicators
- Progress bars show correct fill and color thresholds
- Tapping indicators navigates appropriately

---

### Nudges & Banners

#### Task Group 4: Nudge Banners and Trial Notifications
**Dependencies:** Task Group 1 (Banner), Task Group 2 (usePaywall hook), Task Group 3 (useUsageTracking hook)

- [ ] 4.0 Complete nudge banners and trial notifications
  - [ ] 4.1 Write 2-8 focused tests for nudges and notifications
    - Test recipe nudge appears at 8/10 recipes
    - Test scan nudge appears at 2/3 scans
    - Test nudge escalates to urgent at 9/10 recipes
    - Test banner dismiss hides for session
    - Test banner tap opens paywall
    - Test trial expiration banner appears at 2 days remaining
  - [ ] 4.2 Implement recipe limit nudge banner
    - Trigger at 8/10 recipes (80% threshold)
    - Message: "2 recipes remaining - Upgrade for unlimited"
    - Style: info variant (dismissible)
    - Display on recipe list screen
  - [ ] 4.3 Implement scan limit nudge banner
    - Trigger at 2/3 scans (67% threshold)
    - Message: "1 scan remaining this month - Upgrade for unlimited"
    - Display on camera/scan screen
  - [ ] 4.4 Implement nudge escalation logic
    - 80% threshold: gentle nudge (info variant)
    - 90% threshold (9/10 recipes): urgent variant with stronger CTA
    - Final warning: bold text, red-500 accent
  - [ ] 4.5 Implement session-based dismiss logic
    - Track dismissed state per banner type in session storage
    - Re-show if user adds another recipe after dismissing
    - Reset on new session
  - [ ] 4.6 Create TrialExpirationBanner component
    - Trigger at 2 days and 1 day before trial ends
    - Message: "Your free trial ends in X days. Subscribe now to keep unlimited access."
    - Show countdown timer in final 24 hours: "Trial ends in X hours"
    - Show once per day during notification window
  - [ ] 4.7 Create useNudgeManager hook
    - Determine which nudges to show based on usage and subscription state
    - Track dismiss state per session
    - Compute trial days remaining
    - Return: `{ activeNudges, dismissNudge, shouldShowTrialBanner }`
  - [ ] 4.8 Integrate nudge banners into relevant screens
    - Recipe list: recipe limit nudge
    - Camera screen: scan limit nudge
    - App-wide: trial expiration banner
  - [ ] 4.9 Ensure nudge and notification tests pass
    - Run ONLY the tests written in 4.1
    - Verify nudges appear at correct thresholds

**Acceptance Criteria:**
- Recipe nudge appears at 8/10, escalates at 9/10
- Scan nudge appears at 2/3 scans
- Banners are dismissible and respect session state
- Trial expiration banner shows at 2 days and 1 day remaining
- All banner taps open paywall

---

### Premium Badge

#### Task Group 5: Premium Badge Implementation
**Dependencies:** Task Group 1 (Badge component)

- [ ] 5.0 Complete premium badge implementation
  - [ ] 5.1 Write 2-8 focused tests for premium badge
    - Test PremiumBadge renders crown icon for premium users
    - Test badge hidden for free users
    - Test Settings shows "Premium" text badge
    - Test UserMenu shows crown overlay on avatar
    - Test screen reader announces "Premium subscriber"
  - [ ] 5.2 Create PremiumBadge component
    - Props: `variant` (text/icon/overlay), `size` (sm/md)
    - Text variant: gold badge with "Premium" text (for Settings)
    - Icon variant: crown icon only (for compact spaces)
    - Overlay variant: small crown positioned on avatar
    - Color: amber-500 for gold appearance
  - [ ] 5.3 Integrate premium badge into Settings
    - Display next to user name/email
    - Use text variant with "Premium" label
    - Only show for premium subscribers
  - [ ] 5.4 Integrate premium badge into UserMenu
    - Add crown icon overlay to user avatar in header
    - Position: bottom-right corner of avatar
    - Small size, unobtrusive
  - [ ] 5.5 Add premium badge to main screens
    - Consistent appearance across recipe list, meal planner, shopping list
    - Follow existing header patterns
  - [ ] 5.6 Implement accessibility for premium badge
    - Screen reader label: "Premium subscriber"
    - Decorative crown icon hidden from screen readers (`aria-hidden`)
    - Text "Premium" readable by screen readers
  - [ ] 5.7 Ensure premium badge tests pass
    - Run ONLY the tests written in 5.1
    - Verify badges display correctly for premium users only

**Acceptance Criteria:**
- Premium badge visible in Settings for premium users
- Crown overlay appears on avatar in main app header
- Badge consistent across all main screens
- Screen readers announce "Premium subscriber"
- Badge hidden for free users

---

### Feature Gating & Downgrade Logic

#### Task Group 6: Feature Gating and Graceful Downgrade
**Dependencies:** Task Group 2 (usePaywall hook), Task Group 3 (useUsageTracking hook)

- [ ] 6.0 Complete feature gating and downgrade logic
  - [ ] 6.1 Write 2-8 focused tests for gating logic
    - Test recipe creation blocked at 11th recipe for free users
    - Test scan blocked at 4th scan in 30 days for free users
    - Test expired subscription shows read-only state for recipes 11+
    - Test "Add Recipe" shows lock icon when over limit
    - Test premium users can add unlimited recipes
    - Test all existing recipes remain accessible after downgrade
  - [ ] 6.2 Create useEntitlementCheck hook
    - Check subscription status from Convex user record
    - Determine if user can: add recipe, scan cookbook, access meal planner
    - Return: `{ canAddRecipe, canScan, isPremium, subscriptionStatus }`
  - [ ] 6.3 Implement recipe creation gating
    - Before save: check recipe count vs limit
    - If over limit: trigger paywall with 'recipe_limit' context
    - Block action if paywall dismissed
    - Allow action if purchase successful
  - [ ] 6.4 Implement scan feature gating
    - Before camera access: check scan count vs limit
    - If over limit: trigger paywall with 'scan_limit' context
    - Camera/scan screen shows paywall overlay
  - [ ] 6.5 Implement graceful downgrade for expired subscriptions
    - All recipes remain accessible (no deletion)
    - Recipes beyond 10 become read-only: viewable but not editable
    - Display clear messaging: "You have X recipes. Delete Y recipes or upgrade to add more."
    - "Add Recipe" button shows lock icon when over limit
  - [ ] 6.6 Implement read-only recipe state
    - Edit button disabled for recipes 11+ on free tier
    - Visual indicator: lock icon or "View Only" label
    - User can still view, cook from, and reference recipe
  - [ ] 6.7 Implement upsell prompts
    - Meal planner: subtle banner for free users "Plan meals with unlimited recipes"
    - Shopping list: inline prompt when generating list
    - Once per session, dismissible
    - Tap opens paywall
  - [ ] 6.8 Ensure feature gating tests pass
    - Run ONLY the tests written in 6.1
    - Verify gating works correctly for free and premium users

**Acceptance Criteria:**
- Free users blocked at recipe/scan limits with paywall
- Premium users have no limits
- Downgraded users can access all recipes (read-only for 11+)
- Lock icon appears on Add Recipe when over limit
- Upsell prompts appear in meal planner and shopping list

---

### Gamification & Urgency

#### Task Group 7: Gamification and Urgency Elements
**Dependencies:** Task Group 1 (ProgressBar, Badge, CountdownTimer), Task Group 3 (useUsageTracking)

- [ ] 7.0 Complete gamification and urgency elements
  - [ ] 7.1 Write 2-8 focused tests for gamification elements
    - Test milestone message appears on first recipe save
    - Test celebratory animation triggers on recipe save
    - Test "Unlimited Explorer" badge shows for premium users in Settings
    - Test countdown timer displays on annual plan during trial
    - Test scarcity messaging shows at 1-2 recipes remaining
  - [ ] 7.2 Implement milestone messages
    - "First Recipe Saved!" on recipe #1
    - "5 Recipes - You're cooking!" on recipe #5
    - Display as toast or inline celebration
  - [ ] 7.3 Implement celebratory micro-animation
    - Trigger on successful recipe save
    - Animation: confetti burst or checkmark pulse
    - Subtle, fast animation (300-500ms)
    - Works for both free and premium users
  - [ ] 7.4 Create "Unlimited Explorer" achievement badge
    - Display in Settings for premium users
    - Style: achievement badge variant with trophy or explorer icon
    - Appears in achievements/badges section
  - [ ] 7.5 Implement animated progress bar
    - Smooth animated fill when usage changes
    - Transition duration: 300ms ease-out
    - Celebrate fill animations for positive actions
  - [ ] 7.6 Implement urgency elements
    - "Only X recipes remaining" with visual emphasis at 1-2 remaining
    - Bold text, warning color (red-500)
    - "Last scan this month" warning before final scan
  - [ ] 7.7 Add countdown timer to annual plan in paywall
    - Display trial countdown during trial period
    - Format: "7 days free" with countdown
    - Promotional countdown for limited-time offers (if applicable)
  - [ ] 7.8 Ensure gamification tests pass
    - Run ONLY the tests written in 7.1
    - Verify milestones, animations, and urgency elements work

**Acceptance Criteria:**
- Milestone messages appear at key recipe counts
- Celebratory animation triggers on recipe save
- Premium users see "Unlimited Explorer" badge
- Urgency messaging appears at low remaining counts
- Annual plan shows trial countdown

---

### Testing

#### Task Group 8: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-7

- [ ] 8.0 Review existing tests and fill critical gaps only
  - [ ] 8.1 Review tests from Task Groups 1-7
    - Review tests from base components (Task 1.1)
    - Review tests from paywall bottom sheet (Task 2.1)
    - Review tests from usage tracking (Task 3.1)
    - Review tests from nudges and notifications (Task 4.1)
    - Review tests from premium badge (Task 5.1)
    - Review tests from feature gating (Task 6.1)
    - Review tests from gamification (Task 7.1)
    - Total existing tests: approximately 35-56 tests
  - [ ] 8.2 Analyze test coverage gaps for THIS feature only
    - Identify critical end-to-end user workflows lacking coverage
    - Focus on integration between components (e.g., usage tracking + paywall trigger)
    - Check for gaps in edge cases that are business-critical
    - Do NOT assess entire application test coverage
  - [ ] 8.3 Write up to 10 additional strategic tests maximum
    - Focus on integration points between task groups
    - Test critical user journey: approaching limit -> nudge -> paywall -> purchase/dismiss
    - Test downgrade flow: premium expiration -> read-only state -> upgrade path
    - Test subscription status changes reflect in UI
  - [ ] 8.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature
    - Expected total: approximately 45-66 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass
- Critical integration paths have test coverage
- No more than 10 additional tests added
- Testing focused exclusively on paywall and feature gating functionality

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Reusable Base Components** - Foundation for all UI
2. **Task Group 2: Paywall Bottom Sheet** - Core monetization UI
3. **Task Group 3: Usage Tracking Display** - Show limits to users
4. **Task Group 4: Nudge Banners and Trial Notifications** - Encourage upgrades
5. **Task Group 5: Premium Badge Implementation** - Premium status visibility
6. **Task Group 6: Feature Gating and Graceful Downgrade** - Enforce limits
7. **Task Group 7: Gamification and Urgency Elements** - Engagement and conversion
8. **Task Group 8: Test Review and Gap Analysis** - Verify quality

## Integration Points

- **RevenueCat Subscription Spec**: Depends on subscription status fields (`subscriptionStatus`, `subscriptionExpiresAt`, `subscriptionType`) from Convex user record
- **Convex Queries**: Recipe count, rolling 30-day scan count
- **Existing Components**: RecipePreviewModal patterns, RecipeList header, UserMenu

## Component Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| PaywallBottomSheet | New | Main paywall modal |
| ProgressBar | New | Usage visualization |
| Badge | New | Premium/achievement indicators |
| CountdownTimer | New | Trial/promo countdowns |
| NudgeBanner | New | Upgrade prompts |
| PremiumBadge | New | Premium status indicator |
| SubscriptionSection | New | Settings usage display |
| UsageIndicator | New | Recipe list usage pill |
| TrialExpirationBanner | New | Trial ending notification |

## Design Tokens Reference

| Token | Usage |
|-------|-------|
| orange-500 | Primary CTAs, progress bar fills |
| amber-500 | Premium badge, gold accents |
| red-500 | Warning states, danger thresholds |
| stone palette | Backgrounds, secondary text |

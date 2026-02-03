# Spec Requirements: Paywall and Feature Gating

## Initial Description

Enforce free tier limits on recipe count and scan usage. Display upgrade prompts when limits reached. Gate premium features behind subscription check.

This is a **critical feature** required for the monetization strategy and RevenueCat Shipyard 2026 hackathon eligibility.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming the paywall modal should be a full-screen takeover with a dark overlay, matching iOS native subscription patterns. Is that correct, or would you prefer a bottom sheet style that slides up from the bottom?
**Answer:** Bottom sheet that slides up from bottom.

**Q2:** For the usage tracking display (showing remaining recipes/scans), I'm thinking of placing this in two locations: (a) the Settings screen subscription section, and (b) a subtle indicator on the main recipe list screen. Should both locations show usage, or just in Settings to keep the main UI clean?
**Answer:** Both - Settings AND main recipe list screen.

**Q3:** When a free user is approaching their limits (e.g., 8/10 recipes used), I'm assuming we should show a gentle nudge banner like "2 recipes remaining - upgrade for unlimited" rather than waiting for the hard block. Is that the approach you want, or should we only show the paywall when the limit is actually hit?
**Answer:** Yes - show gentle nudge banner when approaching limits.

**Q4:** For premium users, I'm thinking a small "Premium" badge in Settings and perhaps on the profile area, but no persistent badge on the main screens to avoid clutter. Should premium users have any visible indicator in the main app experience, or is Settings-only sufficient?
**Answer:** Both - Settings AND visible in main app experience.

**Q5:** The RevenueCat spec mentions a 7-day free trial for annual plans. When the trial is about to expire (e.g., 1-2 days remaining), I'm assuming we should show an in-app notification reminding the user, or rely on system push notifications from Apple?
**Answer:** In-app notification when trial is ending (1-2 days remaining).

**Q6:** When a subscription expires (billing fails, user cancels, trial ends), I'm assuming we should gracefully downgrade: keep all saved recipes accessible (read-only if over 10), but block new recipe creation until they're under the limit or resubscribe. Is that the expected behavior, or should we restrict access to recipes beyond the first 10?
**Answer:** Graceful downgrade - keep ALL saved recipes accessible (read-only if over limit).

**Q7:** For the paywall copy/messaging, I'm assuming we emphasize the core value: "Save unlimited recipes from cookbooks, websites, and YouTube" with a secondary line about scan limits. Do you have specific marketing copy in mind, or should we draft value-focused messaging?
**Answer:** Value-focused messaging.

**Q8:** Is there anything you explicitly do NOT want in this feature? For example: upsell prompts in the meal planner, gamification of limits, countdown timers to create urgency?
**Answer:** No exclusions - include all features (upsell prompts, gamification, countdown timers).

### Existing Code to Reference

No similar existing features identified for reference. This is a greenfield implementation that will establish patterns for modals, banners, badges, and notification components.

### Follow-up Questions

None required - all requirements sufficiently clarified.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes available. Implementation should follow iOS Human Interface Guidelines for bottom sheets, banners, and badges, combined with RevenueCat paywall best practices.

## Requirements Summary

### Functional Requirements

#### Paywall Bottom Sheet
- **Trigger:** User attempts action that exceeds free tier limit (11th recipe, 4th scan in 30 days)
- **Style:** Bottom sheet that slides up from the bottom of the screen
- **Behavior:** Hard block - must upgrade or dismiss to continue (action blocked if dismissed)
- **Content:**
  - Header: Value-focused messaging (e.g., "Unlock Unlimited Recipes")
  - Value proposition bullets highlighting key benefits
  - Product options:
    - Monthly: "$4.99/month"
    - Annual: "$39.99/year - Save 33%" with "7-day free trial" badge
    - Lifetime: One-time purchase option
  - Promo code entry field
  - "Restore Purchases" link
  - Terms of service and privacy policy links
- **Actions:**
  - Select product and confirm purchase
  - Enter promo code
  - Restore purchases
  - Dismiss (returns to previous screen, original action blocked)

#### Usage Tracking Display

**Settings Screen:**
- Dedicated subscription section showing:
  - Current plan (Free / Premium Monthly / Premium Annual / Premium Lifetime)
  - If free: "X/10 recipes used" and "X/3 scans remaining (resets in Y days)"
  - If premium: "Unlimited recipes" and "Unlimited scans"
  - Visual progress bars for free tier usage

**Recipe List Screen:**
- Subtle indicator in header or footer area
- Format: "8/10 recipes" or icon with count
- Tappable to show more details or navigate to Settings
- Hidden for premium users (or shows "Unlimited" badge)

#### Nudge Banners (Approaching Limits)

**Recipe Limit Nudge:**
- Trigger: When user reaches 8/10 recipes (80% of limit)
- Message: "2 recipes remaining - Upgrade for unlimited"
- Style: Dismissible banner at top or bottom of recipe list
- Action: Tap opens paywall bottom sheet
- Frequency: Show once per session after trigger, re-show if dismissed and user adds another recipe

**Scan Limit Nudge:**
- Trigger: When user reaches 2/3 scans in rolling 30-day window (67% of limit)
- Message: "1 scan remaining this month - Upgrade for unlimited"
- Style: Dismissible banner on camera/scan screen
- Action: Tap opens paywall bottom sheet

**Nudge Escalation:**
- 80% of limit: Gentle nudge banner (dismissible)
- 90% of limit (9/10 recipes): More prominent nudge
- 100% of limit: Hard block paywall

#### Premium Badge

**Settings Screen:**
- Premium badge next to user name/email
- Badge style: Filled badge with "Premium" text or crown icon
- Color: Gold/amber to convey premium status

**Main App Experience:**
- Badge location: Header area or profile avatar indicator
- Style: Small, unobtrusive but visible (e.g., small crown icon overlay on avatar)
- Consistent across all main screens (recipe list, meal planner, shopping list)

#### Trial Expiration Notifications

**In-App Notification:**
- Trigger: 2 days before trial expires, and 1 day before trial expires
- Style: In-app banner or modal (not system push notification)
- Message: "Your free trial ends in X days. Subscribe now to keep unlimited access."
- Action: Tap opens paywall bottom sheet
- Frequency: Show once per day during the notification window

#### Graceful Downgrade (Subscription Expiration)

**When subscription expires:**
- All previously saved recipes remain accessible (read-only if over 10 recipe limit)
- User can view, cook from, and reference all recipes
- New recipe creation blocked if over 10 recipe limit
- New cookbook scans blocked if over 3 scans in rolling 30 days
- Clear messaging: "You have X recipes. Delete Y recipes or upgrade to add more."

**Recipe List Behavior:**
- All recipes visible and accessible
- "Add Recipe" button shows lock icon or triggers paywall if over limit
- No automatic deletion of user content

**Scan Behavior:**
- Camera/scan feature shows paywall if over scan limit
- Previous scans and their recipes remain accessible

#### Upsell Prompts

**Meal Planner Upsell:**
- Context: When free user accesses meal planner
- Style: Subtle banner or inline prompt
- Message: "Plan meals with unlimited recipes - Upgrade to Premium"
- Frequency: Once per session, dismissible

**Shopping List Upsell:**
- Context: When generating shopping list from meal plan
- Style: Inline prompt near premium features
- Message: Highlight premium benefits relevant to shopping

#### Gamification Elements

**Progress Visualization:**
- Visual progress bar showing recipe/scan usage
- Celebratory animation when user saves recipes (even on free tier)
- "X recipes saved!" milestone celebrations

**Achievement Unlocks:**
- "First Recipe Saved" badge
- "5 Recipes" milestone
- Premium users: "Unlimited Explorer" badge

#### Urgency Elements

**Countdown Timers:**
- Annual plan: "7-day free trial" with countdown during trial period
- Promotional offers: Countdown timer on limited-time discounts
- Trial expiration: "Trial ends in X hours" countdown in final 24 hours

**Scarcity Messaging:**
- "Only 2 recipes remaining" with visual emphasis
- "Last scan this month" warning before final scan

### Reusability Opportunities

This spec will establish reusable components for:
- Bottom sheet modal component (reusable across app)
- Banner/notification component (dismissible, actionable)
- Badge component (premium indicator, achievement badges)
- Progress bar component (usage tracking visualization)
- Countdown timer component (trials, promotions)

### Scope Boundaries

**In Scope:**
- Paywall bottom sheet UI and flow
- Usage tracking display (Settings + recipe list)
- Nudge banners when approaching limits
- Premium badge (Settings + main app)
- Trial expiration in-app notifications
- Graceful downgrade logic
- Upsell prompts in meal planner
- Gamification elements (progress, milestones)
- Urgency elements (countdowns, scarcity messaging)
- Integration with RevenueCat subscription status

**Out of Scope:**
- RevenueCat SDK integration (covered in RevenueCat Subscription spec)
- Webhook handling (covered in RevenueCat Subscription spec)
- Product configuration in RevenueCat dashboard
- Push notifications (using in-app notifications only)
- A/B testing of paywall variants
- Analytics tracking of conversion funnel (use RevenueCat dashboard)

### Technical Considerations

#### Integration Points
- **RevenueCat Subscription Spec:** This spec depends on subscription status from Convex user record (`subscriptionStatus`, `subscriptionExpiresAt`, `subscriptionType`)
- **Convex User Record:** Read subscription status for gating logic
- **Convex Recipe Count:** Query user's recipe count for limit enforcement
- **Convex Scan History:** Query rolling 30-day scan count

#### State Management
- Local state for banner dismissal (per session)
- Persistent state for "don't show again" preferences (if implemented)
- Real-time subscription status from Convex

#### Entitlement Check Points
1. **Recipe Creation:** Check recipe count before allowing save
2. **Cookbook Scanning:** Check scan count before allowing camera access
3. **Meal Planner Access:** Show upsell prompt for free users
4. **App Launch:** Check trial status for expiration notifications

#### Component Architecture
- `PaywallBottomSheet` - Main paywall component
- `UsageIndicator` - Reusable usage display component
- `NudgeBanner` - Dismissible promotional banner
- `PremiumBadge` - Premium status indicator
- `TrialExpirationBanner` - Trial countdown notification
- `ProgressBar` - Visual usage progress component

#### Accessibility
- Bottom sheet must be keyboard navigable
- Screen reader support for usage indicators
- Sufficient color contrast for badges and banners
- Focus management when paywall opens/closes

#### Error States
- Network failure during purchase: Show retry option in bottom sheet
- Subscription status unknown: Default to free tier behavior with retry
- Webhook delay: Optimistic UI update after successful purchase

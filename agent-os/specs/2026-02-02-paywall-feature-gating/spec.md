# Specification: Paywall and Feature Gating

## Goal

Enforce free tier limits on recipe count (10) and scan usage (3 per rolling 30 days), display contextual upgrade prompts and nudges, gate premium features behind subscription checks, and provide a polished paywall experience with gamification and urgency elements.

## User Stories

- As a free user approaching my limits, I want to see how many recipes/scans I have remaining so that I can decide whether to upgrade
- As a premium user, I want a visible indicator of my status so that I feel valued and recognize my subscription benefits

## Specific Requirements

**Paywall Bottom Sheet**
- Trigger when user attempts action exceeding free tier (11th recipe save, 4th scan in 30 days)
- Use bottom sheet that slides up from screen bottom (not full-screen modal)
- Hard block behavior: user must upgrade or dismiss (action blocked if dismissed)
- Display value-focused messaging header (e.g., "Unlock Unlimited Recipes")
- Show all three product options: Monthly ($4.99), Annual ($39.99/year with 7-day trial badge), Lifetime
- Include promo code entry field, "Restore Purchases" link, and legal links
- Follow existing modal patterns from RecipePreviewModal (rounded corners, backdrop blur, sticky header/footer)

**Usage Tracking Display - Settings Screen**
- Dedicated subscription section showing current plan (Free / Premium Monthly / Annual / Lifetime)
- Free users see: "X/10 recipes used" and "X/3 scans remaining (resets in Y days)"
- Premium users see: "Unlimited recipes" and "Unlimited scans"
- Visual progress bars for free tier usage with orange-500 fill color
- Tappable section opens paywall bottom sheet if free, or "Manage Subscription" for premium

**Usage Tracking Display - Recipe List Screen**
- Subtle indicator in header area showing "8/10 recipes" or similar format
- Style as small pill badge, non-intrusive but visible
- Tappable to navigate to Settings subscription section
- Hidden for premium users or replaced with small "Unlimited" badge

**Nudge Banners (Approaching Limits)**
- Recipe nudge triggers at 8/10 recipes (80% threshold): "2 recipes remaining - Upgrade for unlimited"
- Scan nudge triggers at 2/3 scans (67% threshold): "1 scan remaining this month - Upgrade for unlimited"
- Style as dismissible banner at top of relevant screen (recipe list, camera screen)
- Escalate at 90% (9/10 recipes): more prominent styling with stronger CTA
- Banner tap opens paywall bottom sheet
- Show once per session after trigger; re-show if user adds another item

**Premium Badge**
- Settings: Gold/amber badge with "Premium" text or crown icon next to user name
- Main app: Small crown icon overlay on profile avatar in header
- Consistent badge appearance across recipe list, meal planner, shopping list screens
- Use amber-500/gold color to convey premium status
- Accessible: include screen reader label "Premium subscriber"

**Trial Expiration Notifications**
- In-app banner (not push notification) at 2 days and 1 day before trial ends
- Message: "Your free trial ends in X days. Subscribe now to keep unlimited access."
- Banner tap opens paywall bottom sheet
- Show once per day during notification window
- Style with countdown timer in final 24 hours: "Trial ends in X hours"

**Graceful Downgrade Behavior**
- All previously saved recipes remain accessible after subscription expires
- Recipes over limit (11+) become read-only: viewable but not editable
- New recipe creation blocked if over 10 limit; "Add Recipe" shows lock icon
- New scans blocked if over 3 in rolling 30 days; camera shows paywall
- Display clear messaging: "You have X recipes. Delete Y recipes or upgrade to add more."
- No automatic deletion of user content under any circumstance

**Upsell Prompts**
- Meal planner: Show subtle banner when free user accesses: "Plan meals with unlimited recipes - Upgrade"
- Shopping list: Inline prompt when generating list from meal plan
- Style as dismissible, once per session
- Tap opens paywall bottom sheet

**Gamification Elements**
- Visual progress bar showing recipe/scan usage with animated fill
- Celebratory micro-animation when saving recipes (confetti or checkmark pulse)
- Milestone messages: "First Recipe Saved!", "5 Recipes - You're cooking!"
- Premium users: "Unlimited Explorer" badge in Settings

**Urgency Elements**
- Countdown timer on annual plan during trial period
- "Only X recipes remaining" with visual emphasis (bold, warning color at 1-2 remaining)
- "Last scan this month" warning styling before final scan
- Support promotional countdown timers for limited-time offers

## Existing Code to Leverage

**RecipePreviewModal (`product-plan/sections/discover/components/RecipePreviewModal.tsx`)**
- Use same bottom sheet pattern: `fixed inset-0`, backdrop with blur, `rounded-t-3xl` for mobile
- Reuse sticky header/footer structure with action buttons
- Follow animation pattern: `animate-in slide-in-from-bottom-4`
- Apply same color scheme: orange-500 primary buttons, stone palette for secondary

**RecipeList Header (`product-plan/sections/recipe-library/components/RecipeList.tsx`)**
- Add usage indicator to existing sticky header structure
- Follow same styling: `bg-white/80 backdrop-blur-lg`, border patterns
- Integrate premium badge near existing filter/view toggle area

**UserMenu Component (`product-plan/shell/components/UserMenu.tsx`)**
- Add premium badge/crown icon to user avatar display
- Follow existing styling patterns for badge overlay

**Design System Tokens**
- Primary: orange-500 for CTAs and progress bar fills
- Premium badge: amber-500/gold for premium indicators
- Warning states: red-500 for "last scan" or "1 recipe remaining" emphasis
- Follow stone palette for backgrounds and text

**Data Model Types (`product-plan/data-model/types.ts`)**
- Follow existing TypeScript interface patterns for any new types
- Subscription status fields already defined in RevenueCat spec

## Out of Scope

- RevenueCat SDK integration and purchase flow mechanics (covered in RevenueCat Subscription spec)
- Webhook handling and Convex sync (covered in RevenueCat Subscription spec)
- Product configuration in RevenueCat dashboard or App Store Connect
- System push notifications (using in-app notifications only)
- A/B testing of paywall variants or messaging
- Detailed analytics tracking of conversion funnel (use RevenueCat dashboard)
- Custom paywall design variations per user segment
- Referral program UI (backend support only via promo codes)
- Offline paywall display (requires network for purchase flow)
- iPad-specific paywall layout optimizations

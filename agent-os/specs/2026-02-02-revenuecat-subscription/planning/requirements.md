# Spec Requirements: RevenueCat Subscription Integration

## Initial Description

Implement freemium model with RevenueCat. Free tier: 10 recipes, 3 scans/month. Premium tier: unlimited recipes and scans. Handle purchase flow, restore purchases, and entitlement checks.

This is a **critical feature** required for RevenueCat Shipyard 2026 hackathon eligibility.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming a simple two-tier model: Free and Premium (single SKU). Is that correct, or do you want separate Monthly and Annual subscription options with different pricing?
**Answer:** Both Monthly AND Annual subscription options.

**Q2:** For pricing, I'm thinking $4.99/month or $39.99/year (33% discount for annual) would be typical for a utility app like this. Do you have specific pricing in mind, or should we configure placeholder prices that you can adjust in RevenueCat dashboard later?
**Answer:** Yes - use typical pricing ($4.99/month, $39.99/year with 33% annual discount).

**Q3:** I assume no free trial period for the hackathon MVP to keep the flow simple. Would you prefer to offer a 7-day free trial for premium, or skip trials for now?
**Answer:** Not specified - use best practice recommendation.

**Best Practice Recommendation for Free Trial:**
**Include a 7-day free trial for the annual plan only.** Rationale:
- Industry data shows trials increase conversion rates by 20-40% for subscription apps
- Limiting trial to annual plan encourages users to commit to longer subscription
- RevenueCat handles trial management automatically with no additional implementation complexity
- For hackathon demo, showing a trial flow demonstrates fuller RevenueCat integration
- Users who experience premium features during trial have higher retention

**Q4:** For the upgrade prompts when users hit limits, I'm assuming we show a modal paywall when user tries to save their 11th recipe or scan their 4th cookbook page. Should the paywall be a hard block (must upgrade to continue) or a soft prompt (can dismiss and try again later)?
**Answer:** Hard block - must upgrade to continue when hitting limits.

**Q5:** For tracking scan usage, I assume we reset the count on the 1st of each calendar month rather than a rolling 30-day window. Is that correct?
**Answer:** Rolling 30-day window (not calendar month).

**Q6:** The tech stack mentions syncing subscription status to Convex. I'm assuming we use RevenueCat webhooks to update a subscriptionStatus field on the user record in Convex, rather than checking RevenueCat directly on every API call. Is that the approach you want?
**Answer:** Yes - RevenueCat webhooks to update user's subscriptionStatus in Convex.

**Q7:** For the restore purchases flow, I assume we need a "Restore Purchases" button in the settings screen for users who reinstall the app or switch devices. Should we also automatically attempt restore on app launch for logged-in users who appear to be on the free tier?
**Answer:** Yes - "Restore Purchases" button in settings AND auto-attempt restore on app launch.

**Q8:** Is there anything you explicitly do NOT want included in this integration (e.g., lifetime purchase option, promotional offers, referral discounts)?
**Answer:** No exclusions - include all features (lifetime purchase option, promo offers, referral discounts).

### Existing Code to Reference

No similar existing features identified for reference. This is a greenfield implementation.

### Follow-up Questions

None required - all requirements sufficiently clarified.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes available. Implementation should follow standard iOS subscription UI patterns and RevenueCat best practices.

## Requirements Summary

### Functional Requirements

#### Subscription Products
- **Monthly Premium:** $4.99/month, no trial
- **Annual Premium:** $39.99/year (33% savings), includes 7-day free trial
- **Lifetime Premium:** One-time purchase (price TBD in RevenueCat dashboard)
- All premium tiers unlock the same entitlement: "premium"

#### Free Tier Limits
- Maximum 10 saved recipes
- Maximum 3 cookbook scans per rolling 30-day window
- Full access to all other features (meal planning, shopping lists, web import)

#### Premium Tier Benefits
- Unlimited recipe storage
- Unlimited cookbook scans
- Access to promotional offers and referral discounts
- Priority support (future consideration)

#### Purchase Flow
- Paywall screen displays when user hits a limit (hard block)
- Show both Monthly and Annual options with savings callout
- Annual option highlights 7-day free trial
- Lifetime option available as alternative
- Purchase handled via RevenueCat SDK
- Success confirmation and immediate feature unlock

#### Restore Purchases Flow
- "Restore Purchases" button in Settings screen
- Automatic restore attempt on app launch for users appearing on free tier
- Loading indicator during restore process
- Success/failure feedback to user
- Handles cross-device and reinstall scenarios

#### Entitlement Checks
- Client-side: Check `CustomerInfo` from RevenueCat SDK before gated actions
- Server-side: Check `subscriptionStatus` field on Convex user record
- Dual validation for security-sensitive operations (scan processing)

#### Promotional Features
- Support RevenueCat promotional offers
- Support referral discount codes
- Promo code entry field on paywall

### Technical Requirements

#### RevenueCat Configuration
- Configure iOS app in RevenueCat dashboard
- Create products: `digero_premium_monthly`, `digero_premium_annual`, `digero_premium_lifetime`
- Create entitlement: `premium`
- Create offering: `default` with all three products
- Configure 7-day trial for annual product in App Store Connect

#### Rolling 30-Day Scan Tracking
- Store each scan with timestamp in Convex: `scanHistory` table
- Fields: `userId`, `scannedAt` (timestamp), `recipeId` (optional, if scan succeeded)
- Query: Count scans where `scannedAt > now() - 30 days`
- Display remaining scans to user: "X scans remaining (resets in Y days)"
- Calculate "resets in Y days" based on oldest scan in the 30-day window

#### Webhook Integration (RevenueCat to Convex)
- Endpoint: Convex HTTP action at `/webhooks/revenuecat`
- Verify webhook signature using RevenueCat shared secret
- Handle events:
  - `INITIAL_PURCHASE` - Set `subscriptionStatus: "premium"`, `subscriptionType`, `expiresAt`
  - `RENEWAL` - Update `expiresAt`
  - `CANCELLATION` - Set `canceledAt`, keep premium until `expiresAt`
  - `EXPIRATION` - Set `subscriptionStatus: "free"`
  - `BILLING_ISSUE` - Set `billingIssue: true`, notify user
  - `PRODUCT_CHANGE` - Update `subscriptionType`
- Store on user record:
  ```
  subscriptionStatus: "free" | "premium" | "trial"
  subscriptionType: "monthly" | "annual" | "lifetime" | null
  subscriptionExpiresAt: timestamp | null
  subscriptionCanceledAt: timestamp | null
  hasBillingIssue: boolean
  revenuecatUserId: string
  ```

#### SDK Integration
- Initialize RevenueCat SDK on app launch with user ID (Clerk user ID)
- Configure to use Clerk user ID as RevenueCat app user ID for cross-platform sync
- Listen for `CustomerInfo` updates to sync local state
- Implement purchase methods: `purchasePackage()`, `restorePurchases()`

### Scope Boundaries

**In Scope:**
- RevenueCat SDK integration and initialization
- Three subscription products (monthly, annual, lifetime)
- Paywall UI with product selection
- Purchase flow with success/error handling
- Restore purchases (manual and automatic)
- Webhook endpoint for Convex sync
- Rolling 30-day scan tracking
- Recipe count enforcement
- Entitlement checks (client and server)
- Promotional offer support
- Settings screen subscription management

**Out of Scope:**
- Android implementation (post-hackathon)
- Subscription analytics dashboard
- Custom paywall A/B testing
- Family sharing
- Subscription gifting
- Refund processing (handled by App Store)
- Detailed revenue reporting (use RevenueCat dashboard)

### Technical Considerations

#### Integration Points
- **Clerk:** Use Clerk user ID as RevenueCat app user ID
- **Convex:** Webhook endpoint, user record updates, scan history table
- **App Store Connect:** Product configuration, trial setup, pricing

#### Security
- Webhook signature verification required
- Server-side entitlement check for scan processing (prevent client-side bypass)
- RevenueCat API key stored in environment variables

#### Error Handling
- Network failures during purchase: Show retry option
- Webhook delivery failures: RevenueCat automatic retry
- Restore failures: Clear error message with support contact
- Billing issues: In-app notification with resolution link

#### User Experience
- Optimistic UI updates after purchase (don't wait for webhook)
- Graceful degradation if RevenueCat SDK unavailable
- Clear communication of subscription status and renewal date
- Transparent display of remaining free tier usage

### Paywall UI Flow

1. **Trigger:** User attempts action that exceeds free tier limit
2. **Hard Block Modal:** Cannot dismiss without action
3. **Content:**
   - Header: "Upgrade to Premium"
   - Value proposition: "Unlimited recipes and cookbook scans"
   - Product options:
     - Monthly: "$4.99/month"
     - Annual: "$39.99/year - Save 33%" + "7-day free trial" badge
     - Lifetime: "$XX.XX one-time" (optional display)
   - Promo code entry field
   - "Restore Purchases" link
   - Terms of service and privacy policy links
4. **Actions:**
   - Select product and confirm purchase
   - Enter promo code
   - Restore purchases
   - Close (returns to previous screen, action blocked)
5. **Post-Purchase:**
   - Success animation/confirmation
   - Immediate access to blocked feature
   - Return to original action flow

### Settings Screen Subscription Section

- Current plan display (Free / Premium Monthly / Premium Annual / Premium Lifetime)
- If subscribed:
  - Renewal date or "Lifetime access"
  - "Manage Subscription" link (opens App Store subscription management)
  - Cancel info: "Your subscription will remain active until [date]"
- If free:
  - "Upgrade to Premium" button
  - Usage display: "X/10 recipes used" and "X/3 scans remaining"
- "Restore Purchases" button (always visible)

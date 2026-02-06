/**
 * Subscription Tier Types and Constants
 *
 * Defines the subscription tier system for Digero:
 * - Free: Basic users with limits
 * - Plus: Paid subscribers with unlimited features
 * - Creator: Higher-tier with exclusive benefits and shop discounts
 * - Trial: Time-limited trial (treated as Plus for access)
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Subscription status values
 */
export type SubscriptionTier = "free" | "plus" | "creator" | "trial";

/**
 * Subscription billing period
 */
export type BillingPeriod = "monthly" | "annual" | "lifetime";

/**
 * RevenueCat product identifiers
 */
export type ProductId =
  | "digero_plus_monthly"
  | "digero_plus_annual"
  | "digero_creator_monthly"
  | "digero_creator_annual";

/**
 * RevenueCat entitlement identifiers
 */
export type EntitlementId = "plus_access" | "creator_access";

// =============================================================================
// Pricing Constants
// =============================================================================

/**
 * Plus tier pricing (USD)
 */
export const PLUS_PRICING = {
  monthly: {
    price: 4.99,
    priceDisplay: "$4.99",
    period: "monthly",
    productId: "digero_plus_monthly" as const,
  },
  annual: {
    price: 49.99,
    priceDisplay: "$49.99",
    period: "annual",
    productId: "digero_plus_annual" as const,
    monthlyEquivalent: 4.17,
    savingsPercent: 17,
  },
} as const;

/**
 * Creator tier pricing (USD)
 */
export const CREATOR_PRICING = {
  monthly: {
    price: 9.99,
    priceDisplay: "$9.99",
    period: "monthly",
    productId: "digero_creator_monthly" as const,
  },
  annual: {
    price: 89.99,
    priceDisplay: "$89.99",
    period: "annual",
    productId: "digero_creator_annual" as const,
    monthlyEquivalent: 7.50,
    savingsPercent: 25,
  },
} as const;

// =============================================================================
// Entitlements
// =============================================================================

/**
 * RevenueCat entitlement configurations
 */
export const ENTITLEMENTS = {
  plus_access: {
    id: "plus_access" as const,
    name: "Plus Access",
    description: "Access to Plus tier features",
    products: [PLUS_PRICING.monthly.productId, PLUS_PRICING.annual.productId],
  },
  creator_access: {
    id: "creator_access" as const,
    name: "Creator Access",
    description: "Access to Creator tier features (includes Plus)",
    products: [CREATOR_PRICING.monthly.productId, CREATOR_PRICING.annual.productId],
    inherits: ["plus_access"],
  },
} as const;

// =============================================================================
// Tier Benefits
// =============================================================================

/**
 * Benefits available in each tier
 */
export const TIER_BENEFITS = {
  free: {
    name: "Free",
    description: "Get started with the basics",
    features: [
      { name: "Save up to 10 recipes", included: true },
      { name: "3 cookbook scans per month", included: true },
      { name: "5 Sous Chef messages per day", included: true },
      { name: "Basic meal planning", included: true },
      { name: "Shopping list generation", included: true },
      { name: "Unlimited recipes", included: false },
      { name: "Unlimited cookbook scans", included: false },
      { name: "Unlimited Sous Chef", included: false },
      { name: "Shop discounts", included: false },
      { name: "Early access content", included: false },
      { name: "Creator messaging", included: false },
    ],
  },
  plus: {
    name: "Plus",
    description: "Unlimited access for home cooks",
    badge: "Most Popular",
    pricing: PLUS_PRICING,
    features: [
      { name: "Save up to 10 recipes", included: true, upgraded: "Unlimited recipes" },
      { name: "3 cookbook scans per month", included: true, upgraded: "Unlimited cookbook scans" },
      { name: "5 Sous Chef messages per day", included: true, upgraded: "Unlimited Sous Chef" },
      { name: "Basic meal planning", included: true, upgraded: "Advanced meal planning" },
      { name: "Shopping list generation", included: true },
      { name: "Unlimited recipes", included: true },
      { name: "Unlimited cookbook scans", included: true },
      { name: "Unlimited Sous Chef", included: true },
      { name: "15% shop discount", included: true },
      { name: "Early access content", included: false },
      { name: "Creator messaging", included: false },
    ],
  },
  creator: {
    name: "Creator",
    description: "Everything in Plus, plus exclusive perks",
    badge: "Best Value",
    pricing: CREATOR_PRICING,
    features: [
      { name: "Save up to 10 recipes", included: true, upgraded: "Unlimited recipes" },
      { name: "3 cookbook scans per month", included: true, upgraded: "Unlimited cookbook scans" },
      { name: "5 Sous Chef messages per day", included: true, upgraded: "Unlimited Sous Chef" },
      { name: "Basic meal planning", included: true, upgraded: "Advanced meal planning" },
      { name: "Shopping list generation", included: true },
      { name: "Unlimited recipes", included: true },
      { name: "Unlimited cookbook scans", included: true },
      { name: "Unlimited Sous Chef", included: true },
      { name: "15% shop discount", included: true },
      { name: "Early access to creator recipes", included: true },
      { name: "Exclusive creator content", included: true },
      { name: "Direct messaging with creators", included: true },
      { name: "Vote on future content", included: true },
    ],
  },
  trial: {
    name: "Trial",
    description: "Try Plus features free for 7 days",
    features: TIER_BENEFITS?.plus?.features ?? [],
  },
} as const;

// =============================================================================
// Free Tier Limits
// =============================================================================

/**
 * Free tier usage limits
 */
export const FREE_TIER_LIMITS = {
  recipes: 10,
  scansPerMonth: 3,
  aiMessagesPerDay: 5,
} as const;

/**
 * Member discount rate for Plus and Creator tiers
 */
export const MEMBER_DISCOUNT_RATE = 15;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a tier has premium access (unlimited features)
 */
export function hasPremiumAccess(tier: SubscriptionTier): boolean {
  return tier === "plus" || tier === "creator" || tier === "trial";
}

/**
 * Check if a tier has creator-specific features
 */
export function hasCreatorAccess(tier: SubscriptionTier): boolean {
  return tier === "creator";
}

/**
 * Get the member discount rate for a tier
 */
export function getMemberDiscountRate(tier: SubscriptionTier): number {
  if (tier === "plus" || tier === "creator") {
    return MEMBER_DISCOUNT_RATE;
  }
  return 0;
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  tier: SubscriptionTier
): number {
  const discountRate = getMemberDiscountRate(tier);
  if (discountRate === 0) return originalPrice;
  return originalPrice * (1 - discountRate / 100);
}

/**
 * Format discounted price for display
 */
export function formatDiscountedPrice(
  originalPrice: number,
  tier: SubscriptionTier
): string {
  const discounted = calculateDiscountedPrice(originalPrice, tier);
  return `$${discounted.toFixed(2)}`;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  return TIER_BENEFITS[tier]?.name ?? "Free";
}

/**
 * Get tier from entitlement
 * Maps RevenueCat entitlements to our tier system
 */
export function getTierFromEntitlement(
  hasCreatorAccess: boolean,
  hasPlusAccess: boolean,
  isTrialing: boolean
): SubscriptionTier {
  if (isTrialing) return "trial";
  if (hasCreatorAccess) return "creator";
  if (hasPlusAccess) return "plus";
  return "free";
}

/**
 * Get the product ID for a tier and billing period
 */
export function getProductId(
  tier: "plus" | "creator",
  period: "monthly" | "annual"
): ProductId {
  if (tier === "plus") {
    return period === "monthly"
      ? PLUS_PRICING.monthly.productId
      : PLUS_PRICING.annual.productId;
  }
  return period === "monthly"
    ? CREATOR_PRICING.monthly.productId
    : CREATOR_PRICING.annual.productId;
}

// =============================================================================
// RevenueCat Configuration Documentation
// =============================================================================

/**
 * RevenueCat Product Configuration
 *
 * Product IDs to configure in RevenueCat Dashboard:
 * - digero_plus_monthly: Plus monthly subscription ($4.99/mo)
 * - digero_plus_annual: Plus annual subscription ($49.99/yr)
 * - digero_creator_monthly: Creator monthly subscription ($9.99/mo)
 * - digero_creator_annual: Creator annual subscription ($89.99/yr)
 *
 * Entitlements to configure:
 * - plus_access: Grants Plus tier features
 *   - Products: digero_plus_monthly, digero_plus_annual
 *
 * - creator_access: Grants Creator tier features (inherits plus_access)
 *   - Products: digero_creator_monthly, digero_creator_annual
 *
 * Note: Actual RevenueCat dashboard configuration is done manually.
 * This file documents the expected configuration for reference.
 */
export const REVENUECAT_CONFIG = {
  products: {
    digero_plus_monthly: {
      displayName: "Digero Plus Monthly",
      price: 4.99,
      type: "subscription",
      duration: "P1M",
    },
    digero_plus_annual: {
      displayName: "Digero Plus Annual",
      price: 49.99,
      type: "subscription",
      duration: "P1Y",
    },
    digero_creator_monthly: {
      displayName: "Digero Creator Monthly",
      price: 9.99,
      type: "subscription",
      duration: "P1M",
    },
    digero_creator_annual: {
      displayName: "Digero Creator Annual",
      price: 89.99,
      type: "subscription",
      duration: "P1Y",
    },
  },
  entitlements: {
    plus_access: {
      products: ["digero_plus_monthly", "digero_plus_annual"],
    },
    creator_access: {
      products: ["digero_creator_monthly", "digero_creator_annual"],
      inherits: ["plus_access"],
    },
  },
} as const;

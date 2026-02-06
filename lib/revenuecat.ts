/**
 * RevenueCat SDK Utilities
 *
 * Provides RevenueCat SDK integration for subscription management.
 * Handles SDK initialization, purchases, paywalls, and customer center.
 *
 * API Key: test_JLISJBCUFjETcUUgjjBrzQCDRXW
 * Entitlements: plus, creator
 * Products: digero_plus_monthly, digero_plus_annual, digero_creator_monthly, digero_creator_annual
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { Platform, Linking } from "react-native";

// =============================================================================
// Constants
// =============================================================================

/** RevenueCat API Key - Use test key for development */
export const REVENUECAT_API_KEY = "test_JLISJBCUFjETcUUgjjBrzQCDRXW";

/** Entitlement identifiers in RevenueCat */
export const ENTITLEMENTS = {
  PLUS: "plus",
  CREATOR: "creator",
} as const;

/** Legacy entitlement for backwards compatibility */
export const PREMIUM_ENTITLEMENT = "plus";

/** Default offering identifier */
export const DEFAULT_OFFERING = "default";

/** Product identifiers for new subscription tiers */
export const PRODUCTS = {
  // Plus tier
  PLUS_MONTHLY: "digero_plus_monthly",
  PLUS_ANNUAL: "digero_plus_annual",
  // Creator tier
  CREATOR_MONTHLY: "digero_creator_monthly",
  CREATOR_ANNUAL: "digero_creator_annual",
  // Legacy (for backwards compatibility)
  MONTHLY: "digero_plus_monthly",
  YEARLY: "digero_plus_annual",
  LIFETIME: "digero_plus_annual", // Map lifetime to annual for now
} as const;

// =============================================================================
// Types
// =============================================================================

export interface SubscriptionInfo {
  isPremium: boolean;
  subscriptionType: "plus_monthly" | "plus_annual" | "creator_monthly" | "creator_annual" | "monthly" | "yearly" | "lifetime" | null;
  tier: "free" | "plus" | "creator";
  expiresAt: Date | null;
  isTrialPeriod: boolean;
  hasBillingIssue: boolean;
  willRenew: boolean;
}

export interface ProductInfo {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  currencyCode: string;
  introPrice?: {
    priceString: string;
    cycles: number;
    period: string;
    periodUnit: string;
    periodNumberOfUnits: number;
  } | null;
}

export interface OfferingsResult {
  current: {
    identifier: string;
    monthly?: ProductInfo;
    yearly?: ProductInfo;
    lifetime?: ProductInfo;
    packages: ProductInfo[];
  } | null;
}

export type PaywallResult =
  | "purchased"
  | "restored"
  | "cancelled"
  | "error"
  | "not_presented";

// =============================================================================
// SDK Initialization
// =============================================================================

let isConfigured = false;

/**
 * Configure RevenueCat SDK
 *
 * Should be called once on app launch after Clerk authentication.
 * Uses Clerk user ID as the app_user_id for cross-platform sync.
 */
export async function configureRevenueCat(clerkUserId?: string): Promise<void> {
  if (isConfigured) {
    // Already configured, just log in with the user ID if provided
    if (clerkUserId) {
      await loginUser(clerkUserId);
    }
    return;
  }

  try {
    // Set log level BEFORE configure in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure SDK with API key
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: clerkUserId || undefined,
      usesStoreKit2IfAvailable: true, // Enable StoreKit 2 for simulator testing
    });

    isConfigured = true;
    console.log("RevenueCat configured successfully", clerkUserId ? `for user: ${clerkUserId}` : "anonymously");
  } catch (error) {
    console.error("Failed to configure RevenueCat:", error);
    throw error;
  }
}

/**
 * Log in a user to RevenueCat
 *
 * Called when user signs in or when SDK needs to switch users.
 */
export async function loginUser(clerkUserId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(clerkUserId);
    console.log("Logged in to RevenueCat:", clerkUserId);
    return customerInfo;
  } catch (error) {
    console.error("Failed to log in to RevenueCat:", error);
    throw error;
  }
}

/**
 * Log out the current user from RevenueCat
 *
 * Called when user signs out.
 */
export async function logoutUser(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.logOut();
    console.log("Logged out from RevenueCat");
    return customerInfo;
  } catch (error) {
    console.error("Failed to log out from RevenueCat:", error);
    throw error;
  }
}

// =============================================================================
// Customer Info & Entitlements
// =============================================================================

/**
 * Get current customer info
 *
 * Returns the latest CustomerInfo from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    throw error;
  }
}

/**
 * Parse subscription info from CustomerInfo
 *
 * Extracts relevant subscription details from RevenueCat CustomerInfo.
 * Supports both new tiers (plus/creator) and legacy products.
 */
export function parseSubscriptionInfo(customerInfo: CustomerInfo): SubscriptionInfo {
  // Check for creator tier first (higher tier takes precedence)
  const creatorEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.CREATOR];
  const plusEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PLUS];
  const legacyEntitlement = customerInfo.entitlements.active["Digero Pro"]; // Legacy support

  const activeEntitlement = creatorEntitlement || plusEntitlement || legacyEntitlement;
  const isPremium = !!activeEntitlement;

  // Determine tier
  let tier: "free" | "plus" | "creator" = "free";
  if (creatorEntitlement) {
    tier = "creator";
  } else if (plusEntitlement || legacyEntitlement) {
    tier = "plus";
  }

  let subscriptionType: SubscriptionInfo["subscriptionType"] = null;
  let expiresAt: Date | null = null;
  let isTrialPeriod = false;
  let hasBillingIssue = false;
  let willRenew = false;

  if (activeEntitlement) {
    // Determine subscription type from product identifier
    const productId = activeEntitlement.productIdentifier;

    // New tier products
    if (productId === PRODUCTS.PLUS_MONTHLY || productId.includes("plus_monthly")) {
      subscriptionType = "plus_monthly";
    } else if (productId === PRODUCTS.PLUS_ANNUAL || productId.includes("plus_annual")) {
      subscriptionType = "plus_annual";
    } else if (productId === PRODUCTS.CREATOR_MONTHLY || productId.includes("creator_monthly")) {
      subscriptionType = "creator_monthly";
    } else if (productId === PRODUCTS.CREATOR_ANNUAL || productId.includes("creator_annual")) {
      subscriptionType = "creator_annual";
    }
    // Legacy products
    else if (productId === "monthly") {
      subscriptionType = "monthly";
    } else if (productId === "yearly") {
      subscriptionType = "yearly";
    } else if (productId === "lifetime") {
      subscriptionType = "lifetime";
    }

    // Get expiration date (null for lifetime)
    if (activeEntitlement.expirationDate) {
      expiresAt = new Date(activeEntitlement.expirationDate);
    }

    // Check trial status
    isTrialPeriod = activeEntitlement.periodType === "TRIAL";

    // Check billing issue
    if (activeEntitlement.billingIssueDetectedAt) {
      hasBillingIssue = true;
    }

    // Check if will renew
    willRenew = activeEntitlement.willRenew;
  }

  return {
    isPremium,
    subscriptionType,
    tier,
    expiresAt,
    isTrialPeriod,
    hasBillingIssue,
    willRenew,
  };
}

/**
 * Check if user has any premium entitlement (plus or creator)
 *
 * Quick check for premium access.
 */
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    const active = customerInfo.entitlements.active;
    return !!(active[ENTITLEMENTS.PLUS] || active[ENTITLEMENTS.CREATOR] || active["Digero Pro"]);
  } catch (error) {
    console.error("Failed to check premium status:", error);
    return false;
  }
}

/**
 * Get current subscription tier
 *
 * Returns the user's current tier: "free", "plus", or "creator"
 */
export async function getSubscriptionTier(): Promise<"free" | "plus" | "creator"> {
  try {
    const customerInfo = await getCustomerInfo();
    const active = customerInfo.entitlements.active;

    if (active[ENTITLEMENTS.CREATOR]) {
      return "creator";
    }
    if (active[ENTITLEMENTS.PLUS] || active["Digero Pro"]) {
      return "plus";
    }
    return "free";
  } catch (error) {
    console.error("Failed to get subscription tier:", error);
    return "free";
  }
}

// =============================================================================
// Offerings & Products
// =============================================================================

/**
 * Get available offerings
 *
 * Fetches offerings configured in RevenueCat dashboard.
 */
export async function getOfferings(): Promise<OfferingsResult> {
  try {
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      return { current: null };
    }

    const current = offerings.current;
    const packages: ProductInfo[] = [];

    // Map packages to ProductInfo
    for (const pkg of current.availablePackages) {
      const product = pkg.product;
      const productInfo: ProductInfo = {
        identifier: pkg.identifier,
        title: product.title,
        description: product.description,
        priceString: product.priceString,
        price: product.price,
        currencyCode: product.currencyCode,
        introPrice: product.introPrice
          ? {
              priceString: product.introPrice.priceString,
              cycles: product.introPrice.cycles,
              period: product.introPrice.period,
              periodUnit: product.introPrice.periodUnit,
              periodNumberOfUnits: product.introPrice.periodNumberOfUnits,
            }
          : null,
      };
      packages.push(productInfo);
    }

    // Find specific package types
    const monthly = packages.find(
      (p) => p.identifier.includes(PRODUCTS.MONTHLY) || p.identifier === "$rc_monthly"
    );
    const yearly = packages.find(
      (p) => p.identifier.includes(PRODUCTS.YEARLY) || p.identifier === "$rc_annual"
    );
    const lifetime = packages.find(
      (p) => p.identifier.includes(PRODUCTS.LIFETIME) || p.identifier === "$rc_lifetime"
    );

    return {
      current: {
        identifier: current.identifier,
        monthly,
        yearly,
        lifetime,
        packages,
      },
    };
  } catch (error) {
    console.error("Failed to get offerings:", error);
    throw error;
  }
}

// =============================================================================
// RevenueCat Paywall (react-native-purchases-ui)
// =============================================================================

/**
 * Present the RevenueCat Paywall
 *
 * Shows the native RevenueCat paywall UI configured in the dashboard.
 * This is the recommended way to present paywalls as it handles all UI,
 * purchase flow, and restore automatically.
 *
 * @param offering - Optional offering identifier (defaults to current offering)
 * @returns PaywallResult indicating the outcome
 */
export async function presentPaywall(offering?: string): Promise<PaywallResult> {
  try {
    const paywallResult = await RevenueCatUI.presentPaywall({
      offering: offering,
    });

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        console.log("User made a purchase through paywall");
        return "purchased";
      case PAYWALL_RESULT.RESTORED:
        console.log("User restored purchases through paywall");
        return "restored";
      case PAYWALL_RESULT.CANCELLED:
        console.log("User cancelled the paywall");
        return "cancelled";
      case PAYWALL_RESULT.ERROR:
        console.log("Error presenting paywall");
        return "error";
      case PAYWALL_RESULT.NOT_PRESENTED:
        console.log("Paywall was not presented (user already has entitlement)");
        return "not_presented";
      default:
        return "cancelled";
    }
  } catch (error) {
    console.error("Failed to present paywall:", error);
    return "error";
  }
}

/**
 * Present the RevenueCat Paywall if needed
 *
 * Only shows the paywall if the user doesn't have the premium entitlement.
 * Use this for gating features behind a subscription.
 *
 * @returns PaywallResult indicating the outcome
 */
export async function presentPaywallIfNeeded(): Promise<PaywallResult> {
  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PREMIUM_ENTITLEMENT,
    });

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        return "purchased";
      case PAYWALL_RESULT.RESTORED:
        return "restored";
      case PAYWALL_RESULT.CANCELLED:
        return "cancelled";
      case PAYWALL_RESULT.ERROR:
        return "error";
      case PAYWALL_RESULT.NOT_PRESENTED:
        // User already has the entitlement
        return "not_presented";
      default:
        return "cancelled";
    }
  } catch (error) {
    console.error("Failed to present paywall:", error);
    return "error";
  }
}

// =============================================================================
// Customer Center
// =============================================================================

/**
 * Present the RevenueCat Customer Center
 *
 * Shows the native customer center UI where users can:
 * - View their subscription details
 * - Cancel or change their subscription
 * - Restore purchases
 * - Contact support
 *
 * Note: Customer Center must be configured in RevenueCat dashboard.
 */
export async function presentCustomerCenter(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter();
    console.log("Customer center presented");
  } catch (error) {
    console.error("Failed to present customer center:", error);
    // Fallback to App Store subscription management
    await openSubscriptionManagement();
  }
}

/**
 * Open subscription management in App Store / Play Store
 *
 * Fallback method to manage subscriptions outside the app.
 */
export async function openSubscriptionManagement(): Promise<void> {
  try {
    const customerInfo = await getCustomerInfo();
    const managementURL = customerInfo.managementURL;

    if (managementURL) {
      await Linking.openURL(managementURL);
    } else {
      // Fallback to platform-specific subscription settings
      if (Platform.OS === "ios") {
        await Linking.openURL("https://apps.apple.com/account/subscriptions");
      } else if (Platform.OS === "android") {
        await Linking.openURL(
          "https://play.google.com/store/account/subscriptions"
        );
      }
    }
  } catch (error) {
    console.error("Failed to open subscription management:", error);
    throw error;
  }
}

// =============================================================================
// Purchase Flow
// =============================================================================

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  userCancelled?: boolean;
}

/**
 * Purchase a package
 *
 * Initiates purchase flow for the specified package.
 */
export async function purchasePackage(
  packageIdentifier: string
): Promise<PurchaseResult> {
  try {
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      return {
        success: false,
        error: "No offerings available",
      };
    }

    // Find the package
    const pkg = offerings.current.availablePackages.find(
      (p) => p.identifier === packageIdentifier || p.product.identifier === packageIdentifier
    );

    if (!pkg) {
      return {
        success: false,
        error: `Package not found: ${packageIdentifier}`,
      };
    }

    // Make the purchase
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Check if purchase was successful
    const isPremium = !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];

    return {
      success: isPremium,
      customerInfo,
    };
  } catch (error: any) {
    // Handle user cancellation
    if (error.userCancelled || error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return {
        success: false,
        userCancelled: true,
      };
    }

    console.error("Purchase failed:", error);
    return {
      success: false,
      error: error.message || "Purchase failed",
    };
  }
}

/**
 * Purchase by product identifier
 *
 * Purchase using the product ID directly (monthly, yearly, lifetime).
 */
export async function purchaseProduct(
  productIdentifier: "monthly" | "yearly" | "lifetime"
): Promise<PurchaseResult> {
  try {
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      return {
        success: false,
        error: "No offerings available",
      };
    }

    // Find the package by product identifier
    const pkg = offerings.current.availablePackages.find(
      (p) =>
        p.product.identifier === productIdentifier ||
        p.identifier.toLowerCase().includes(productIdentifier)
    );

    if (!pkg) {
      return {
        success: false,
        error: `Product not found: ${productIdentifier}`,
      };
    }

    // Make the purchase
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    const isPremium = !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];

    return {
      success: isPremium,
      customerInfo,
    };
  } catch (error: any) {
    if (error.userCancelled || error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return {
        success: false,
        userCancelled: true,
      };
    }

    console.error("Purchase failed:", error);
    return {
      success: false,
      error: error.message || "Purchase failed",
    };
  }
}

// =============================================================================
// Restore Purchases
// =============================================================================

export interface RestoreResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  hasPremium: boolean;
  error?: string;
}

/**
 * Restore purchases
 *
 * Restores previously purchased subscriptions for reinstalls or device switches.
 */
export async function restorePurchases(): Promise<RestoreResult> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const hasPremium = !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];

    console.log("Purchases restored. Has premium:", hasPremium);

    return {
      success: true,
      customerInfo,
      hasPremium,
    };
  } catch (error: any) {
    console.error("Restore purchases failed:", error);
    return {
      success: false,
      hasPremium: false,
      error: error.message || "Failed to restore purchases",
    };
  }
}

// =============================================================================
// Subscription Management
// =============================================================================

/**
 * Get URL to manage subscription in App Store
 *
 * Returns the URL to open App Store subscription management.
 */
export async function getManagementURL(): Promise<string | null> {
  try {
    const customerInfo = await getCustomerInfo();
    return customerInfo.managementURL || null;
  } catch (error) {
    console.error("Failed to get management URL:", error);
    return null;
  }
}

// =============================================================================
// Listener Setup
// =============================================================================

/**
 * Add customer info update listener
 *
 * Subscribes to CustomerInfo updates for real-time sync.
 * Returns unsubscribe function.
 */
export function addCustomerInfoListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  return Purchases.addCustomerInfoUpdateListener(callback);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format subscription renewal date
 */
export function formatRenewalDate(date: Date | null): string {
  if (!date) return "Lifetime access";
  return `Renews ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

/**
 * Format subscription type for display
 */
export function formatSubscriptionType(
  type: "monthly" | "yearly" | "lifetime" | null
): string {
  switch (type) {
    case "monthly":
      return "Digero Pro Monthly";
    case "yearly":
      return "Digero Pro Yearly";
    case "lifetime":
      return "Digero Pro Lifetime";
    default:
      return "Free";
  }
}

/**
 * Get days remaining until subscription expires
 */
export function getDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null;
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Subscription Context
 *
 * Provides subscription state to components via React context.
 * Handles RevenueCat SDK initialization, CustomerInfo sync,
 * and automatic restore on app launch.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import { CustomerInfo } from "@revenuecat/purchases-expo";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  configureRevenueCat,
  getCustomerInfo,
  parseSubscriptionInfo,
  addCustomerInfoListener,
  restorePurchases,
  getOfferings,
  purchasePackage,
  SubscriptionInfo,
  OfferingsResult,
  PurchaseResult,
  RestoreResult,
  logoutUser,
} from "@/lib/revenuecat";

// =============================================================================
// Types
// =============================================================================

interface SubscriptionContextType {
  /** Whether the user has premium access */
  isPremium: boolean;
  /** Whether the user is in a trial period */
  isTrialPeriod: boolean;
  /** The type of subscription (monthly, annual, lifetime) */
  subscriptionType: "monthly" | "annual" | "lifetime" | null;
  /** When the subscription expires (null for lifetime) */
  expiresAt: Date | null;
  /** Whether there's a billing issue */
  hasBillingIssue: boolean;
  /** Raw CustomerInfo from RevenueCat */
  customerInfo: CustomerInfo | null;
  /** Whether the SDK is initialized */
  isInitialized: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Refresh subscription status */
  refresh: () => Promise<void>;
  /** Get available offerings */
  getOfferings: () => Promise<OfferingsResult>;
  /** Purchase a package */
  purchase: (packageId: string) => Promise<PurchaseResult>;
  /** Restore purchases */
  restore: () => Promise<RestoreResult>;
}

const defaultContext: SubscriptionContextType = {
  isPremium: false,
  isTrialPeriod: false,
  subscriptionType: null,
  expiresAt: null,
  hasBillingIssue: false,
  customerInfo: null,
  isInitialized: false,
  isLoading: true,
  refresh: async () => {},
  getOfferings: async () => ({ current: null }),
  purchase: async () => ({ success: false, hasPremium: false }),
  restore: async () => ({ success: false, hasPremium: false }),
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContext);

// =============================================================================
// Provider
// =============================================================================

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { userId, isLoaded, isSignedIn } = useAuth();

  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isPremium: false,
    subscriptionType: null,
    expiresAt: null,
    isTrialPeriod: false,
    hasBillingIssue: false,
  });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convex mutation to sync subscription status
  const syncToConvex = useMutation(api.subscriptions.syncSubscriptionFromClient);
  const lastSyncedTierRef = useRef<string | null>(null);
  const syncToConvexRef = useRef(syncToConvex);
  syncToConvexRef.current = syncToConvex;

  /**
   * Sync RevenueCat subscription info to Convex database
   * This ensures the backend knows the user's tier for rate limiting, etc.
   * Uses ref to avoid triggering useEffect re-runs when mutation reference changes.
   */
  const syncSubscriptionToConvex = useCallback(
    async (info: SubscriptionInfo) => {
      const tier = info.isTrialPeriod ? "trial" : (info.tier ?? (info.isPremium ? "plus" : "free"));

      // Skip if we already synced this tier
      if (lastSyncedTierRef.current === tier) return;

      try {
        // Map subscriptionType to the format Convex expects
        let convexSubType: "monthly" | "annual" | "lifetime" | undefined;
        if (info.subscriptionType) {
          if (info.subscriptionType.includes("monthly")) convexSubType = "monthly";
          else if (info.subscriptionType.includes("annual") || info.subscriptionType === "yearly") convexSubType = "annual";
          else if (info.subscriptionType === "lifetime") convexSubType = "lifetime";
        }

        await syncToConvexRef.current({
          tier: tier as "free" | "plus" | "creator" | "trial",
          subscriptionType: convexSubType,
          expiresAt: info.expiresAt ? info.expiresAt.getTime() : undefined,
          isTrialPeriod: info.isTrialPeriod || undefined,
          hasBillingIssue: info.hasBillingIssue || undefined,
        });

        lastSyncedTierRef.current = tier;
        console.log(`Synced subscription to Convex: ${tier}`);
      } catch (error) {
        console.error("Failed to sync subscription to Convex:", error);
      }
    },
    []
  );

  /**
   * Initialize RevenueCat SDK and set up listener
   */
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      try {
        setIsLoading(true);

        // Configure SDK with Clerk user ID
        await configureRevenueCat(userId);

        // Get initial customer info
        const info = await getCustomerInfo();
        setCustomerInfo(info);
        const parsedInfo = parseSubscriptionInfo(info);
        setSubscriptionInfo(parsedInfo);
        setIsInitialized(true);

        // Sync to Convex on init
        await syncSubscriptionToConvex(parsedInfo);

        // Set up listener for real-time updates
        unsubscribe = addCustomerInfoListener((updatedInfo) => {
          setCustomerInfo(updatedInfo);
          const updatedParsed = parseSubscriptionInfo(updatedInfo);
          setSubscriptionInfo(updatedParsed);
          // Sync any changes to Convex
          syncSubscriptionToConvex(updatedParsed);
        });

        // Attempt auto-restore for free users
        const subInfo = parseSubscriptionInfo(info);
        if (!subInfo.isPremium) {
          const result = await restorePurchases();
          if (result.hasPremium && result.customerInfo) {
            setCustomerInfo(result.customerInfo);
            const restoredInfo = parseSubscriptionInfo(result.customerInfo);
            setSubscriptionInfo(restoredInfo);
            // Sync restored subscription to Convex
            await syncSubscriptionToConvex(restoredInfo);
          }
        }
      } catch (error) {
        console.error("Failed to initialize RevenueCat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLoaded, isSignedIn, userId]);

  /**
   * Handle sign out - log out from RevenueCat
   */
  useEffect(() => {
    if (isLoaded && !isSignedIn && isInitialized) {
      logoutUser().catch(console.error);
      setCustomerInfo(null);
      setSubscriptionInfo({
        isPremium: false,
        subscriptionType: null,
        expiresAt: null,
        isTrialPeriod: false,
        hasBillingIssue: false,
      });
      setIsInitialized(false);
    }
  }, [isLoaded, isSignedIn, isInitialized]);

  /**
   * Refresh subscription status and sync to Convex
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      const parsedInfo = parseSubscriptionInfo(info);
      setSubscriptionInfo(parsedInfo);
      // Force sync on manual refresh
      lastSyncedTierRef.current = null;
      await syncSubscriptionToConvex(parsedInfo);
    } catch (error) {
      console.error("Failed to refresh subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [syncSubscriptionToConvex]);

  /**
   * Get offerings wrapper
   */
  const getOfferingsHandler = useCallback(async (): Promise<OfferingsResult> => {
    return getOfferings();
  }, []);

  /**
   * Purchase wrapper with automatic state update and Convex sync
   */
  const purchase = useCallback(
    async (packageId: string): Promise<PurchaseResult> => {
      const result = await purchasePackage(packageId);
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const parsedInfo = parseSubscriptionInfo(result.customerInfo);
        setSubscriptionInfo(parsedInfo);
        // Sync purchase to Convex immediately
        await syncSubscriptionToConvex(parsedInfo);
      }
      return result;
    },
    [syncSubscriptionToConvex]
  );

  /**
   * Restore wrapper with automatic state update and Convex sync
   */
  const restore = useCallback(async (): Promise<RestoreResult> => {
    const result = await restorePurchases();
    if (result.success && result.customerInfo) {
      setCustomerInfo(result.customerInfo);
      const parsedInfo = parseSubscriptionInfo(result.customerInfo);
      setSubscriptionInfo(parsedInfo);
      // Sync restored subscription to Convex
      await syncSubscriptionToConvex(parsedInfo);
    }
    return result;
  }, [syncSubscriptionToConvex]);

  const value: SubscriptionContextType = {
    isPremium: subscriptionInfo.isPremium,
    isTrialPeriod: subscriptionInfo.isTrialPeriod,
    subscriptionType: subscriptionInfo.subscriptionType,
    expiresAt: subscriptionInfo.expiresAt,
    hasBillingIssue: subscriptionInfo.hasBillingIssue,
    customerInfo,
    isInitialized,
    isLoading,
    refresh,
    getOfferings: getOfferingsHandler,
    purchase,
    restore,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access subscription state
 */
export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}

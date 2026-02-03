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
  ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import { CustomerInfo } from "@revenuecat/purchases-expo";
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
        setSubscriptionInfo(parseSubscriptionInfo(info));
        setIsInitialized(true);

        // Set up listener for real-time updates
        unsubscribe = addCustomerInfoListener((updatedInfo) => {
          setCustomerInfo(updatedInfo);
          setSubscriptionInfo(parseSubscriptionInfo(updatedInfo));
        });

        // Attempt auto-restore for free users
        const subInfo = parseSubscriptionInfo(info);
        if (!subInfo.isPremium) {
          const result = await restorePurchases();
          if (result.hasPremium && result.customerInfo) {
            setCustomerInfo(result.customerInfo);
            setSubscriptionInfo(parseSubscriptionInfo(result.customerInfo));
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
   * Refresh subscription status
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      setSubscriptionInfo(parseSubscriptionInfo(info));
    } catch (error) {
      console.error("Failed to refresh subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get offerings wrapper
   */
  const getOfferingsHandler = useCallback(async (): Promise<OfferingsResult> => {
    return getOfferings();
  }, []);

  /**
   * Purchase wrapper with automatic state update
   */
  const purchase = useCallback(
    async (packageId: string): Promise<PurchaseResult> => {
      const result = await purchasePackage(packageId);
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        setSubscriptionInfo(parseSubscriptionInfo(result.customerInfo));
      }
      return result;
    },
    []
  );

  /**
   * Restore wrapper with automatic state update
   */
  const restore = useCallback(async (): Promise<RestoreResult> => {
    const result = await restorePurchases();
    if (result.success && result.customerInfo) {
      setCustomerInfo(result.customerInfo);
      setSubscriptionInfo(parseSubscriptionInfo(result.customerInfo));
    }
    return result;
  }, []);

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

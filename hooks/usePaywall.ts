/**
 * usePaywall Hook
 *
 * Provides paywall modal state management and trigger handling.
 * Can be used to show the paywall when limits are exceeded.
 */

import { useState, useCallback } from "react";
import { PaywallTrigger } from "@/components/subscription/PaywallModal";

interface LimitContext {
  trigger: PaywallTrigger;
  currentCount?: number;
  limit?: number;
  resetsInDays?: number;
}

interface UsePaywallReturn {
  /** Whether the paywall is visible */
  isVisible: boolean;
  /** The trigger that caused the paywall */
  trigger?: PaywallTrigger;
  /** Current count for the limit */
  currentCount?: number;
  /** The limit value */
  limit?: number;
  /** Days until limit resets (for scans) */
  resetsInDays?: number;
  /** Show the paywall with context */
  show: (context: LimitContext) => void;
  /** Show paywall for recipe limit */
  showRecipeLimit: (currentCount: number, limit: number) => void;
  /** Show paywall for scan limit */
  showScanLimit: (currentCount: number, limit: number, resetsInDays?: number) => void;
  /** Hide the paywall */
  hide: () => void;
  /** Reset state (useful after successful purchase) */
  reset: () => void;
}

/**
 * Hook for managing paywall modal state
 */
export function usePaywall(): UsePaywallReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [context, setContext] = useState<LimitContext | null>(null);

  const show = useCallback((limitContext: LimitContext) => {
    setContext(limitContext);
    setIsVisible(true);
  }, []);

  const showRecipeLimit = useCallback((currentCount: number, limit: number) => {
    show({
      trigger: "RECIPE_LIMIT_EXCEEDED",
      currentCount,
      limit,
    });
  }, [show]);

  const showScanLimit = useCallback(
    (currentCount: number, limit: number, resetsInDays?: number) => {
      show({
        trigger: "SCAN_LIMIT_EXCEEDED",
        currentCount,
        limit,
        resetsInDays,
      });
    },
    [show]
  );

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const reset = useCallback(() => {
    setIsVisible(false);
    setContext(null);
  }, []);

  return {
    isVisible,
    trigger: context?.trigger,
    currentCount: context?.currentCount,
    limit: context?.limit,
    resetsInDays: context?.resetsInDays,
    show,
    showRecipeLimit,
    showScanLimit,
    hide,
    reset,
  };
}

/**
 * Check if an error response indicates a limit was exceeded
 */
export function isLimitExceededError(
  error: unknown
): error is { code: "RECIPE_LIMIT_EXCEEDED" | "SCAN_LIMIT_EXCEEDED"; currentCount: number; limit: number; resetsInDays?: number } {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  ) {
    const code = (error as any).code;
    return code === "RECIPE_LIMIT_EXCEEDED" || code === "SCAN_LIMIT_EXCEEDED";
  }
  return false;
}

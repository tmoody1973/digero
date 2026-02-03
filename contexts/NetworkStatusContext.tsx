/**
 * Network Status Context
 *
 * Provides network connectivity status to components.
 * Triggers offline sync queue processing when connection is restored.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import {
  processQueue,
  getPendingCount,
} from "@/lib/offlineSyncQueue";

interface NetworkStatusContextType {
  isOnline: boolean;
  isOffline: boolean;
  pendingMutationsCount: number;
  refreshPendingCount: () => Promise<void>;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  isOffline: false,
  pendingMutationsCount: 0,
  refreshPendingCount: async () => {},
});

interface NetworkStatusProviderProps {
  children: ReactNode;
  onProcessMutation?: (type: string, payload: unknown) => Promise<void>;
}

export function NetworkStatusProvider({
  children,
  onProcessMutation,
}: NetworkStatusProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingMutationsCount, setPendingMutationsCount] = useState(0);

  // Refresh pending mutations count
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingMutationsCount(count);
  }, []);

  // Process queued mutations when coming back online
  const handleOnline = useCallback(async () => {
    if (onProcessMutation) {
      try {
        const result = await processQueue(onProcessMutation);
        console.log(
          `Processed ${result.success} mutations, ${result.failed} failed`
        );
        await refreshPendingCount();
      } catch (error) {
        console.error("Failed to process offline queue:", error);
      }
    }
  }, [onProcessMutation, refreshPendingCount]);

  // Subscribe to network status changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !isOnline;
      const nowOnline = state.isConnected ?? false;

      setIsOnline(nowOnline);

      // Process queue when coming back online
      if (wasOffline && nowOnline) {
        handleOnline();
      }
    });

    // Initial status check
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? true);
    });

    // Initial pending count
    refreshPendingCount();

    return () => {
      unsubscribe();
    };
  }, [handleOnline, isOnline, refreshPendingCount]);

  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        isOffline: !isOnline,
        pendingMutationsCount,
        refreshPendingCount,
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
}

/**
 * Hook to access network status
 */
export function useNetworkStatus(): NetworkStatusContextType {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error(
      "useNetworkStatus must be used within a NetworkStatusProvider"
    );
  }
  return context;
}

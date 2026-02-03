/**
 * SyncStatusIndicator Component
 *
 * Shows the current sync status for offline support.
 * Displays synced (green), pending (orange), or offline (gray).
 */

import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SyncStatus } from "@/types/shopping-list";

interface SyncStatusIndicatorProps {
  status: SyncStatus;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string; bgColor: string }
> = {
  synced: {
    icon: "checkmark-circle",
    color: "#22c55e",
    label: "Synced",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  pending: {
    icon: "sync",
    color: "#f97316",
    label: "Syncing...",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  offline: {
    icon: "cloud-offline",
    color: "#a8a29e",
    label: "Offline",
    bgColor: "bg-stone-100 dark:bg-stone-700",
  },
};

export function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View
      className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${config.bgColor}`}
    >
      <Ionicons name={config.icon} size={12} color={config.color} />
      <Text
        className="text-xs font-medium"
        style={{ color: config.color }}
      >
        {config.label}
      </Text>
    </View>
  );
}

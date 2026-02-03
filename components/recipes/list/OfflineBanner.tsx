/**
 * OfflineBanner Component
 *
 * Displays a banner when the device is offline.
 */

import { View, Text, Pressable } from "react-native";
import { WifiOff, X } from "lucide-react-native";
import { useState } from "react";

interface OfflineBannerProps {
  dismissable?: boolean;
}

export function OfflineBanner({ dismissable = true }: OfflineBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <View className="flex-row items-center justify-between bg-amber-500 px-4 py-3">
      <View className="flex-row items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-900" />
        <Text className="text-sm font-medium text-amber-900">
          You're offline. Showing cached data.
        </Text>
      </View>
      {dismissable && (
        <Pressable
          onPress={() => setIsDismissed(true)}
          className="rounded-full p-1 active:bg-amber-600"
        >
          <X className="h-4 w-4 text-amber-900" />
        </Pressable>
      )}
    </View>
  );
}

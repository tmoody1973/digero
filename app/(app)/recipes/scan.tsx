/**
 * Recipe Scan Screen
 *
 * Entry point for the cookbook scanning feature.
 * Opens the ScanSessionModal in full-screen mode.
 */

import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import type { Id } from "@/convex/_generated/dataModel";

import { ScanSessionModal } from "@/components/scanning";

export default function RecipeScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cookbookId?: string;
    cookbookName?: string;
  }>();

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-stone-950">
      <ScanSessionModal
        visible={true}
        onClose={handleClose}
        existingCookbookId={params.cookbookId as Id<"physicalCookbooks"> | undefined}
        existingCookbookName={params.cookbookName}
      />
    </View>
  );
}

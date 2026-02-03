/**
 * Processing Step Component
 *
 * Loading state shown while Gemini extracts recipe data.
 * Features sparkles icon, heading, and spinner.
 */

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Sparkles } from "lucide-react-native";

import type { ProcessingStepProps } from "./types";

/**
 * ProcessingStep Component
 *
 * Features:
 * - Sparkles icon with pulse effect
 * - "Extracting Recipe" heading
 * - Subtext message
 * - Loading spinner
 */
export function ProcessingStep({ message }: ProcessingStepProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Sparkles Icon */}
      <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/20">
        <Sparkles size={48} color="#f97316" />
      </View>

      {/* Heading */}
      <Text className="mb-2 text-xl font-bold text-white">
        Extracting Recipe
      </Text>

      {/* Subtext */}
      <Text className="mb-6 text-stone-400">
        {message || "AI is reading the recipe..."}
      </Text>

      {/* Loading Spinner */}
      <ActivityIndicator size="large" color="#f97316" />
    </View>
  );
}

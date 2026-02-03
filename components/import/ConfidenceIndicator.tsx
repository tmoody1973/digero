/**
 * Confidence Indicator Component
 *
 * Displays a visual indicator for the confidence level of extracted data.
 * Low confidence fields get a yellow highlight to draw attention.
 */

import React from "react";
import { View, Text } from "react-native";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react-native";
import type { ConfidenceIndicatorProps } from "./types";

/**
 * ConfidenceIndicator
 *
 * Shows confidence level with icon and optional label.
 * - High: Green check
 * - Medium: Gray neutral
 * - Low: Yellow warning (draws attention for review)
 */
export function ConfidenceIndicator({
  level,
  showLabel = false,
}: ConfidenceIndicatorProps) {
  const config = {
    high: {
      icon: CheckCircle,
      color: "#22c55e", // green-500
      label: "High confidence",
      bgColor: "bg-green-500/10",
    },
    medium: {
      icon: HelpCircle,
      color: "#78716c", // stone-500
      label: "Medium confidence",
      bgColor: "bg-stone-500/10",
    },
    low: {
      icon: AlertCircle,
      color: "#eab308", // yellow-500
      label: "May need review",
      bgColor: "bg-yellow-500/10",
    },
  };

  const { icon: Icon, color, label, bgColor } = config[level];

  if (!showLabel) {
    return (
      <View className={`rounded-full p-1 ${bgColor}`}>
        <Icon size={14} color={color} />
      </View>
    );
  }

  return (
    <View className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${bgColor}`}>
      <Icon size={12} color={color} />
      <Text style={{ color }} className="text-xs font-medium">
        {label}
      </Text>
    </View>
  );
}

/**
 * LowConfidenceHighlight
 *
 * Wraps content with a subtle yellow highlight when confidence is low.
 * Used to draw attention to fields that may need review.
 */
export function LowConfidenceHighlight({
  confidence,
  children,
}: {
  confidence?: string;
  children: React.ReactNode;
}) {
  if (confidence === "low") {
    return (
      <View className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-2">
        {children}
      </View>
    );
  }

  return <>{children}</>;
}

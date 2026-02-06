/**
 * EarningsChart Component
 *
 * A simple bar chart displaying daily earnings for the last 7 days.
 * Uses a custom implementation with View components and percentage-based heights.
 */

import { View, Text } from "react-native";

/**
 * Day data structure from getCreatorEarnings query
 */
interface DayData {
  /** Day label (e.g., "Mon", "Tue") */
  label: string;
  /** Amount in cents */
  amount: number;
}

/**
 * EarningsChart Props
 */
export interface EarningsChartProps {
  /** Array of 7 days of earnings data */
  data: DayData[];
  /** Height of the chart in pixels */
  height?: number;
  /** Whether to show value labels on bars */
  showLabels?: boolean;
}

/**
 * Format amount for display (cents to dollars)
 */
function formatAmount(cents: number): string {
  if (cents >= 10000) {
    return "$" + (cents / 100).toFixed(0);
  }
  if (cents >= 100) {
    return "$" + (cents / 100).toFixed(0);
  }
  return "$" + (cents / 100).toFixed(2);
}

/**
 * EarningsChart Component
 */
export function EarningsChart({
  data,
  height = 120,
  showLabels = true,
}: EarningsChartProps) {
  // Calculate max value for scaling
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <View className="w-full">
      {/* Chart Bars */}
      <View
        className="flex-row items-end justify-between"
        style={{ height }}
      >
        {data.map((day, index) => {
          const heightPercent = (day.amount / maxAmount) * 100;
          const barHeight = Math.max((heightPercent / 100) * height, 4); // Minimum 4px height

          return (
            <View
              key={`${day.label}-${index}`}
              className="flex-1 items-center mx-1"
            >
              {/* Value Label */}
              {showLabels && day.amount > 0 && (
                <Text className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                  {formatAmount(day.amount)}
                </Text>
              )}
              {/* Bar */}
              <View
                className="w-full rounded-t-md bg-orange-500"
                style={{ height: barHeight }}
              />
            </View>
          );
        })}
      </View>

      {/* Day Labels */}
      <View className="flex-row justify-between mt-2">
        {data.map((day, index) => (
          <View key={`label-${day.label}-${index}`} className="flex-1 items-center mx-1">
            <Text className="text-xs text-stone-400 dark:text-stone-500">
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * EarningsChartSkeleton
 *
 * Loading placeholder for the earnings chart.
 */
export function EarningsChartSkeleton({ height = 120 }: { height?: number }) {
  return (
    <View className="w-full">
      <View
        className="flex-row items-end justify-between"
        style={{ height }}
      >
        {[...Array(7)].map((_, index) => (
          <View key={index} className="flex-1 items-center mx-1">
            <View
              className="w-full rounded-t-md bg-stone-200 dark:bg-stone-700 animate-pulse"
              style={{ height: 20 + Math.random() * 60 }}
            />
          </View>
        ))}
      </View>
      <View className="flex-row justify-between mt-2">
        {[...Array(7)].map((_, index) => (
          <View key={index} className="flex-1 items-center mx-1">
            <View className="w-6 h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * EarningsChartEmpty
 *
 * Empty state when there's no earnings data.
 */
export function EarningsChartEmpty({ height = 120 }: { height?: number }) {
  return (
    <View className="w-full items-center justify-center" style={{ height: height + 30 }}>
      <Text className="text-stone-400 dark:text-stone-500 text-sm text-center">
        No earnings data for this period.
      </Text>
      <Text className="text-stone-400 dark:text-stone-500 text-xs text-center mt-1">
        Earnings will appear here once users engage with your content.
      </Text>
    </View>
  );
}

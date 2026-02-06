/**
 * MetricCard Component
 *
 * Displays a single metric with title, value, subtitle, icon, and optional trend indicator.
 * Used in the creator dashboard overview to display key metrics.
 */

import { View, Text } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";

/**
 * MetricCard Props
 */
export interface MetricCardProps {
  /** Title displayed at the top of the card */
  title: string;
  /** Main value to display (formatted as string) */
  value: string;
  /** Optional subtitle displayed below the value */
  subtitle?: string;
  /** Lucide icon component to display */
  icon: React.ComponentType<{ size: number; color: string }>;
  /** Optional trend percentage change (positive or negative) */
  trend?: number;
  /** Icon color override (defaults to stone-400) */
  iconColor?: string;
}

/**
 * Format number for display
 */
export function formatMetricValue(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Format currency for display (cents to dollars)
 */
export function formatCurrency(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

/**
 * MetricCard Component
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = "#a8a29e", // stone-400
}: MetricCardProps) {
  const hasTrend = trend !== undefined && trend !== 0;
  const isPositiveTrend = trend !== undefined && trend > 0;

  return (
    <View className="flex-1 bg-white dark:bg-stone-900 rounded-xl p-4 shadow-sm">
      {/* Icon */}
      <Icon size={20} color={iconColor} />

      {/* Value */}
      <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
        {value}
      </Text>

      {/* Title */}
      <Text className="text-stone-500 dark:text-stone-400 text-xs">
        {title}
      </Text>

      {/* Subtitle (if provided) */}
      {subtitle && (
        <Text className="text-stone-400 dark:text-stone-500 text-xs mt-0.5">
          {subtitle}
        </Text>
      )}

      {/* Trend Indicator */}
      {hasTrend && (
        <View className="flex-row items-center mt-1">
          {isPositiveTrend ? (
            <TrendingUp size={12} color="#22c55e" />
          ) : (
            <TrendingDown size={12} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-1 ${
              isPositiveTrend ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositiveTrend ? "+" : ""}
            {trend.toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * LargeMetricCard Variant
 *
 * A larger version of the metric card for primary metrics like total earnings.
 */
export interface LargeMetricCardProps {
  /** Title displayed at the top */
  title: string;
  /** Main value to display */
  value: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional trend percentage */
  trend?: number;
  /** Content to render on the right side */
  rightContent?: React.ReactNode;
}

export function LargeMetricCard({
  title,
  value,
  subtitle,
  trend,
  rightContent,
}: LargeMetricCardProps) {
  const hasTrend = trend !== undefined && trend !== 0;
  const isPositiveTrend = trend !== undefined && trend > 0;

  return (
    <View className="bg-white dark:bg-stone-900 rounded-xl p-6 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          {/* Title */}
          <Text className="text-stone-500 dark:text-stone-400 text-sm">
            {title}
          </Text>

          {/* Value */}
          <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {value}
          </Text>

          {/* Subtitle with trend */}
          {(subtitle || hasTrend) && (
            <View className="flex-row items-center mt-2">
              {hasTrend && (
                <>
                  {isPositiveTrend ? (
                    <TrendingUp size={16} color="#22c55e" />
                  ) : (
                    <TrendingDown size={16} color="#ef4444" />
                  )}
                  <Text
                    className={`text-sm ml-1 ${
                      isPositiveTrend ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositiveTrend ? "+" : ""}
                    {trend.toFixed(1)}%
                  </Text>
                </>
              )}
              {subtitle && (
                <Text className="text-stone-500 dark:text-stone-400 text-sm ml-1">
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right content (e.g., action button) */}
        {rightContent}
      </View>
    </View>
  );
}

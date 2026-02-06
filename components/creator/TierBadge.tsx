/**
 * TierBadge Component
 *
 * Displays the creator's tier badge with appropriate styling.
 * Used in the creator dashboard header and profile sections.
 */

import { View, Text } from "react-native";
import { Award, Star, Crown } from "lucide-react-native";

/**
 * Creator tier type
 */
export type CreatorTier = "emerging" | "established" | "partner";

/**
 * TierBadge Props
 */
export interface TierBadgeProps {
  /** The creator's tier */
  tier: CreatorTier;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the icon */
  showIcon?: boolean;
}

/**
 * Tier configuration
 */
const TIER_CONFIG: Record<
  CreatorTier,
  {
    label: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
    Icon: React.ComponentType<{ size: number; color: string }>;
  }
> = {
  emerging: {
    label: "Emerging",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    textColor: "text-teal-700 dark:text-teal-300",
    iconColor: "#0d9488", // teal-600
    Icon: Star,
  },
  established: {
    label: "Established",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    textColor: "text-violet-700 dark:text-violet-300",
    iconColor: "#7c3aed", // violet-600
    Icon: Award,
  },
  partner: {
    label: "Partner",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-300",
    iconColor: "#d97706", // amber-600
    Icon: Crown,
  },
};

/**
 * Size configuration
 */
const SIZE_CONFIG = {
  sm: {
    padding: "px-2 py-0.5",
    text: "text-xs",
    iconSize: 12,
  },
  md: {
    padding: "px-3 py-1",
    text: "text-sm",
    iconSize: 14,
  },
  lg: {
    padding: "px-4 py-1.5",
    text: "text-base",
    iconSize: 16,
  },
};

/**
 * TierBadge Component
 */
export function TierBadge({
  tier,
  size = "md",
  showIcon = true,
}: TierBadgeProps) {
  const tierConfig = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const { Icon } = tierConfig;

  return (
    <View
      className={`flex-row items-center rounded-full ${tierConfig.bgColor} ${sizeConfig.padding}`}
    >
      {showIcon && (
        <Icon
          size={sizeConfig.iconSize}
          color={tierConfig.iconColor}
        />
      )}
      <Text
        className={`${tierConfig.textColor} font-medium ${sizeConfig.text} ${
          showIcon ? "ml-1" : ""
        }`}
      >
        {tierConfig.label}
      </Text>
    </View>
  );
}

/**
 * Tier badge for dark backgrounds (e.g., header)
 */
export function TierBadgeLight({ tier, size = "md" }: Omit<TierBadgeProps, "showIcon">) {
  const config = {
    emerging: { label: "Emerging Creator", bg: "bg-white/20" },
    established: { label: "Established Creator", bg: "bg-yellow-400" },
    partner: { label: "Partner Creator", bg: "bg-purple-500" },
  };

  const sizeConfig = SIZE_CONFIG[size];
  const { label, bg } = config[tier];

  return (
    <View className={`${bg} ${sizeConfig.padding} rounded-full`}>
      <Text className={`text-white ${sizeConfig.text} font-medium`}>
        {label}
      </Text>
    </View>
  );
}

/**
 * RES Multiplier Badge
 */
export interface RESMultiplierBadgeProps {
  /** The RES multiplier value */
  multiplier: number;
  /** Size variant */
  size?: "sm" | "md";
}

export function RESMultiplierBadge({ multiplier, size = "md" }: RESMultiplierBadgeProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <View className={`bg-orange-100 dark:bg-orange-900/30 ${sizeConfig.padding} rounded-full`}>
      <Text className={`text-orange-600 dark:text-orange-400 font-medium ${sizeConfig.text}`}>
        {multiplier}x RES
      </Text>
    </View>
  );
}

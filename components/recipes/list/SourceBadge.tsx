/**
 * SourceBadge Component
 *
 * Displays a color-coded badge indicating the recipe source.
 * Supports full (icon + label) and compact (icon only) variants.
 */

import { View, Text } from "react-native";
import { Youtube, Globe, Camera, PenLine, LucideIcon } from "lucide-react-native";

type RecipeSource = "youtube" | "website" | "scanned" | "manual";

interface SourceBadgeProps {
  source: RecipeSource;
  compact?: boolean;
}

interface SourceConfig {
  icon: LucideIcon;
  label: string;
  bgColor: string;
  textColor: string;
}

const sourceConfig: Record<RecipeSource, SourceConfig> = {
  youtube: {
    icon: Youtube,
    label: "YouTube",
    bgColor: "bg-red-500",
    textColor: "text-white",
  },
  website: {
    icon: Globe,
    label: "Website",
    bgColor: "bg-blue-500",
    textColor: "text-white",
  },
  scanned: {
    icon: Camera,
    label: "Scanned",
    bgColor: "bg-amber-500",
    textColor: "text-white",
  },
  manual: {
    icon: PenLine,
    label: "Manual",
    bgColor: "bg-green-500",
    textColor: "text-white",
  },
};

export function SourceBadge({ source, compact = false }: SourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  if (compact) {
    return (
      <View
        className={`h-5 w-5 items-center justify-center rounded-full ${config.bgColor}`}
      >
        <Icon className={`h-3 w-3 ${config.textColor}`} />
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${config.bgColor}`}
    >
      <Icon className={`h-3.5 w-3.5 ${config.textColor}`} />
      <Text className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </Text>
    </View>
  );
}

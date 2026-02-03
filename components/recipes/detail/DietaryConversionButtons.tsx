/**
 * DietaryConversionButtons Component
 *
 * Buttons to convert recipe to vegan, vegetarian, or gluten-free.
 * UI only - triggers callbacks for actual conversion.
 */

import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Leaf, WheatOff } from "lucide-react-native";
import { useColorScheme } from "nativewind";

type DietType = "vegan" | "vegetarian" | "gluten-free";

interface DietaryConversionButtonsProps {
  onConvert: (dietType: DietType) => void;
  isConverting?: boolean;
  convertingType?: DietType | null;
}

export function DietaryConversionButtons({
  onConvert,
  isConverting = false,
  convertingType = null,
}: DietaryConversionButtonsProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const buttons: {
    type: DietType;
    label: string;
    icon: typeof Leaf;
    colors: { border: string; bg: string; activeBg: string; text: string; iconColor: string };
  }[] = [
    {
      type: "vegan",
      label: "Vegan",
      icon: Leaf,
      colors: {
        border: "border-green-200 dark:border-green-800",
        bg: "bg-green-50 dark:bg-green-900/30",
        activeBg: "active:bg-green-100 dark:active:bg-green-900/50",
        text: "text-green-700 dark:text-green-400",
        iconColor: isDark ? "#4ade80" : "#15803d",
      },
    },
    {
      type: "vegetarian",
      label: "Vegetarian",
      icon: Leaf,
      colors: {
        border: "border-emerald-200 dark:border-emerald-800",
        bg: "bg-emerald-50 dark:bg-emerald-900/30",
        activeBg: "active:bg-emerald-100 dark:active:bg-emerald-900/50",
        text: "text-emerald-700 dark:text-emerald-400",
        iconColor: isDark ? "#34d399" : "#047857",
      },
    },
    {
      type: "gluten-free",
      label: "Gluten-Free",
      icon: WheatOff,
      colors: {
        border: "border-amber-200 dark:border-amber-800",
        bg: "bg-amber-50 dark:bg-amber-900/30",
        activeBg: "active:bg-amber-100 dark:active:bg-amber-900/50",
        text: "text-amber-700 dark:text-amber-400",
        iconColor: isDark ? "#fbbf24" : "#b45309",
      },
    },
  ];

  return (
    <View className="mt-6">
      <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
        Dietary Conversions
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {buttons.map((button) => {
          const Icon = button.icon;
          const isThisConverting = isConverting && convertingType === button.type;

          return (
            <Pressable
              key={button.type}
              onPress={() => onConvert(button.type)}
              disabled={isConverting}
              className={`flex-row items-center gap-2 rounded-xl border px-4 py-3 ${button.colors.border} ${button.colors.bg} ${button.colors.activeBg} ${isConverting ? "opacity-50" : ""}`}
            >
              {isThisConverting ? (
                <ActivityIndicator size="small" color={button.colors.iconColor} />
              ) : (
                <Icon size={20} color={button.colors.iconColor} />
              )}
              <Text className={`font-medium ${button.colors.text}`}>
                {isThisConverting ? "Converting..." : button.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

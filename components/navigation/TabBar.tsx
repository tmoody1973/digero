/**
 * Bottom Tab Navigation Bar
 *
 * Custom tab bar for main app navigation.
 * Displays tabs for: Recipes, Discover, Cookbooks, Meal Plan, Settings
 */

import { View, Pressable, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  UtensilsCrossed,
  Compass,
  BookOpen,
  CalendarDays,
  Settings,
} from "lucide-react-native";

interface TabItem {
  name: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  path: string;
}

const tabs: TabItem[] = [
  {
    name: "recipes",
    label: "Recipes",
    icon: UtensilsCrossed,
    path: "/(app)",
  },
  {
    name: "discover",
    label: "Discover",
    icon: Compass,
    path: "/(app)/discover",
  },
  {
    name: "cookbooks",
    label: "Cookbooks",
    icon: BookOpen,
    path: "/(app)/cookbooks",
  },
  {
    name: "meal-planner",
    label: "Meal Plan",
    icon: CalendarDays,
    path: "/(app)/meal-planner",
  },
  {
    name: "settings",
    label: "Settings",
    icon: Settings,
    path: "/(app)/settings",
  },
];

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: TabItem) => {
    if (tab.name === "recipes") {
      // Active when on home or recipe detail pages
      return pathname === "/" || pathname.startsWith("/recipes");
    }
    if (tab.name === "settings") {
      return pathname === "/settings";
    }
    if (tab.name === "meal-planner") {
      return pathname.startsWith("/meal-planner");
    }
    return pathname.startsWith(`/${tab.name}`);
  };

  return (
    <View className="flex-row bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 pb-6 pt-2">
      {tabs.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.path as any)}
            className="flex-1 items-center py-2"
          >
            <Icon
              size={24}
              color={active ? "#f97316" : "#78716c"}
            />
            <Text
              className={`text-xs mt-1 ${
                active
                  ? "text-orange-500 font-medium"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

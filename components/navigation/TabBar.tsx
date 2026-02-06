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
  ShoppingCart,
} from "lucide-react-native";

interface TabItem {
  name: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  path: string;
}

const tabs: TabItem[] = [
  {
    name: "discover",
    label: "Discover",
    icon: Compass,
    path: "/(app)/discover",
  },
  {
    name: "recipes",
    label: "Recipes",
    icon: UtensilsCrossed,
    path: "/(app)/recipes-home",
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
    name: "shopping",
    label: "Shopping",
    icon: ShoppingCart,
    path: "/(app)/shopping",
  },
];

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: TabItem) => {
    if (tab.name === "discover") {
      // Active when on discover or root (which redirects to discover)
      return pathname === "/" || pathname.startsWith("/discover");
    }
    if (tab.name === "recipes") {
      // Active when on recipes-home or recipe detail pages
      return pathname === "/recipes-home" || pathname.startsWith("/recipes");
    }
    if (tab.name === "meal-planner") {
      return pathname.startsWith("/meal-planner");
    }
    if (tab.name === "shopping") {
      return pathname.startsWith("/shopping");
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

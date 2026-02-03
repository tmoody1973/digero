/**
 * FilterPills Component
 *
 * Horizontal scrollable filter pills for recipe source types.
 * Active pill uses orange accent color.
 */

import { ScrollView, Pressable, Text } from "react-native";
import { Youtube, Globe, Camera, PenLine, LucideIcon } from "lucide-react-native";

type SourceFilter = "all" | "youtube" | "website" | "scanned" | "manual";

interface FilterPillsProps {
  activeFilter: SourceFilter;
  onFilterChange: (filter: SourceFilter) => void;
}

interface FilterOption {
  value: SourceFilter;
  label: string;
  icon: LucideIcon | null;
  iconColor: string;
}

const filterOptions: FilterOption[] = [
  { value: "all", label: "All", icon: null, iconColor: "" },
  { value: "youtube", label: "YouTube", icon: Youtube, iconColor: "text-red-500" },
  { value: "website", label: "Website", icon: Globe, iconColor: "text-blue-500" },
  { value: "scanned", label: "Scanned", icon: Camera, iconColor: "text-amber-500" },
  { value: "manual", label: "Manual", icon: PenLine, iconColor: "text-green-500" },
];

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.value;
        const Icon = option.icon;

        return (
          <Pressable
            key={option.value}
            onPress={() => onFilterChange(option.value)}
            className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
              isActive
                ? "bg-orange-500"
                : "bg-stone-100 dark:bg-stone-800"
            }`}
          >
            {Icon && (
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-white" : option.iconColor
                }`}
              />
            )}
            <Text
              className={`text-sm font-medium ${
                isActive
                  ? "text-white"
                  : "text-stone-600 dark:text-stone-300"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * CategorySection Component
 *
 * Displays a group of shopping items under a category header.
 * Shows category icon, name, and progress count.
 */

import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShoppingItemRow } from "./ShoppingItemRow";
import type { ShoppingItem, ItemCategory } from "@/types/shopping-list";
import { Id } from "@/convex/_generated/dataModel";

interface CategorySectionProps {
  category: ItemCategory;
  items: ShoppingItem[];
  isReadOnly?: boolean;
  onToggleItem?: (itemId: Id<"shoppingItems">) => void;
  onEditItem?: (itemId: Id<"shoppingItems">, quantity: number, unit: string) => void;
  onDeleteItem?: (itemId: Id<"shoppingItems">) => void;
}

// Category to icon mapping
const CATEGORY_ICONS: Record<ItemCategory, keyof typeof Ionicons.glyphMap> = {
  Produce: "leaf-outline",
  "Meat & Seafood": "fish-outline",
  "Dairy & Eggs": "egg-outline",
  Pantry: "cube-outline",
  Bakery: "pizza-outline",
  Frozen: "snow-outline",
  Beverages: "cafe-outline",
  Household: "home-outline",
};

export function CategorySection({
  category,
  items,
  isReadOnly = false,
  onToggleItem,
  onEditItem,
  onDeleteItem,
}: CategorySectionProps) {
  if (items.length === 0) return null;

  const checkedCount = items.filter((i) => i.checked).length;
  const allChecked = checkedCount === items.length;

  const iconName = CATEGORY_ICONS[category] || "help-outline";

  return (
    <View className="mb-4">
      {/* Category Header */}
      <View className="flex-row items-center gap-2 mb-2 px-1">
        <Ionicons
          name={iconName}
          size={20}
          color={allChecked ? "#a8a29e" : "#f97316"}
        />
        <Text
          className={`font-semibold ${
            allChecked
              ? "text-stone-400 dark:text-stone-500"
              : "text-stone-900 dark:text-white"
          }`}
        >
          {category}
        </Text>
        <Text className="text-xs text-stone-400 dark:text-stone-500">
          {checkedCount}/{items.length}
        </Text>
      </View>

      {/* Items */}
      <View className="space-y-1">
        {items.map((item) => (
          <ShoppingItemRow
            key={item._id}
            item={item}
            isReadOnly={isReadOnly}
            onToggle={() => onToggleItem?.(item._id)}
            onEdit={(qty, unit) => onEditItem?.(item._id, qty, unit)}
            onDelete={() => onDeleteItem?.(item._id)}
          />
        ))}
      </View>
    </View>
  );
}

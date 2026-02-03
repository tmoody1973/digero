/**
 * DayView Component
 *
 * Displays all meal slots for a single day vertically stacked.
 * Includes breakfast, lunch, dinner, and a collapsible snacks section.
 * Supports horizontal swipe gestures for day navigation.
 */

import { View, Text, Pressable } from "react-native";
import { Sun, Clock, Moon, Trash2, CheckSquare } from "lucide-react-native";
import { MealSlotCard } from "./MealSlotCard";
import { CollapsibleSnacksSection } from "./CollapsibleSnacksSection";
import type { DayViewProps } from "@/types/meal-planner";
import type { MealSlot, PlannedMeal } from "@/types/meal-planner";
import { Id } from "@/convex/_generated/dataModel";

// Slot configuration with icons and labels
const SLOT_CONFIG: Record<
  Exclude<MealSlot, "snacks">,
  { label: string; Icon: typeof Sun }
> = {
  breakfast: { label: "Breakfast", Icon: Sun },
  lunch: { label: "Lunch", Icon: Clock },
  dinner: { label: "Dinner", Icon: Moon },
};

export function DayView({
  day,
  meals,
  isSelectionMode,
  selectedMealIds,
  snacksExpanded,
  onSlotTap,
  onMealRemove,
  onMealSelect,
  onViewRecipe,
  onMealLongPress,
  onToggleSnacks,
  onClearDay,
  onSelectAllDay,
}: DayViewProps) {
  // Format day for display (e.g., "Wednesday, Feb 5")
  const formatDayHeader = (dateString: string): string => {
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Get meal for a specific slot
  const getMealForSlot = (slot: MealSlot): PlannedMeal | null => {
    return meals.find((m) => m.slot === slot) || null;
  };

  // Check if a meal is selected
  const isMealSelected = (mealId: Id<"plannedMeals">): boolean => {
    return selectedMealIds.includes(mealId);
  };

  // Count meals for this day
  const mealCount = meals.length;

  return (
    <View className="flex-1 px-4">
      {/* Day Header */}
      <View className="flex-row items-center justify-between border-b border-stone-100 py-4 dark:border-stone-800">
        <Text className="text-lg font-semibold text-stone-900 dark:text-white">
          {formatDayHeader(day)}
        </Text>

        {/* Day Actions */}
        <View className="flex-row items-center gap-2">
          {isSelectionMode && mealCount > 0 && (
            <Pressable
              onPress={onSelectAllDay}
              className="flex-row items-center gap-1 rounded-lg px-2 py-1 active:bg-orange-50 dark:active:bg-orange-900/20"
              accessibilityLabel="Select all meals for this day"
              accessibilityRole="button"
            >
              <CheckSquare className="h-4 w-4 text-orange-500" />
              <Text className="text-xs font-medium text-orange-500">
                Select All
              </Text>
            </Pressable>
          )}

          {!isSelectionMode && mealCount > 0 && (
            <Pressable
              onPress={onClearDay}
              className="rounded-lg px-2 py-1 active:bg-red-50 dark:active:bg-red-900/20"
              accessibilityLabel="Clear all meals for this day"
              accessibilityRole="button"
            >
              <Text className="text-xs font-medium text-stone-400 dark:text-stone-500">
                Clear
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Meal Slots */}
      <View className="flex-1 py-4">
        {/* Breakfast, Lunch, Dinner */}
        {(Object.keys(SLOT_CONFIG) as Exclude<MealSlot, "snacks">[]).map(
          (slot) => {
            const { label, Icon } = SLOT_CONFIG[slot];
            const meal = getMealForSlot(slot);

            return (
              <View key={slot} className="mb-4">
                {/* Slot Label */}
                <View className="mb-2 flex-row items-center gap-2">
                  <Icon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                  <Text className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    {label}
                  </Text>
                </View>

                {/* Slot Card */}
                <MealSlotCard
                  meal={meal}
                  day={day}
                  slot={slot}
                  isSelected={meal ? isMealSelected(meal._id) : false}
                  isSelectionMode={isSelectionMode}
                  onTap={() => onSlotTap(slot)}
                  onRemove={() => meal && onMealRemove(meal._id)}
                  onToggleSelect={() => meal && onMealSelect(meal._id)}
                  onViewRecipe={() => meal && onViewRecipe(meal.recipeId)}
                  onLongPress={() => meal && onMealLongPress(meal._id)}
                />
              </View>
            );
          }
        )}

        {/* Snacks Section (Collapsible) */}
        <CollapsibleSnacksSection
          isExpanded={snacksExpanded}
          meal={getMealForSlot("snacks")}
          isSelectionMode={isSelectionMode}
          isSelected={
            getMealForSlot("snacks")
              ? isMealSelected(getMealForSlot("snacks")!._id)
              : false
          }
          onToggle={onToggleSnacks}
          onSlotTap={() => onSlotTap("snacks")}
          onMealRemove={() => {
            const snackMeal = getMealForSlot("snacks");
            if (snackMeal) onMealRemove(snackMeal._id);
          }}
          onMealSelect={() => {
            const snackMeal = getMealForSlot("snacks");
            if (snackMeal) onMealSelect(snackMeal._id);
          }}
          onViewRecipe={() => {
            const snackMeal = getMealForSlot("snacks");
            if (snackMeal) onViewRecipe(snackMeal.recipeId);
          }}
          onLongPress={() => {
            const snackMeal = getMealForSlot("snacks");
            if (snackMeal) onMealLongPress(snackMeal._id);
          }}
        />
      </View>
    </View>
  );
}

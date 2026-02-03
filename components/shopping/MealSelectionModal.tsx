/**
 * MealSelectionModal Component
 *
 * Modal for selecting specific meals to include in shopping list generation.
 * Shows calendar with checkboxes for each planned meal.
 */

import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/convex/_generated/dataModel";

interface PlannedMeal {
  _id: Id<"plannedMeals">;
  recipeName: string;
  day: string;
  slot: string;
}

interface MealSelectionModalProps {
  isVisible: boolean;
  meals: PlannedMeal[];
  selectedMealIds: Id<"plannedMeals">[];
  onToggleMeal?: (mealId: Id<"plannedMeals">) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onGenerate?: () => void;
  onClose?: () => void;
}

const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snacks"];

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export function MealSelectionModal({
  isVisible,
  meals,
  selectedMealIds,
  onToggleMeal,
  onSelectAll,
  onDeselectAll,
  onGenerate,
  onClose,
}: MealSelectionModalProps) {
  // Group meals by day
  const mealsByDay = useMemo(() => {
    const grouped: Record<string, PlannedMeal[]> = {};

    for (const meal of meals) {
      if (!grouped[meal.day]) {
        grouped[meal.day] = [];
      }
      grouped[meal.day].push(meal);
    }

    // Sort days
    const sortedDays = Object.keys(grouped).sort();

    // Sort meals within each day by slot
    for (const day of sortedDays) {
      grouped[day].sort(
        (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
      );
    }

    return { grouped, sortedDays };
  }, [meals]);

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const selectedCount = selectedMealIds.length;
  const totalCount = meals.length;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <Pressable onPress={onClose} className="p-2 -m-2">
            <Ionicons name="close" size={24} color="#a8a29e" />
          </Pressable>

          <Text className="text-lg font-semibold text-stone-900 dark:text-white">
            Select Meals
          </Text>

          <Pressable
            onPress={allSelected ? onDeselectAll : onSelectAll}
            className="p-2 -m-2"
          >
            <Text className="text-orange-600 dark:text-orange-400 font-medium">
              {allSelected ? "Deselect All" : "Select All"}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {meals.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="calendar-outline" size={48} color="#a8a29e" />
              <Text className="text-stone-500 dark:text-stone-400 mt-4 text-center">
                No planned meals found.{"\n"}Add meals to your plan first.
              </Text>
            </View>
          ) : (
            mealsByDay.sortedDays.map((day) => (
              <View key={day} className="mb-6">
                {/* Day Header */}
                <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                  {formatDay(day)}
                </Text>

                {/* Meals for this day */}
                <View className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden">
                  {mealsByDay.grouped[day].map((meal, index) => {
                    const isSelected = selectedMealIds.includes(meal._id);

                    return (
                      <Pressable
                        key={meal._id}
                        onPress={() => onToggleMeal?.(meal._id)}
                        className={`flex-row items-center gap-3 px-4 py-3 ${
                          index > 0
                            ? "border-t border-stone-100 dark:border-stone-700"
                            : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <View
                          className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            isSelected
                              ? "bg-orange-500 border-orange-500"
                              : "border-stone-300 dark:border-stone-600"
                          }`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={14} color="white" />
                          )}
                        </View>

                        {/* Meal info */}
                        <View className="flex-1">
                          <Text className="text-stone-900 dark:text-white font-medium">
                            {meal.recipeName}
                          </Text>
                          <Text className="text-xs text-stone-500 dark:text-stone-400">
                            {SLOT_LABELS[meal.slot] || meal.slot}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Bottom Action */}
        {meals.length > 0 && (
          <View className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <Pressable
              onPress={onGenerate}
              disabled={selectedCount === 0}
              className={`py-4 rounded-xl items-center ${
                selectedCount > 0
                  ? "bg-orange-500"
                  : "bg-stone-300 dark:bg-stone-600"
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedCount > 0
                    ? "text-white"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {selectedCount > 0
                  ? `Generate List (${selectedCount} meals)`
                  : "Select meals to continue"}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

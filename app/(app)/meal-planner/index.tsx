/**
 * Meal Planner Screen
 *
 * Weekly calendar view where users can plan meals by assigning recipes
 * to specific days and meal slots. Supports tap-to-assign and
 * selection mode for shopping list generation.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import {
  WeekHeader,
  DayStrip,
  DayView,
  RecipePickerSheet,
  OnboardingOverlay,
  EmptyWeekState,
  ContextMenu,
} from "@/components/meal-planner";
import type { MealSlot, PlannedMeal } from "@/types/meal-planner";

// AsyncStorage keys
const ONBOARDING_COMPLETE_KEY = "mealPlanner_onboardingComplete";
const SNACKS_EXPANDED_KEY = "mealPlanner_snacksExpanded";

export default function MealPlannerScreen() {
  const router = useRouter();

  // Week navigation state
  const {
    currentWeek,
    selectedDay,
    weekDays,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    selectDay,
  } = useWeekNavigation();

  // Fetch planned meals for the current week
  const plannedMeals = useQuery(api.mealPlanner.getMealsByWeek, {
    startDate: currentWeek.startDate,
    endDate: currentWeek.endDate,
  });

  // Fetch recipes for the picker
  const recipePickerItems = useQuery(api.mealPlanner.getRecipePickerItems, {});

  // Mutations
  const addMealToSlot = useMutation(api.mealPlanner.addMealToSlot);
  const removeMeal = useMutation(api.mealPlanner.removeMeal);
  const moveMeal = useMutation(api.mealPlanner.moveMeal);
  const copyMeal = useMutation(api.mealPlanner.copyMeal);
  const clearDay = useMutation(api.mealPlanner.clearDay);
  const clearWeek = useMutation(api.mealPlanner.clearWeek);

  // Local state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMealIds, setSelectedMealIds] = useState<Id<"plannedMeals">[]>(
    []
  );
  const [snacksExpanded, setSnacksExpanded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTargetSlot, setPickerTargetSlot] = useState<MealSlot>("breakfast");
  const [contextMenuMeal, setContextMenuMeal] = useState<PlannedMeal | null>(
    null
  );

  // Load persisted preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [onboardingComplete, snacksState] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
          AsyncStorage.getItem(SNACKS_EXPANDED_KEY),
        ]);

        if (onboardingComplete !== "true") {
          setShowOnboarding(true);
        }

        if (snacksState === "true") {
          setSnacksExpanded(true);
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  // Update week days with meal indicators
  const weekDaysWithMeals = useMemo(() => {
    if (!plannedMeals) return weekDays;

    const mealDays = new Set(plannedMeals.map((m) => m.day));
    return weekDays.map((day) => ({
      ...day,
      hasMeals: mealDays.has(day.date),
    }));
  }, [weekDays, plannedMeals]);

  // Get meals for the selected day
  const mealsForSelectedDay = useMemo(() => {
    if (!plannedMeals) return [];
    return plannedMeals.filter((m) => m.day === selectedDay);
  }, [plannedMeals, selectedDay]);

  // Meal count for the week
  const mealCount = plannedMeals?.length ?? 0;

  // Selection count
  const selectedCount = selectedMealIds.length;

  // Loading state
  const isLoading = plannedMeals === undefined || recipePickerItems === undefined;

  // Handle slot tap (open picker)
  const handleSlotTap = useCallback((slot: MealSlot) => {
    setPickerTargetSlot(slot);
    setPickerVisible(true);
  }, []);

  // Handle recipe selection from picker
  const handleSelectRecipe = useCallback(
    async (recipeId: Id<"recipes">) => {
      try {
        await addMealToSlot({
          recipeId,
          day: selectedDay,
          slot: pickerTargetSlot,
        });
        setPickerVisible(false);

        // Mark onboarding as complete on first meal
        if (showOnboarding) {
          await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error("Failed to add meal:", error);
        Alert.alert("Error", "Failed to add meal. Please try again.");
      }
    },
    [addMealToSlot, selectedDay, pickerTargetSlot, showOnboarding]
  );

  // Handle meal removal
  const handleMealRemove = useCallback(
    async (mealId: Id<"plannedMeals">) => {
      try {
        await removeMeal({ mealId });
      } catch (error) {
        console.error("Failed to remove meal:", error);
        Alert.alert("Error", "Failed to remove meal. Please try again.");
      }
    },
    [removeMeal]
  );

  // Handle meal selection toggle
  const handleMealSelect = useCallback((mealId: Id<"plannedMeals">) => {
    setSelectedMealIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  }, []);

  // Handle view recipe
  const handleViewRecipe = useCallback(
    (recipeId: Id<"recipes">) => {
      router.push(`/(app)/recipes/${recipeId}`);
    },
    [router]
  );

  // Handle meal long press (context menu)
  const handleMealLongPress = useCallback(
    (mealId: Id<"plannedMeals">) => {
      const meal = plannedMeals?.find((m) => m._id === mealId);
      if (meal) {
        setContextMenuMeal(meal);
      }
    },
    [plannedMeals]
  );

  // Handle snacks toggle
  const handleToggleSnacks = useCallback(async () => {
    const newState = !snacksExpanded;
    setSnacksExpanded(newState);
    try {
      await AsyncStorage.setItem(
        SNACKS_EXPANDED_KEY,
        newState ? "true" : "false"
      );
    } catch (error) {
      console.error("Failed to save snacks preference:", error);
    }
  }, [snacksExpanded]);

  // Handle clear day
  const handleClearDay = useCallback(async () => {
    try {
      await clearDay({ day: selectedDay });
    } catch (error) {
      console.error("Failed to clear day:", error);
      Alert.alert("Error", "Failed to clear day. Please try again.");
    }
  }, [clearDay, selectedDay]);

  // Handle select all day
  const handleSelectAllDay = useCallback(() => {
    const dayMealIds = mealsForSelectedDay.map((m) => m._id);
    setSelectedMealIds((prev) => {
      const existing = new Set(prev);
      const allSelected = dayMealIds.every((id) => existing.has(id));

      if (allSelected) {
        // Deselect all from this day
        return prev.filter((id) => !dayMealIds.includes(id));
      } else {
        // Select all from this day
        return [...new Set([...prev, ...dayMealIds])];
      }
    });
  }, [mealsForSelectedDay]);

  // Selection mode handlers
  const handleEnterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedMealIds([]);
  }, []);

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedMealIds([]);
  }, []);

  const handleGenerateList = useCallback(() => {
    if (selectedMealIds.length === 0) return;

    // Navigate to shopping list with selected meal IDs
    const mealIdsParam = selectedMealIds.join(",");
    router.push(`/(app)/shopping-list?mealIds=${mealIdsParam}`);

    // Exit selection mode
    handleExitSelectionMode();
  }, [selectedMealIds, router, handleExitSelectionMode]);

  // Handle clear week
  const handleClearWeek = useCallback(() => {
    Alert.alert(
      "Clear Week",
      "Are you sure you want to remove all meals for this week?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearWeek({
                startDate: currentWeek.startDate,
                endDate: currentWeek.endDate,
              });
            } catch (error) {
              console.error("Failed to clear week:", error);
              Alert.alert("Error", "Failed to clear week. Please try again.");
            }
          },
        },
      ]
    );
  }, [clearWeek, currentWeek]);

  // Handle onboarding dismiss
  const handleDismissOnboarding = useCallback(async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  }, []);

  // Context menu handlers
  const handleContextCopy = useCallback(() => {
    if (!contextMenuMeal) return;
    // For now, copy to next day same slot
    const nextDay = new Date(contextMenuMeal.day + "T12:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const targetDay = nextDay.toISOString().split("T")[0];

    copyMeal({
      mealId: contextMenuMeal._id,
      targetDay,
      targetSlot: contextMenuMeal.slot,
    })
      .then(() => setContextMenuMeal(null))
      .catch((error) => {
        console.error("Failed to copy meal:", error);
        Alert.alert("Error", "Failed to copy meal. Please try again.");
      });
  }, [contextMenuMeal, copyMeal]);

  const handleContextMove = useCallback(() => {
    if (!contextMenuMeal) return;
    // For now, move to next day same slot
    const nextDay = new Date(contextMenuMeal.day + "T12:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const targetDay = nextDay.toISOString().split("T")[0];

    moveMeal({
      mealId: contextMenuMeal._id,
      newDay: targetDay,
      newSlot: contextMenuMeal.slot,
    })
      .then(() => setContextMenuMeal(null))
      .catch((error) => {
        console.error("Failed to move meal:", error);
        Alert.alert("Error", "Failed to move meal. Please try again.");
      });
  }, [contextMenuMeal, moveMeal]);

  const handleContextRemove = useCallback(() => {
    if (!contextMenuMeal) return;
    handleMealRemove(contextMenuMeal._id);
    setContextMenuMeal(null);
  }, [contextMenuMeal, handleMealRemove]);

  // Handle add meal from empty state
  const handleAddFirstMeal = useCallback(() => {
    setPickerTargetSlot("breakfast");
    setPickerVisible(true);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-stone-50 dark:bg-stone-950">
        {/* Header */}
        <WeekHeader
          weekInfo={currentWeek}
          mealCount={mealCount}
          isSelectionMode={isSelectionMode}
          selectedCount={selectedCount}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
          onShopPress={handleEnterSelectionMode}
          onCancelSelection={handleExitSelectionMode}
          onGenerateList={handleGenerateList}
          onClearWeek={handleClearWeek}
        />

        {/* Day Strip */}
        <View className="border-b border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-900">
          <DayStrip
            days={weekDaysWithMeals}
            selectedDay={selectedDay}
            onSelectDay={selectDay}
          />
        </View>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {mealCount === 0 && !isSelectionMode ? (
            <EmptyWeekState onAddMeal={handleAddFirstMeal} />
          ) : (
            <DayView
              day={selectedDay}
              meals={mealsForSelectedDay}
              isSelectionMode={isSelectionMode}
              selectedMealIds={selectedMealIds}
              snacksExpanded={snacksExpanded}
              onSlotTap={handleSlotTap}
              onMealRemove={handleMealRemove}
              onMealSelect={handleMealSelect}
              onViewRecipe={handleViewRecipe}
              onMealLongPress={handleMealLongPress}
              onToggleSnacks={handleToggleSnacks}
              onClearDay={handleClearDay}
              onSelectAllDay={handleSelectAllDay}
            />
          )}
        </ScrollView>

        {/* Recipe Picker Sheet */}
        <RecipePickerSheet
          isVisible={pickerVisible}
          recipes={recipePickerItems ?? []}
          targetDay={selectedDay}
          targetSlot={pickerTargetSlot}
          onSelectRecipe={handleSelectRecipe}
          onClose={() => setPickerVisible(false)}
        />

        {/* Onboarding Overlay */}
        <OnboardingOverlay
          isVisible={showOnboarding && mealCount === 0}
          onDismiss={handleDismissOnboarding}
        />

        {/* Context Menu */}
        {contextMenuMeal && (
          <ContextMenu
            isVisible={!!contextMenuMeal}
            meal={contextMenuMeal}
            position={{ x: 0, y: 0 }}
            onCopy={handleContextCopy}
            onMove={handleContextMove}
            onRemove={handleContextRemove}
            onClose={() => setContextMenuMeal(null)}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

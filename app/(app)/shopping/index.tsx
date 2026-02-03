/**
 * Shopping Lists Screen
 *
 * Main overview screen for shopping lists showing active and archived lists
 * with quick actions for creating new lists.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ShoppingListCard, MealSelectionModal } from "@/components/shopping";

export default function ShoppingListsScreen() {
  const router = useRouter();

  // Fetch shopping lists
  const lists = useQuery(api.shoppingLists.getShoppingLists);

  // Fetch planned meals for the current week (for meal selection)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startDate = startOfWeek.toISOString().split("T")[0];
  const endDate = endOfWeek.toISOString().split("T")[0];

  const plannedMeals = useQuery(api.mealPlanner.getMealsByWeek, {
    startDate,
    endDate,
  });

  // Mutations
  const createList = useMutation(api.shoppingLists.createShoppingList);
  const deleteList = useMutation(api.shoppingLists.deleteShoppingList);
  const generateFromMealPlan = useMutation(
    api.shoppingLists.generateFromMealPlan
  );

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMealSelection, setShowMealSelection] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedMealIds, setSelectedMealIds] = useState<Id<"plannedMeals">[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Split lists by status
  const activeLists = lists?.filter((l) => l.status === "active") || [];
  const archivedLists = lists?.filter((l) => l.status === "archived") || [];

  // Loading state
  const isLoading = lists === undefined;

  // Handle view list
  const handleViewList = useCallback(
    (listId: Id<"shoppingLists">) => {
      router.push(`/(app)/shopping/${listId}`);
    },
    [router]
  );

  // Handle delete list
  const handleDeleteList = useCallback(
    (listId: Id<"shoppingLists">) => {
      Alert.alert(
        "Delete List",
        "Are you sure you want to delete this shopping list?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteList({ listId });
              } catch (error) {
                console.error("Failed to delete list:", error);
                Alert.alert("Error", "Failed to delete list. Please try again.");
              }
            },
          },
        ]
      );
    },
    [deleteList]
  );

  // Handle create empty list
  const handleCreateEmpty = useCallback(async () => {
    if (!newListName.trim()) return;

    try {
      const listId = await createList({ name: newListName.trim() });
      setShowCreateModal(false);
      setNewListName("");
      router.push(`/(app)/shopping/${listId}`);
    } catch (error) {
      console.error("Failed to create list:", error);
      Alert.alert("Error", "Failed to create list. Please try again.");
    }
  }, [createList, newListName, router]);

  // Handle meal selection toggle
  const handleToggleMeal = useCallback((mealId: Id<"plannedMeals">) => {
    setSelectedMealIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  }, []);

  // Handle select all meals
  const handleSelectAll = useCallback(() => {
    if (plannedMeals) {
      setSelectedMealIds(plannedMeals.map((m) => m._id));
    }
  }, [plannedMeals]);

  // Handle deselect all meals
  const handleDeselectAll = useCallback(() => {
    setSelectedMealIds([]);
  }, []);

  // Handle generate from meal plan
  const handleGenerate = useCallback(async () => {
    if (selectedMealIds.length === 0) return;

    setIsGenerating(true);
    try {
      const listId = await generateFromMealPlan({ mealIds: selectedMealIds });
      setShowMealSelection(false);
      setSelectedMealIds([]);
      router.push(`/(app)/shopping/${listId}`);
    } catch (error) {
      console.error("Failed to generate list:", error);
      Alert.alert("Error", "Failed to generate list. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [generateFromMealPlan, selectedMealIds, router]);

  // Handle open meal selection
  const handleOpenMealSelection = useCallback(() => {
    // Pre-select all meals
    if (plannedMeals) {
      setSelectedMealIds(plannedMeals.map((m) => m._id));
    }
    setShowMealSelection(true);
  }, [plannedMeals]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-stone-900 dark:text-white">
              Shopping Lists
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {activeLists.length} active{" "}
              {activeLists.length === 1 ? "list" : "lists"}
            </Text>
          </View>

          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="flex-row items-center gap-2 px-4 py-2 bg-orange-500 rounded-xl"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold">New List</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={handleOpenMealSelection}
            className="flex-1 flex-row items-center justify-center gap-3 p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl"
            style={{
              shadowColor: "#f97316",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="p-2 bg-white/20 rounded-xl">
              <Ionicons name="calendar-outline" size={24} color="white" />
            </View>
            <View>
              <Text className="text-white font-semibold">From Meal Plan</Text>
              <Text className="text-orange-100 text-xs">
                Generate from this week
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="flex-1 flex-row items-center justify-center gap-3 p-4 bg-white dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-2xl"
          >
            <View className="p-2 bg-stone-100 dark:bg-stone-700 rounded-xl">
              <Ionicons
                name="create-outline"
                size={24}
                color="#78716c"
              />
            </View>
            <View>
              <Text className="text-stone-600 dark:text-stone-300 font-semibold">
                Create Empty
              </Text>
              <Text className="text-stone-400 dark:text-stone-500 text-xs">
                Start from scratch
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Active Lists */}
        {activeLists.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
              Active Lists
            </Text>
            <View className="space-y-3">
              {activeLists.map((list) => (
                <ShoppingListCard
                  key={list._id}
                  list={list}
                  onView={() => handleViewList(list._id)}
                  onDelete={() => handleDeleteList(list._id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {activeLists.length === 0 && (
          <View className="items-center py-12">
            <View className="w-16 h-16 mb-4 bg-stone-100 dark:bg-stone-800 rounded-full items-center justify-center">
              <Ionicons
                name="checkbox-outline"
                size={32}
                color="#a8a29e"
              />
            </View>
            <Text className="font-semibold text-stone-900 dark:text-white mb-1">
              No active lists
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400 text-center">
              Create a new list or generate one{"\n"}from your meal plan
            </Text>
          </View>
        )}

        {/* Archived Lists (History) */}
        {archivedLists.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
              History
            </Text>
            <View className="space-y-3">
              {archivedLists.map((list) => (
                <ShoppingListCard
                  key={list._id}
                  list={list}
                  onView={() => handleViewList(list._id)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Empty List Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <Pressable
              onPress={() => setShowCreateModal(false)}
              className="p-2 -m-2"
            >
              <Ionicons name="close" size={24} color="#a8a29e" />
            </Pressable>

            <Text className="text-lg font-semibold text-stone-900 dark:text-white">
              New Shopping List
            </Text>

            <View style={{ width: 40 }} />
          </View>

          <View className="p-4">
            <Text className="text-sm text-stone-500 dark:text-stone-400 mb-2">
              List Name
            </Text>
            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              placeholder="e.g., Weekend BBQ"
              placeholderTextColor="#a8a29e"
              className="w-full px-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white text-lg"
              autoFocus
            />

            <Pressable
              onPress={handleCreateEmpty}
              disabled={!newListName.trim()}
              className={`mt-6 py-4 rounded-xl items-center ${
                newListName.trim()
                  ? "bg-orange-500"
                  : "bg-stone-300 dark:bg-stone-600"
              }`}
            >
              <Text
                className={`font-semibold ${
                  newListName.trim()
                    ? "text-white"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                Create List
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Meal Selection Modal */}
      <MealSelectionModal
        isVisible={showMealSelection}
        meals={plannedMeals || []}
        selectedMealIds={selectedMealIds}
        onToggleMeal={handleToggleMeal}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onGenerate={handleGenerate}
        onClose={() => {
          setShowMealSelection(false);
          setSelectedMealIds([]);
        }}
      />

      {/* Loading overlay for generation */}
      {isGenerating && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white dark:bg-stone-800 rounded-2xl p-6 items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="mt-4 text-stone-900 dark:text-white font-medium">
              Generating list...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

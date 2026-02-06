/**
 * Shopping List Detail Screen
 *
 * Displays a single shopping list with items organized by category or recipe.
 * Supports item checking, editing, adding, and list sharing.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ShoppingItemRow,
  AddItemForm,
  CategorySection,
  SyncStatusIndicator,
  InstacartButton,
} from "@/components/shopping";
import type { ItemCategory, SyncStatus, ShoppingItem } from "@/types/shopping-list";
import { ITEM_CATEGORIES } from "@/types/shopping-list";

export default function ShoppingListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const listId = id as Id<"shoppingLists">;

  // Fetch list with items
  const list = useQuery(api.shoppingLists.getShoppingListById, { listId });

  // Mutations
  const updateList = useMutation(api.shoppingLists.updateShoppingList);
  const toggleItem = useMutation(api.shoppingLists.toggleItemChecked);
  const updateItem = useMutation(api.shoppingLists.updateItem);
  const deleteItem = useMutation(api.shoppingLists.deleteItem);
  const addItem = useMutation(api.shoppingLists.addItem);

  // Local state
  const [viewMode, setViewMode] = useState<"category" | "recipe">("category");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [listName, setListName] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  // Update listName when list loads
  useEffect(() => {
    if (list) {
      setListName(list.name);
    }
  }, [list?.name]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!list || list.totalItems === 0) return 0;
    return Math.round((list.checkedItems / list.totalItems) * 100);
  }, [list?.totalItems, list?.checkedItems]);

  const isReadOnly = list?.status === "archived";

  // Group items by category
  const itemsByCategory = useMemo(() => {
    if (!list?.items) return {};

    return ITEM_CATEGORIES.reduce(
      (acc, category) => {
        const categoryItems = list.items.filter(
          (item) => item.category === category
        );
        if (categoryItems.length > 0) {
          acc[category] = categoryItems;
        }
        return acc;
      },
      {} as Record<ItemCategory, ShoppingItem[]>
    );
  }, [list?.items]);

  // Group items by recipe
  const itemsByRecipe = useMemo(() => {
    if (!list?.items) return {};

    return list.items.reduce(
      (acc, item) => {
        const key = item.isCustom
          ? "Custom Items"
          : item.recipeName || "Other Items";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, ShoppingItem[]>
    );
  }, [list?.items]);

  // Handle rename
  const handleRename = useCallback(async () => {
    if (!listName.trim() || listName === list?.name) {
      setListName(list?.name || "");
      setIsRenaming(false);
      return;
    }

    try {
      setSyncStatus("pending");
      await updateList({ listId, name: listName.trim() });
      setSyncStatus("synced");
    } catch (error) {
      console.error("Failed to rename list:", error);
      setListName(list?.name || "");
      setSyncStatus("synced");
    }
    setIsRenaming(false);
  }, [listName, list?.name, updateList, listId]);

  // Handle toggle item
  const handleToggleItem = useCallback(
    async (itemId: Id<"shoppingItems">) => {
      try {
        setSyncStatus("pending");
        await toggleItem({ itemId });
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to toggle item:", error);
        setSyncStatus("synced");
      }
    },
    [toggleItem]
  );

  // Handle edit item
  const handleEditItem = useCallback(
    async (itemId: Id<"shoppingItems">, quantity: number, unit: string) => {
      try {
        setSyncStatus("pending");
        await updateItem({ itemId, quantity, unit });
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to update item:", error);
        setSyncStatus("synced");
      }
    },
    [updateItem]
  );

  // Handle delete item
  const handleDeleteItem = useCallback(
    async (itemId: Id<"shoppingItems">) => {
      try {
        setSyncStatus("pending");
        await deleteItem({ itemId });
        setSyncStatus("synced");
      } catch (error) {
        console.error("Failed to delete item:", error);
        setSyncStatus("synced");
      }
    },
    [deleteItem]
  );

  // Handle add item
  const handleAddItem = useCallback(
    async (
      name: string,
      quantity: number,
      unit: string,
      category: ItemCategory
    ) => {
      try {
        setSyncStatus("pending");
        await addItem({ listId, name, quantity, unit, category });
        setSyncStatus("synced");
        setShowAddForm(false);
      } catch (error) {
        console.error("Failed to add item:", error);
        Alert.alert("Error", "Failed to add item. Please try again.");
        setSyncStatus("synced");
      }
    },
    [addItem, listId]
  );

  // Handle share
  const handleShare = useCallback(async () => {
    if (!list) return;

    // Generate text export
    let text = `${list.name}\n\n`;

    if (viewMode === "category") {
      for (const category of ITEM_CATEGORIES) {
        const items = itemsByCategory[category];
        if (items && items.length > 0) {
          text += `${category}\n`;
          for (const item of items) {
            const checkbox = item.checked ? "[x]" : "[ ]";
            text += `${checkbox} ${item.name} - ${item.quantity} ${item.unit}\n`;
          }
          text += "\n";
        }
      }
    } else {
      for (const [recipeName, items] of Object.entries(itemsByRecipe)) {
        text += `${recipeName}\n`;
        for (const item of items) {
          const checkbox = item.checked ? "[x]" : "[ ]";
          text += `${checkbox} ${item.name} - ${item.quantity} ${item.unit}\n`;
        }
        text += "\n";
      }
    }

    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied!", "Shopping list copied to clipboard");
    } catch (error) {
      // Fallback to share sheet
      try {
        await Share.share({ message: text });
      } catch (shareError) {
        console.error("Failed to share:", shareError);
      }
    }
  }, [list, viewMode, itemsByCategory, itemsByRecipe]);

  // Loading state
  if (list === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Not found
  if (list === null) {
    return (
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#a8a29e" />
        <Text className="text-stone-500 dark:text-stone-400 mt-4">
          Shopping list not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-orange-500 rounded-lg"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80">
        {/* Top Row */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3 flex-1">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="chevron-back" size={24} color="#78716c" />
            </Pressable>

            {isRenaming && !isReadOnly ? (
              <TextInput
                value={listName}
                onChangeText={setListName}
                onBlur={handleRename}
                onSubmitEditing={handleRename}
                className="flex-1 text-xl font-bold text-stone-900 dark:text-white border-b-2 border-orange-500 bg-transparent"
                autoFocus
              />
            ) : (
              <Pressable
                onPress={() => !isReadOnly && setIsRenaming(true)}
                className="flex-1 flex-row items-center gap-2"
              >
                <Text
                  className="text-xl font-bold text-stone-900 dark:text-white"
                  numberOfLines={1}
                >
                  {list.name}
                </Text>
                {!isReadOnly && (
                  <Ionicons name="pencil-outline" size={16} color="#a8a29e" />
                )}
              </Pressable>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <SyncStatusIndicator status={syncStatus} />
            {!isReadOnly && (
              <InstacartButton
                listId={listId}
                itemCount={list.totalItems - list.checkedItems}
                disabled={list.totalItems === 0}
              />
            )}
            <Pressable
              onPress={handleShare}
              className="flex-row items-center gap-1 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg"
            >
              <Ionicons name="share-outline" size={16} color="#78716c" />
              <Text className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Share
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              {list.checkedItems} of {list.totalItems} items
            </Text>
            <Text
              className={`text-sm font-medium ${
                progress === 100
                  ? "text-green-600"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {progress}%
            </Text>
          </View>
          <View className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${
                progress === 100 ? "bg-green-500" : "bg-orange-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* View Toggle and Add Button */}
        <View className="flex-row items-center justify-between">
          {/* View Toggle */}
          <View className="flex-row bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
            <Pressable
              onPress={() => setViewMode("category")}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === "category"
                  ? "bg-white dark:bg-stone-700"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  viewMode === "category"
                    ? "text-stone-900 dark:text-white"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                By Aisle
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode("recipe")}
              className={`px-3 py-1.5 rounded-md ${
                viewMode === "recipe"
                  ? "bg-white dark:bg-stone-700"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  viewMode === "recipe"
                    ? "text-stone-900 dark:text-white"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                By Recipe
              </Text>
            </Pressable>
          </View>

          {/* Add Item Button */}
          {!isReadOnly && (
            <Pressable
              onPress={() => setShowAddForm(!showAddForm)}
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-lg ${
                showAddForm
                  ? "bg-orange-500"
                  : "bg-orange-100 dark:bg-orange-900/30"
              }`}
            >
              <Ionicons
                name="add"
                size={16}
                color={showAddForm ? "white" : "#f97316"}
              />
              <Text
                className={`text-sm font-medium ${
                  showAddForm
                    ? "text-white"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                Add Item
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Add Item Form */}
      {showAddForm && !isReadOnly && (
        <AddItemForm
          categories={ITEM_CATEGORIES}
          onAdd={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Content */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {list.totalItems === 0 ? (
          // Empty State
          <View className="items-center py-12">
            <View className="w-16 h-16 mb-4 bg-stone-100 dark:bg-stone-800 rounded-full items-center justify-center">
              <Ionicons name="checkbox-outline" size={32} color="#a8a29e" />
            </View>
            <Text className="font-semibold text-stone-900 dark:text-white mb-1">
              No items yet
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400 text-center mb-4">
              Add items manually or generate{"\n"}from your meal plan
            </Text>
            {!isReadOnly && (
              <Pressable
                onPress={() => setShowAddForm(true)}
                className="px-4 py-2 bg-orange-500 rounded-lg"
              >
                <Text className="text-white font-semibold">Add First Item</Text>
              </Pressable>
            )}
          </View>
        ) : viewMode === "category" ? (
          // Category View
          ITEM_CATEGORIES.map((category) => {
            const items = itemsByCategory[category];
            if (!items || items.length === 0) return null;

            return (
              <CategorySection
                key={category}
                category={category}
                items={items}
                isReadOnly={isReadOnly}
                onToggleItem={handleToggleItem}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
              />
            );
          })
        ) : (
          // Recipe View
          Object.entries(itemsByRecipe).map(([recipeName, items]) => {
            const checkedCount = items.filter((i) => i.checked).length;
            const allChecked = checkedCount === items.length;

            return (
              <View key={recipeName} className="mb-4">
                {/* Recipe Header */}
                <View className="flex-row items-center gap-2 mb-2 px-1">
                  <Ionicons
                    name="restaurant-outline"
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
                    {recipeName}
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
                      onToggle={() => handleToggleItem(item._id)}
                      onEdit={(qty, unit) => handleEditItem(item._id, qty, unit)}
                      onDelete={() => handleDeleteItem(item._id)}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}

        {/* Complete badge for archived lists */}
        {isReadOnly && (
          <View className="items-center mt-4 mb-8">
            <View className="flex-row items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text className="text-green-700 dark:text-green-400 font-medium">
                Completed
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

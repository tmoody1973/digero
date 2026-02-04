/**
 * AddRecipesToCookbookModal Component
 *
 * Modal for selecting recipes from the library to add to a cookbook.
 * Displays all user recipes with checkboxes for multi-select.
 */

import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { X, BookPlus, Check, Search } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AddRecipesToCookbookModalProps {
  isOpen: boolean;
  cookbookId: Id<"cookbooks">;
  existingRecipeIds: Id<"recipes">[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddRecipesToCookbookModal({
  isOpen,
  cookbookId,
  existingRecipeIds,
  onClose,
  onSuccess,
}: AddRecipesToCookbookModalProps) {
  const [selectedRecipes, setSelectedRecipes] = useState<Set<Id<"recipes">>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user recipes
  const recipesResult = useQuery(api.recipes.listRecipes, {
    paginationOpts: { numItems: 100, cursor: null },
  });

  const addRecipeToCookbook = useMutation(api.cookbooks.addRecipeToCookbook);

  const recipes = recipesResult?.page ?? [];
  const isLoading = recipesResult === undefined;

  // Filter recipes by search and exclude already added ones
  const filteredRecipes = useMemo(() => {
    const existingSet = new Set(existingRecipeIds);
    return recipes.filter((recipe) => {
      // Exclude already added recipes
      if (existingSet.has(recipe._id)) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          recipe.title.toLowerCase().includes(query) ||
          recipe.ingredients.some((i) => i.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [recipes, existingRecipeIds, searchQuery]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRecipes(new Set());
      setSearchQuery("");
      setError(null);
    }
  }, [isOpen]);

  const toggleRecipe = (recipeId: Id<"recipes">) => {
    setSelectedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedRecipes.size === filteredRecipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(filteredRecipes.map((r) => r._id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedRecipes.size === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Add each selected recipe to the cookbook
      for (const recipeId of selectedRecipes) {
        await addRecipeToCookbook({
          cookbookId,
          recipeId,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add recipes to cookbook"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRecipeItem = ({ item }: { item: (typeof recipes)[0] }) => {
    const isSelected = selectedRecipes.has(item._id);

    return (
      <Pressable
        onPress={() => toggleRecipe(item._id)}
        className={`flex-row items-center gap-3 rounded-xl border p-3 ${
          isSelected
            ? "border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20"
            : "border-stone-200 bg-white active:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:active:bg-stone-700"
        }`}
      >
        {/* Checkbox */}
        <View
          className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
            isSelected
              ? "border-orange-500 bg-orange-500"
              : "border-stone-300 dark:border-stone-600"
          }`}
        >
          {isSelected && <Check className="h-4 w-4 text-white" />}
        </View>

        {/* Recipe Thumbnail */}
        <Image
          source={{ uri: item.imageUrl }}
          className="h-12 w-12 rounded-lg"
          resizeMode="cover"
        />

        {/* Info */}
        <View className="flex-1">
          <Text
            className="font-medium text-stone-900 dark:text-white"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            {item.totalTime ? `${item.totalTime} min` : "No time"} •{" "}
            {item.servings} servings
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-stone-900">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <View className="flex-row items-center gap-2">
            <BookPlus className="h-5 w-5 text-orange-500" />
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">
              Add Recipes
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="h-8 w-8 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
          >
            <X className="h-5 w-5 text-stone-500" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <View className="flex-row items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 dark:bg-stone-800">
            <Search className="h-5 w-5 text-stone-400" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes..."
              placeholderTextColor="#a8a29e"
              className="flex-1 text-stone-900 dark:text-white"
            />
          </View>
        </View>

        {/* Select All / Count */}
        <View className="flex-row items-center justify-between border-b border-stone-200 px-4 py-2 dark:border-stone-700">
          <Text className="text-sm text-stone-500 dark:text-stone-400">
            {filteredRecipes.length} available recipes
          </Text>
          {filteredRecipes.length > 0 && (
            <Pressable onPress={handleSelectAll}>
              <Text className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {selectedRecipes.size === filteredRecipes.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="mb-2 text-center text-lg font-medium text-stone-900 dark:text-white">
              {existingRecipeIds.length === recipes.length
                ? "All recipes already added"
                : "No recipes found"}
            </Text>
            <Text className="text-center text-stone-500 dark:text-stone-400">
              {existingRecipeIds.length === recipes.length
                ? "This cookbook contains all your recipes"
                : searchQuery
                  ? "Try a different search term"
                  : "Create some recipes first"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item._id}
            contentContainerClassName="p-4"
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
        )}

        {/* Error Message */}
        {error && (
          <View className="mx-4 mb-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/30">
            <Text className="text-sm text-red-600 dark:text-red-400">
              {error}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row gap-3 border-t border-stone-200 px-4 py-4 dark:border-stone-700">
          <Pressable
            onPress={onClose}
            className="flex-1 items-center rounded-xl border border-stone-200 py-3 active:bg-stone-50 dark:border-stone-700 dark:active:bg-stone-800"
          >
            <Text className="font-semibold text-stone-600 dark:text-stone-400">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || selectedRecipes.size === 0}
            className={`flex-1 items-center rounded-xl py-3 ${
              !isSubmitting && selectedRecipes.size > 0
                ? "bg-orange-500 active:bg-orange-600"
                : "bg-stone-200 dark:bg-stone-700"
            }`}
          >
            <Text
              className={`font-semibold ${
                !isSubmitting && selectedRecipes.size > 0
                  ? "text-white"
                  : "text-stone-400"
              }`}
            >
              {isSubmitting
                ? "Adding..."
                : `Add ${selectedRecipes.size > 0 ? `(${selectedRecipes.size})` : ""}`}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

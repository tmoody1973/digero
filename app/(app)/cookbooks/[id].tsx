/**
 * Cookbook Detail Screen
 *
 * Displays a cookbook's contents with cover image header,
 * recipe grid/list, sorting, and multi-select mode.
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Share2,
  Pencil,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  CookbookRecipeCard,
  CookbookEmptyState,
  ViewModeToggle,
  SortSelector,
  EditCookbookModal,
  type ViewMode,
} from "@/components/cookbooks";
import type { SortOption } from "@/components/cookbooks/SortSelector";

export default function CookbookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("position");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<Id<"recipes">>>(
    new Set()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch cookbook with recipes
  const cookbookId = id as Id<"cookbooks">;
  const cookbook = useQuery(api.cookbooks.getCookbookWithRecipes, {
    id: cookbookId,
    sortBy,
  });

  const removeRecipeMutation = useMutation(api.cookbooks.removeRecipeFromCookbook);
  const removeRecipesMutation = useMutation(api.cookbooks.removeRecipesFromCookbook);
  const reorderRecipesMutation = useMutation(api.cookbooks.reorderRecipes);
  const updateCookbookMutation = useMutation(api.cookbooks.updateCookbook);

  const isLoading = cookbook === undefined;
  const recipes = cookbook?.recipes ?? [];

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleViewRecipe = useCallback(
    (recipeId: Id<"recipes">) => {
      router.push(`/(app)/recipes/${recipeId}`);
    },
    [router]
  );

  const handleToggleSelect = useCallback((recipeId: Id<"recipes">) => {
    setSelectedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRecipes.size === recipes.length) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(recipes.map((r) => r.recipeId)));
    }
  }, [recipes, selectedRecipes.size]);

  const handleRemoveRecipe = useCallback(
    async (recipeId: Id<"recipes">) => {
      try {
        await removeRecipeMutation({
          cookbookId,
          recipeId,
        });
      } catch (error) {
        console.error("Failed to remove recipe:", error);
      }
    },
    [cookbookId, removeRecipeMutation]
  );

  const handleRemoveSelected = useCallback(async () => {
    if (selectedRecipes.size === 0) return;

    try {
      await removeRecipesMutation({
        cookbookId,
        recipeIds: Array.from(selectedRecipes),
      });
      setSelectedRecipes(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("Failed to remove recipes:", error);
    }
  }, [cookbookId, removeRecipesMutation, selectedRecipes]);

  const handleCancelSelect = useCallback(() => {
    setSelectedRecipes(new Set());
    setIsSelectMode(false);
  }, []);

  const handleSortChange = useCallback(
    async (newSort: SortOption) => {
      setSortBy(newSort);

      // Persist sort preference
      try {
        await updateCookbookMutation({
          id: cookbookId,
          sortBy: newSort,
        });
      } catch (error) {
        console.error("Failed to save sort preference:", error);
      }
    },
    [cookbookId, updateCookbookMutation]
  );

  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log("Share cookbook");
  }, []);

  // Render recipe card
  const renderRecipeCard = useCallback(
    ({ item }: { item: (typeof recipes)[0] }) => (
      <View className={viewMode === "grid" ? "w-[48%]" : "w-full"}>
        <CookbookRecipeCard
          recipe={item}
          viewMode={viewMode}
          isSelected={selectedRecipes.has(item.recipeId)}
          isSelectMode={isSelectMode}
          isBuiltIn={cookbook?.isBuiltIn}
          onView={() => handleViewRecipe(item.recipeId)}
          onToggleSelect={() => handleToggleSelect(item.recipeId)}
          onRemove={() => handleRemoveRecipe(item.recipeId)}
        />
      </View>
    ),
    [
      viewMode,
      selectedRecipes,
      isSelectMode,
      cookbook?.isBuiltIn,
      handleViewRecipe,
      handleToggleSelect,
      handleRemoveRecipe,
    ]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!cookbook) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Text className="text-stone-500 dark:text-stone-400">
          Cookbook not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header with Cover Image */}
      <View className="relative">
        <View className="h-40 bg-gradient-to-br from-orange-400 to-orange-600">
          <Image
            source={{ uri: cookbook.coverUrl }}
            className="h-full w-full opacity-60"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
            className="absolute inset-0"
          />
        </View>

        {/* Back Button */}
        <Pressable
          onPress={handleBack}
          className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/30 active:bg-black/40"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Pressable>

        {/* Action Buttons */}
        <View className="absolute right-4 top-12 flex-row gap-2">
          <Pressable
            onPress={handleShare}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/30 active:bg-black/40"
          >
            <Share2 className="h-5 w-5 text-white" />
          </Pressable>
          <Pressable
            onPress={() => setShowEditModal(true)}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/30 active:bg-black/40"
          >
            <Pencil className="h-5 w-5 text-white" />
          </Pressable>
        </View>

        {/* Info Card */}
        <View className="mx-4 -mt-12 rounded-2xl bg-white p-6 shadow-xl dark:bg-stone-900">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-bold text-stone-900 dark:text-white">
                  {cookbook.name}
                </Text>
                {cookbook.isBuiltIn && (
                  <View className="rounded-full bg-orange-100 px-2 py-0.5 dark:bg-orange-900/30">
                    <Text className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400">
                      Built-in
                    </Text>
                  </View>
                )}
              </View>
              {cookbook.description && (
                <Text className="mt-1 text-stone-500 dark:text-stone-400">
                  {cookbook.description}
                </Text>
              )}
              <Text className="mt-2 text-sm text-stone-400 dark:text-stone-500">
                {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="sticky top-0 z-30 mt-4 border-b border-stone-200 bg-white/80 backdrop-blur-lg dark:border-stone-800 dark:bg-stone-900/80">
        <View className="px-4 py-3">
          {isSelectMode ? (
            // Select Mode Controls
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Pressable onPress={handleSelectAll}>
                  <Text className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {selectedRecipes.size === recipes.length
                      ? "Deselect All"
                      : "Select All"}
                  </Text>
                </Pressable>
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  {selectedRecipes.size} selected
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable onPress={handleCancelSelect}>
                  <Text className="px-4 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleRemoveSelected}
                  disabled={selectedRecipes.size === 0}
                  className={`rounded-lg px-4 py-1.5 ${
                    selectedRecipes.size > 0
                      ? "bg-red-500 active:bg-red-600"
                      : "bg-stone-200 dark:bg-stone-700"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedRecipes.size > 0 ? "text-white" : "text-stone-400"
                    }`}
                  >
                    Remove ({selectedRecipes.size})
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            // Normal Controls
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <SortSelector value={sortBy} onSortChange={handleSortChange} />
                <ViewModeToggle
                  value={viewMode}
                  onViewModeChange={setViewMode}
                  size="sm"
                />
              </View>

              {recipes.length > 0 && !cookbook.isBuiltIn && (
                <Pressable onPress={() => setIsSelectMode(true)}>
                  <Text className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Select
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Recipes */}
      {recipes.length === 0 ? (
        <View className="px-4 py-6">
          <CookbookEmptyState
            isBuiltIn={cookbook.isBuiltIn}
            cookbookName={cookbook.name}
          />
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.recipeId}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode}
          contentContainerClassName="p-4"
          columnWrapperClassName={viewMode === "grid" ? "gap-4" : undefined}
          ItemSeparatorComponent={() => <View className="h-4" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#f97316"
            />
          }
        />
      )}

      {/* Edit Modal */}
      <EditCookbookModal
        isOpen={showEditModal}
        cookbookId={cookbookId}
        onClose={() => setShowEditModal(false)}
      />
    </View>
  );
}

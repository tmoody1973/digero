/**
 * Main App Screen (Recipe List)
 *
 * Default screen after authentication.
 * Displays user's recipe list with search, filter, and sort.
 */

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react-native";

import {
  SearchBar,
  FilterPills,
  SortSelector,
  ViewModeToggle,
  RecipeCard,
  EmptyState,
  SkeletonRecipeCard,
  type SortOption,
  type ViewMode,
} from "@/components/recipes/list";

type SourceFilter = "all" | "youtube" | "website" | "scanned" | "manual";

export default function HomeScreen() {
  const router = useRouter();

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("mostRecent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch recipes with current filters
  const recipesResult = useQuery(api.recipes.listRecipes, {
    paginationOpts: { numItems: 50 },
    sourceFilter: sourceFilter === "all" ? undefined : sourceFilter,
    searchQuery: searchQuery || undefined,
    sortBy,
  });

  const recipes = recipesResult?.page ?? [];
  const isLoading = recipesResult === undefined;

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // The query will automatically refetch when component re-renders
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  // Navigate to recipe detail
  const handleRecipePress = useCallback(
    (recipeId: string) => {
      router.push(`/(app)/recipes/${recipeId}`);
    },
    [router]
  );

  // Navigate to add recipe
  const handleAddRecipe = useCallback(() => {
    router.push("/(app)/recipes/create");
  }, [router]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSourceFilter("all");
  }, []);

  // Recipe count text
  const recipeCountText = useMemo(() => {
    const count = recipes.length;
    let text = `${count} recipe${count !== 1 ? "s" : ""}`;

    if (sourceFilter !== "all") {
      text += ` in ${sourceFilter}`;
    }

    if (searchQuery) {
      text += ` matching "${searchQuery}"`;
    }

    return text;
  }, [recipes.length, sourceFilter, searchQuery]);

  // Render recipe card
  const renderRecipeCard = useCallback(
    ({ item }: { item: (typeof recipes)[0] }) => (
      <RecipeCard
        recipe={item}
        viewMode={viewMode}
        onPress={() => handleRecipePress(item._id)}
      />
    ),
    [viewMode, handleRecipePress]
  );

  // Render loading skeleton
  const renderSkeleton = () => {
    const skeletonCount = viewMode === "grid" ? 6 : 4;
    return (
      <View
        className={
          viewMode === "grid"
            ? "flex-row flex-wrap gap-4 px-4"
            : "gap-3 px-4"
        }
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <View key={i} className={viewMode === "grid" ? "w-[48%]" : "w-full"}>
            <SkeletonRecipeCard viewMode={viewMode} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="border-b border-stone-200 bg-white px-4 pb-4 pt-12 dark:border-stone-800 dark:bg-stone-900">
        {/* App Title */}
        <Text className="mb-4 text-2xl font-bold text-orange-500">Digero</Text>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search recipes or ingredients..."
        />

        {/* Filters and Controls */}
        <View className="mt-4 flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <FilterPills
              activeFilter={sourceFilter}
              onFilterChange={setSourceFilter}
            />
          </View>

          <View className="flex-row items-center gap-2">
            <SortSelector value={sortBy} onSortChange={setSortBy} />
            <ViewModeToggle value={viewMode} onViewModeChange={setViewMode} />
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="pt-6">{renderSkeleton()}</View>
      ) : recipes.length === 0 ? (
        <EmptyState
          hasFilters={sourceFilter !== "all" || !!searchQuery}
          searchQuery={searchQuery}
          onClearFilters={handleClearFilters}
          onAddRecipe={handleAddRecipe}
        />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Force re-render when changing view mode
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
          ListHeaderComponent={
            <Text className="mb-4 text-sm text-stone-500 dark:text-stone-400">
              {recipeCountText}
            </Text>
          }
        />
      )}

      {/* Floating Add Button */}
      <Pressable
        onPress={handleAddRecipe}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg active:bg-orange-600"
      >
        <Plus className="h-6 w-6 text-white" />
      </Pressable>
    </View>
  );
}

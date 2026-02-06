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
import { useColorScheme } from "nativewind";
import { api } from "@/convex/_generated/api";
import { Plus, Settings } from "lucide-react-native";

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
import { AddRecipeMenu } from "@/components/recipes";
import { TabBar } from "@/components/navigation";
import { DigeroLogo } from "@/components/brand";

type SourceFilter = "all" | "youtube" | "website" | "scanned" | "manual";

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("mostRecent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Fetch recipes with current filters
  const recipesResult = useQuery(api.recipes.listRecipes, {
    paginationOpts: { numItems: 50, cursor: null },
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

  // Show add recipe menu
  const handleAddRecipe = useCallback(() => {
    setShowAddMenu(true);
  }, []);

  // Add recipe menu handlers
  const handleManualEntry = useCallback(() => {
    router.push("/(app)/recipes/create");
  }, [router]);

  const handleWebsiteUrl = useCallback(() => {
    router.push("/(app)/recipes/import");
  }, [router]);

  const handleYoutubeUrl = useCallback(() => {
    router.push("/(app)/recipes/youtube-import");
  }, [router]);

  const handleYoutubeSearch = useCallback(() => {
    router.push("/(app)/recipes/youtube-search");
  }, [router]);

  const handleScanPhoto = useCallback(() => {
    router.push("/(app)/recipes/scan");
  }, [router]);

  const handleAiChat = useCallback(() => {
    router.push("/(app)/recipes/ai-chat");
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
      <View className={viewMode === "grid" ? "flex-1" : "w-full"}>
        <RecipeCard
          recipe={item}
          viewMode={viewMode}
          onPress={() => handleRecipePress(item._id)}
        />
      </View>
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
        {/* App Title & Settings */}
        <View className="mb-4 flex-row items-center justify-between">
          <DigeroLogo width={100} height={44} />
          <Pressable
            onPress={() => router.push("/(app)/settings")}
            className="rounded-full p-2 active:bg-stone-100 dark:active:bg-stone-800"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Settings size={24} color={isDark ? "#a8a29e" : "#57534e"} />
          </Pressable>
        </View>

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
          columnWrapperStyle={viewMode === "grid" ? { gap: 16 } : undefined}
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
        className="absolute bottom-24 right-6 h-14 w-14 items-center justify-center rounded-full bg-orange-500 shadow-lg active:bg-orange-600"
      >
        <Plus size={24} color="#ffffff" />
      </Pressable>

      {/* Bottom Tab Bar */}
      <TabBar />

      {/* Add Recipe Menu */}
      <AddRecipeMenu
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onManualEntry={handleManualEntry}
        onWebsiteUrl={handleWebsiteUrl}
        onYoutubeUrl={handleYoutubeUrl}
        onYoutubeSearch={handleYoutubeSearch}
        onScanPhoto={handleScanPhoto}
        onAiChat={handleAiChat}
      />
    </View>
  );
}

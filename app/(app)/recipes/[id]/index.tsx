/**
 * Recipe Detail Screen
 *
 * Displays detailed view of a recipe with all sections.
 */

import { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Share2,
  Edit,
  Heart,
  ChefHat,
} from "lucide-react-native";

import { SourceBadge } from "@/components/recipes/list";
import {
  QuickStatsBar,
  NutritionGrid,
  IngredientsSection,
  InstructionsSection,
  YouTubeEmbed,
  DietaryConversionButtons,
  ActionButtons,
} from "@/components/recipes/detail";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const recipe = useQuery(api.recipes.get, {
    id: id as Id<"recipes">,
  });

  const toggleFavorite = useMutation(api.recipes.toggleFavorite);
  const deleteRecipe = useMutation(api.recipes.deleteRecipe);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async () => {
    if (!recipe) return;
    try {
      await toggleFavorite({ id: recipe._id });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }, [recipe, toggleFavorite]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!recipe) return;
    try {
      await deleteRecipe({ id: recipe._id });
      router.back();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      Alert.alert("Error", "Failed to delete recipe. Please try again.");
    }
  }, [recipe, deleteRecipe, router]);

  // Handle share
  const handleShare = useCallback(() => {
    // Share functionality to be implemented
    Alert.alert("Share", "Sharing will be available soon!");
  }, []);

  // Handle edit
  const handleEdit = useCallback(() => {
    // Edit functionality to be implemented
    Alert.alert("Edit", "Editing will be available soon!");
  }, []);

  // Handle cook mode
  const handleCookMode = useCallback(() => {
    if (!recipe) return;
    router.push(`/(app)/recipes/${recipe._id}/cook-mode`);
  }, [recipe, router]);

  // Handle add to shopping list
  const handleAddToShoppingList = useCallback((ingredientIndexes: number[]) => {
    // Shopping list functionality to be implemented
    Alert.alert(
      "Added to Shopping List",
      `${ingredientIndexes.length} ingredient(s) added!`
    );
  }, []);

  // Handle dietary conversions
  const handleConvertToVegan = useCallback(() => {
    Alert.alert("Convert to Vegan", "This feature will be available soon!");
  }, []);

  const handleConvertToVegetarian = useCallback(() => {
    Alert.alert("Convert to Vegetarian", "This feature will be available soon!");
  }, []);

  // Handle meal plan
  const handleAddToMealPlan = useCallback(() => {
    Alert.alert("Add to Meal Plan", "This feature will be available soon!");
  }, []);

  // Handle cookbook
  const handleAddToCookbook = useCallback(() => {
    Alert.alert("Add to Cookbook", "This feature will be available soon!");
  }, []);

  // Loading state
  if (recipe === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Recipe not found
  if (recipe === null) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 px-6 dark:bg-stone-950">
        <Text className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">
          Recipe Not Found
        </Text>
        <Text className="mb-6 text-center text-base text-stone-600 dark:text-stone-400">
          This recipe may have been deleted or you don't have access to it.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-xl bg-orange-500 px-6 py-3 active:bg-orange-600"
        >
          <Text className="font-medium text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Hero Image */}
      <View className="relative">
        <View className="aspect-[16/10] w-full overflow-hidden">
          <Image
            source={{ uri: recipe.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </View>

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-white/90 active:bg-white dark:bg-stone-900/90 dark:active:bg-stone-900"
        >
          <ArrowLeft className="h-5 w-5 text-stone-700 dark:text-stone-200" />
        </Pressable>

        {/* Action buttons */}
        <View className="absolute right-4 top-12 flex-row gap-2">
          <Pressable
            onPress={handleFavoriteToggle}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:bg-white dark:bg-stone-900/90"
          >
            <Heart
              className={`h-5 w-5 ${
                recipe.isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-stone-700 dark:text-stone-200"
              }`}
            />
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:bg-white dark:bg-stone-900/90"
          >
            <Share2 className="h-5 w-5 text-stone-700 dark:text-stone-200" />
          </Pressable>
          <Pressable
            onPress={handleEdit}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:bg-white dark:bg-stone-900/90"
          >
            <Edit className="h-5 w-5 text-stone-700 dark:text-stone-200" />
          </Pressable>
        </View>

        {/* Title overlay */}
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <View className="mb-3">
            <SourceBadge source={recipe.source} />
          </View>
          <Text className="text-2xl font-bold text-white">{recipe.title}</Text>
          {recipe.physicalCookbook && (
            <Text className="mt-1 text-white/80">
              from {recipe.physicalCookbook.name}
            </Text>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Quick stats */}
        <QuickStatsBar
          totalTime={recipe.totalTime}
          prepTime={recipe.prepTime}
          cookTime={recipe.cookTime}
          servings={recipe.servings}
        />

        {/* Cook Mode Button */}
        <Pressable
          onPress={handleCookMode}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 active:bg-orange-600"
        >
          <ChefHat className="h-5 w-5 text-white" />
          <Text className="text-lg font-semibold text-white">Start Cooking</Text>
        </Pressable>

        {/* YouTube Video */}
        {recipe.source === "youtube" && recipe.youtubeVideoId && (
          <YouTubeEmbed videoId={recipe.youtubeVideoId} title={recipe.title} />
        )}

        {/* Nutrition */}
        {recipe.nutrition && (
          <View className="mt-6">
            <NutritionGrid
              calories={recipe.nutrition.calories}
              protein={recipe.nutrition.protein}
              carbs={recipe.nutrition.carbs}
              fat={recipe.nutrition.fat}
            />
          </View>
        )}

        {/* Dietary Conversion */}
        <DietaryConversionButtons
          onConvertToVegan={handleConvertToVegan}
          onConvertToVegetarian={handleConvertToVegetarian}
        />

        {/* Ingredients */}
        <IngredientsSection
          ingredients={recipe.ingredients}
          originalServings={recipe.servings}
          onAddToShoppingList={handleAddToShoppingList}
        />

        {/* Instructions */}
        <InstructionsSection instructions={recipe.instructions} />

        {/* Notes */}
        {recipe.notes && recipe.notes.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Notes
            </Text>
            <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
              <Text className="text-amber-800 dark:text-amber-200">
                {recipe.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Dietary Tags */}
        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Dietary Tags
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {recipe.dietaryTags.map((tag) => (
                <View
                  key={tag}
                  className="rounded-full bg-stone-100 px-3 py-1.5 dark:bg-stone-800"
                >
                  <Text className="text-sm text-stone-700 dark:text-stone-300">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <ActionButtons
          onAddToMealPlan={handleAddToMealPlan}
          onAddToCookbook={handleAddToCookbook}
          onDelete={handleDelete}
        />

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

/**
 * Recipe Creation Screen
 *
 * Wrapper screen for the ManualRecipeForm modal.
 * This screen is navigated to from the AddRecipeMenu.
 */

import { useEffect } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ManualRecipeForm } from "@/components/recipes";

export default function RecipeCreateScreen() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleSuccess = (recipeId: string) => {
    // Navigate to the recipe detail page
    router.replace(`/(app)/recipes/${recipeId}`);
  };

  return (
    <View className="flex-1">
      <ManualRecipeForm
        visible={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </View>
  );
}

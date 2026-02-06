/**
 * Recipe Import Screen
 *
 * Entry point for web recipe import via URL paste.
 * Can be navigated to directly or triggered from AddRecipeMenu.
 */

import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UrlPasteModal, RecipeReviewScreen } from "@/components/import";
import type { ReviewRecipeData } from "@/components/import/types";

type ImportStep = "url" | "review";

/**
 * Extract domain name from URL for attribution
 * e.g., "https://www.seriouseats.com/recipe" -> "Serious Eats"
 */
function extractDomainName(url: string): string {
  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname;

    // Remove www. prefix
    hostname = hostname.replace(/^www\./, "");

    // Split by dots and get the main domain
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      // Get the domain name (second to last part)
      const domain = parts[parts.length - 2];
      // Capitalize first letter of each word
      return domain
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return hostname;
  } catch {
    return "Website";
  }
}

export default function RecipeImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    url?: string;
    autoExtract?: string;
  }>();

  const [step, setStep] = useState<ImportStep>("url");
  const [reviewData, setReviewData] = useState<ReviewRecipeData | null>(null);

  const createRecipe = useMutation(api.recipes.createRecipe);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleExtractionSuccess = useCallback((data: ReviewRecipeData) => {
    setReviewData(data);
    setStep("review");
  }, []);

  const handleSaveRecipe = useCallback(
    async (data: ReviewRecipeData) => {
      try {
        // Extract domain name for attribution
        const sourceName = data.sourceUrl ? extractDomainName(data.sourceUrl) : undefined;

        const recipeId = await createRecipe({
          title: data.title,
          source: "website",
          sourceUrl: data.sourceUrl,
          sourceName,
          imageUrl: data.imageUrl || "https://via.placeholder.com/400x300?text=No+Image",
          servings: data.servings,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          ingredients: data.ingredients,
          instructions: data.instructions,
          notes: "",
        });

        // Navigate to the new recipe
        router.replace(`/(app)/recipes/${recipeId}`);
      } catch (error) {
        console.error("Failed to save recipe:", error);
        // Error handling is done in RecipeReviewScreen
      }
    },
    [createRecipe, router]
  );

  const handleCancelReview = useCallback(() => {
    setStep("url");
    setReviewData(null);
  }, []);

  const handleCreateManually = useCallback(
    (sourceUrl: string) => {
      // Navigate to manual create with sourceUrl pre-filled
      router.replace({
        pathname: "/(app)/recipes/create",
        params: { sourceUrl },
      });
    },
    [router]
  );

  if (step === "review" && reviewData) {
    return (
      <RecipeReviewScreen
        recipeData={reviewData}
        onSave={handleSaveRecipe}
        onCancel={handleCancelReview}
        onCreateManually={handleCreateManually}
      />
    );
  }

  return (
    <View className="flex-1">
      <UrlPasteModal
        visible={true}
        onClose={handleClose}
        onSuccess={handleExtractionSuccess}
        initialUrl={params.url || ""}
        autoExtract={params.autoExtract === "true"}
      />
    </View>
  );
}

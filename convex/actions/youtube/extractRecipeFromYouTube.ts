"use node";

/**
 * Extract Recipe From YouTube Action
 *
 * Uses Gemini AI to extract structured recipe data from YouTube video
 * descriptions and optional captions. Includes confidence scoring.
 */

import { v } from "convex/values";
import { action } from "../../_generated/server";
import type {
  YouTubeExtractedRecipe,
  YouTubeExtractionConfidence,
} from "../../lib/youtubeTypes";
import type { IngredientCategory } from "../../lib/recipeTypes";

/**
 * Valid ingredient categories
 */
const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "meat",
  "produce",
  "dairy",
  "pantry",
  "spices",
  "condiments",
  "bread",
  "other",
];

/**
 * Gemini extraction prompt for YouTube videos
 *
 * Prioritizes transcript (spoken content) over description for accurate extraction.
 */
const YOUTUBE_EXTRACTION_PROMPT = `You are an expert recipe extraction assistant for cooking videos. Your job is to extract complete, accurate recipes from YouTube cooking videos.

IMPORTANT: The TRANSCRIPT contains the actual spoken recipe - ingredients and steps the chef mentions while cooking. The description is often just promotional text. PRIORITIZE the transcript content.

GROUNDING INSTRUCTION: If the video doesn't mention specific quantities or measurements, USE GOOGLE SEARCH to look up similar recipes and provide reasonable estimates based on standard recipes. For example:
- If they say "add flour" for fried cheese curds, search for "fried cheese curds recipe" to find typical flour amounts
- If cooking times aren't mentioned, search for the dish to find standard cooking times
- Fill in missing steps based on how similar dishes are typically prepared

Extract ALL ingredients mentioned, including:
- Main ingredients with quantities (e.g., "2 cups flour", "1 pound chicken")
- Seasonings and spices (e.g., "salt and pepper to taste", "1 tsp paprika")
- Oils and fats for cooking (e.g., "2 tbsp olive oil", "oil for frying")
- Liquids (e.g., "1 cup chicken broth", "splash of wine")
- Batter/coating ingredients (flour, eggs, breadcrumbs, etc.)

For quantities - SEARCH for similar recipes if not specified:
- If they say "a pinch" → quantity: 0.25, unit: "tsp"
- If they say "some" or "a bit" → SEARCH for typical amount in similar recipes
- If they say "to taste" → quantity: 1, unit: "to taste"
- If no quantity given → SEARCH for standard recipe amounts

Return a JSON object with this exact structure:
{
  "isRecipe": true,
  "title": "Clean recipe title without channel name or episode info",
  "ingredients": [
    {"name": "ingredient name", "quantity": 2, "unit": "cup", "category": "pantry"}
  ],
  "instructions": [
    "Step 1: Detailed instruction",
    "Step 2: Next step"
  ],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "confidence": "high",
  "extractionNotes": "Notes about extraction"
}

INGREDIENT CATEGORIES:
- meat: beef, chicken, pork, fish, seafood, bacon, sausage, turkey, lamb, shrimp
- produce: fruits, vegetables, fresh herbs (basil, parsley, cilantro, green onions)
- dairy: milk, cheese, butter, cream, yogurt, eggs, sour cream
- pantry: flour, sugar, oil, pasta, rice, canned goods, beans, broth, vinegar, cornstarch
- spices: dried herbs, spices, seasoning blends, salt, pepper, garlic powder
- condiments: sauces, ketchup, mustard, mayo, dressings, soy sauce, hot sauce
- bread: bread, rolls, tortillas, crackers, breadcrumbs, buns
- other: anything else

CONFIDENCE LEVELS:
- "high": Found clear ingredients list and cooking steps in transcript
- "medium": Found recipe but some quantities/steps inferred
- "low": Cooking video but recipe details are vague

If NOT a recipe video, return: {"isRecipe": false, "confidence": "high", "extractionNotes": "Not a recipe video"}

VIDEO TITLE: `;

/**
 * Normalize confidence level
 */
function normalizeConfidence(value: unknown): YouTubeExtractionConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "low";
}

/**
 * Normalize ingredient category
 */
function normalizeCategory(value: unknown): IngredientCategory {
  if (
    typeof value === "string" &&
    INGREDIENT_CATEGORIES.includes(value as IngredientCategory)
  ) {
    return value as IngredientCategory;
  }
  return "other";
}

/**
 * Parse Gemini response for YouTube recipe extraction
 */
function parseExtractionResponse(
  response: unknown,
  videoTitle: string
): { isRecipe: boolean; recipe: YouTubeExtractedRecipe | null } {
  if (!response || typeof response !== "object") {
    return { isRecipe: false, recipe: null };
  }

  const data = response as Record<string, unknown>;

  // Check if it's not a recipe video
  if (data.isRecipe === false) {
    return { isRecipe: false, recipe: null };
  }

  // Extract title (use video title as fallback)
  const title =
    typeof data.title === "string" && data.title.trim().length > 0
      ? data.title.trim()
      : videoTitle;

  // Extract ingredients
  const ingredients: YouTubeExtractedRecipe["ingredients"] = [];
  if (Array.isArray(data.ingredients)) {
    for (const ing of data.ingredients) {
      if (ing && typeof ing === "object") {
        const ingObj = ing as Record<string, unknown>;
        ingredients.push({
          name: typeof ingObj.name === "string" ? ingObj.name : "Unknown",
          quantity: typeof ingObj.quantity === "number" ? ingObj.quantity : 1,
          unit: typeof ingObj.unit === "string" ? ingObj.unit : "item",
          category: normalizeCategory(ingObj.category),
        });
      }
    }
  }

  // Extract instructions
  const instructions: string[] = [];
  if (Array.isArray(data.instructions)) {
    for (const step of data.instructions) {
      if (typeof step === "string" && step.trim().length > 0) {
        instructions.push(step.trim());
      }
    }
  }

  // Extract times and servings
  const servings = typeof data.servings === "number" ? data.servings : 4;
  const prepTime = typeof data.prepTime === "number" ? data.prepTime : 0;
  const cookTime = typeof data.cookTime === "number" ? data.cookTime : 0;
  const confidence = normalizeConfidence(data.confidence);
  const extractionNotes =
    typeof data.extractionNotes === "string" ? data.extractionNotes : undefined;

  // Determine if we have enough data for a recipe
  const hasValidRecipe = ingredients.length > 0 || instructions.length > 0;

  if (!hasValidRecipe) {
    return { isRecipe: false, recipe: null };
  }

  return {
    isRecipe: true,
    recipe: {
      title,
      ingredients,
      instructions,
      servings,
      prepTime,
      cookTime,
      confidence,
      extractionNotes,
    },
  };
}

/**
 * Extract recipe from YouTube video using Gemini AI
 *
 * @param videoTitle - Title of the video
 * @param description - Video description text
 * @param captionsText - Optional transcript/captions text
 * @returns Extraction result with recipe or error
 */
export const extractRecipeFromYouTube = action({
  args: {
    videoTitle: v.string(),
    description: v.string(),
    captionsText: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    isRecipe: boolean;
    recipe: YouTubeExtractedRecipe | null;
    error: { type: string; message: string } | null;
  }> => {
    const { videoTitle, description, captionsText } = args;

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured");
      return {
        success: false,
        isRecipe: false,
        recipe: null,
        error: {
          type: "CONFIGURATION_ERROR",
          message: "AI extraction is not configured",
        },
      };
    }

    // Build the content to analyze - PRIORITIZE TRANSCRIPT
    let contentToAnalyze = `${YOUTUBE_EXTRACTION_PROMPT}${videoTitle}\n\n`;

    // Add transcript FIRST if available (this is the primary source)
    if (captionsText && captionsText.trim().length > 0) {
      // Limit captions to avoid token limits but keep as much as possible
      const truncatedCaptions = captionsText.substring(0, 20000);
      contentToAnalyze += `VIDEO TRANSCRIPT (PRIMARY SOURCE - extract recipe from this):\n${truncatedCaptions}\n\n`;
    }

    // Add description as secondary/supplementary info
    contentToAnalyze += `VIDEO DESCRIPTION (supplementary info):\n${description}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: contentToAnalyze,
                  },
                ],
              },
            ],
            // Enable Google Search grounding to fill in missing recipe details
            tools: [
              {
                google_search: {},
              },
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.95,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        return {
          success: false,
          isRecipe: false,
          recipe: null,
          error: {
            type: "EXTRACTION_FAILED",
            message: `AI extraction failed: ${response.status}`,
          },
        };
      }

      const responseData = await response.json();

      // Extract text content from Gemini response
      const textContent =
        responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        return {
          success: false,
          isRecipe: false,
          recipe: null,
          error: {
            type: "EXTRACTION_FAILED",
            message: "AI returned empty response",
          },
        };
      }

      // Parse JSON response
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(textContent);
      } catch {
        console.error("Failed to parse Gemini response:", textContent);
        return {
          success: false,
          isRecipe: false,
          recipe: null,
          error: {
            type: "EXTRACTION_FAILED",
            message: "AI response was not valid JSON",
          },
        };
      }

      // Parse extraction result
      const { isRecipe, recipe } = parseExtractionResponse(
        parsedJson,
        videoTitle
      );

      return {
        success: true,
        isRecipe,
        recipe,
        error: null,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          isRecipe: false,
          recipe: null,
          error: {
            type: "TIMEOUT",
            message: "AI extraction timed out. Please try again.",
          },
        };
      }

      console.error("Error in YouTube recipe extraction:", error);
      return {
        success: false,
        isRecipe: false,
        recipe: null,
        error: {
          type: "EXTRACTION_FAILED",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  },
});

/**
 * Download and store YouTube video thumbnail
 *
 * Fetches the highest quality thumbnail and stores in Convex file storage.
 */
export const downloadThumbnail = action({
  args: {
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    storageId: string | null;
    error: { type: string; message: string } | null;
  }> => {
    const { thumbnailUrl } = args;

    if (!thumbnailUrl || thumbnailUrl.trim().length === 0) {
      return {
        success: false,
        storageId: null,
        error: {
          type: "INVALID_URL",
          message: "Thumbnail URL is required",
        },
      };
    }

    try {
      // Fetch the thumbnail
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(thumbnailUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          storageId: null,
          error: {
            type: "FETCH_FAILED",
            message: `Failed to download thumbnail: ${response.status}`,
          },
        };
      }

      // Get the image as blob
      const blob = await response.blob();

      // Store in Convex file storage
      const storageId = await ctx.storage.store(blob);

      return {
        success: true,
        storageId,
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          storageId: null,
          error: {
            type: "TIMEOUT",
            message: "Thumbnail download timed out",
          },
        };
      }

      console.error("Error downloading thumbnail:", error);
      return {
        success: false,
        storageId: null,
        error: {
          type: "FETCH_FAILED",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
  },
});

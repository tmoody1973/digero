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
 * Optimized for video descriptions and transcripts.
 */
const YOUTUBE_EXTRACTION_PROMPT = `You are a recipe extraction assistant specialized in cooking videos. Analyze the following YouTube video description and optional transcript to extract recipe information.

Return a JSON object with the following structure (use exactly these field names):
{
  "isRecipe": true/false,
  "title": "Recipe title (use video title if not in description)",
  "ingredients": [
    {
      "name": "Ingredient name",
      "quantity": 1.5,
      "unit": "cup",
      "category": "one of: meat, produce, dairy, pantry, spices, condiments, bread, other"
    }
  ],
  "instructions": ["Step 1 text", "Step 2 text"],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "confidence": "high/medium/low",
  "extractionNotes": "Any notes about the extraction quality or missing info"
}

Categorization guidelines for ingredients:
- meat: beef, chicken, pork, fish, seafood, bacon, sausage, turkey, lamb, etc.
- produce: fruits, vegetables, fresh herbs (basil, parsley, cilantro)
- dairy: milk, cheese, butter, cream, yogurt, eggs, sour cream
- pantry: flour, sugar, oil, pasta, rice, canned goods, beans, broth, vinegar
- spices: dried herbs, spices, seasoning blends, salt, pepper
- condiments: sauces, ketchup, mustard, mayo, dressings, soy sauce
- bread: bread, rolls, tortillas, crackers, breadcrumbs
- other: anything that doesn't fit above

Confidence levels:
- "high": Clear recipe with explicit ingredients list and steps
- "medium": Recipe mentioned but ingredients/steps need inference
- "low": Cooking content but no clear recipe structure

If this is NOT a recipe video (e.g., vlog, product review, non-cooking content), return:
{"isRecipe": false, "confidence": "high", "extractionNotes": "Not a recipe video"}

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

    // Build the content to analyze
    let contentToAnalyze = `${YOUTUBE_EXTRACTION_PROMPT}${videoTitle}\n\nVIDEO DESCRIPTION:\n${description}`;

    if (captionsText && captionsText.trim().length > 0) {
      // Limit captions to avoid token limits
      const truncatedCaptions = captionsText.substring(0, 15000);
      contentToAnalyze += `\n\nVIDEO TRANSCRIPT (partial):\n${truncatedCaptions}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
            generationConfig: {
              temperature: 0.1,
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

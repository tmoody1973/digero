/**
 * Process Recipe Image Action
 *
 * Uses Gemini Vision API to extract structured recipe data from
 * a cookbook page image. Returns structured JSON matching the Recipe schema.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";

/**
 * Ingredient category type
 */
type IngredientCategory =
  | "meat"
  | "produce"
  | "dairy"
  | "pantry"
  | "spices"
  | "condiments"
  | "bread"
  | "other";

/**
 * Extracted ingredient from recipe page
 */
interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Result of recipe extraction from image
 */
export interface RecipeExtractionResult {
  success: boolean;
  data?: {
    title: string;
    ingredients: ExtractedIngredient[];
    instructions: string[];
    servings: number;
    prepTime: number;
    cookTime: number;
    pageNumber: string | null;
  };
  error?: {
    type: string;
    message: string;
  };
}

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
 * Gemini extraction prompt for cookbook pages
 */
const EXTRACTION_PROMPT = `You are a recipe extraction assistant. Analyze this cookbook page image and extract recipe data.

Return a JSON object with this exact structure:
{
  "success": true,
  "title": "Recipe Title",
  "ingredients": [
    {"name": "ingredient name", "quantity": 1.5, "unit": "cup", "category": "produce"}
  ],
  "instructions": ["Step 1...", "Step 2..."],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "pageNumber": "42"
}

Guidelines:
- Extract the recipe title exactly as shown
- For ingredients:
  - Parse quantity as a number (use 1 if not specified)
  - Extract unit (cup, tsp, tbsp, oz, lb, etc.) or use "item" if none
  - Categorize: meat (beef/chicken/pork/fish/seafood), produce (fruits/vegetables/fresh herbs), dairy (milk/cheese/butter/cream/eggs), pantry (flour/sugar/oil/pasta/rice/canned goods), spices (dried herbs/spices/seasonings), condiments (sauces/vinegar/mustard), bread (bread/rolls/tortillas), other (anything else)
- For instructions:
  - Extract each step as a separate string
  - Include all steps in order
- For times: Convert to minutes (e.g., "1 hour" = 60)
- For pageNumber: Extract if visible on the page, or null if not found

If this is NOT a recipe page (table of contents, intro, etc.), return:
{"success": false, "error": "NOT_A_RECIPE", "message": "This page does not contain a recipe"}

If the image quality is too poor to read, return:
{"success": false, "error": "POOR_QUALITY", "message": "Image quality is too poor to extract recipe"}`;

/**
 * Validate and normalize ingredient category
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
 * Parse Gemini response into structured result
 */
function parseGeminiResponse(response: unknown): RecipeExtractionResult {
  if (!response || typeof response !== "object") {
    return {
      success: false,
      error: {
        type: "PARSE_ERROR",
        message: "Failed to parse AI response",
      },
    };
  }

  const data = response as Record<string, unknown>;

  // Check for error response
  if (data.success === false) {
    return {
      success: false,
      error: {
        type: String(data.error || "EXTRACTION_FAILED"),
        message: String(data.message || "Failed to extract recipe"),
      },
    };
  }

  // Extract title (required)
  const title = typeof data.title === "string" ? data.title.trim() : null;
  if (!title) {
    return {
      success: false,
      error: {
        type: "NO_TITLE",
        message: "Could not extract recipe title",
      },
    };
  }

  // Extract optional fields with defaults
  const servings = typeof data.servings === "number" ? data.servings : 4;
  const prepTime = typeof data.prepTime === "number" ? data.prepTime : 0;
  const cookTime = typeof data.cookTime === "number" ? data.cookTime : 0;
  const pageNumber =
    typeof data.pageNumber === "string" ? data.pageNumber : null;

  // Extract instructions
  let instructions: string[] = [];
  if (Array.isArray(data.instructions)) {
    instructions = data.instructions
      .filter((s): s is string => typeof s === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Extract ingredients
  let ingredients: ExtractedIngredient[] = [];
  if (Array.isArray(data.ingredients)) {
    ingredients = data.ingredients
      .map((ing: unknown) => {
        if (!ing || typeof ing !== "object") {
          return null;
        }
        const ingObj = ing as Record<string, unknown>;
        return {
          name: typeof ingObj.name === "string" ? ingObj.name.trim() : "",
          quantity: typeof ingObj.quantity === "number" ? ingObj.quantity : 1,
          unit: typeof ingObj.unit === "string" ? ingObj.unit : "item",
          category: normalizeCategory(ingObj.category),
        };
      })
      .filter(
        (ing): ing is ExtractedIngredient => ing !== null && ing.name.length > 0
      );
  }

  return {
    success: true,
    data: {
      title,
      ingredients,
      instructions,
      servings,
      prepTime,
      cookTime,
      pageNumber,
    },
  };
}

/**
 * Process Recipe Image Action
 *
 * Sends a cookbook page image to Gemini Vision API for recipe extraction.
 * Accepts base64-encoded image data.
 *
 * @param imageBase64 - Base64-encoded image data (without data URI prefix)
 * @param mimeType - Image MIME type (image/jpeg, image/png, etc.)
 * @returns Extraction result with recipe data or error
 */
export const processRecipeImage = action({
  args: {
    imageBase64: v.string(),
    mimeType: v.string(),
  },
  handler: async (_, args): Promise<RecipeExtractionResult> => {
    const { imageBase64, mimeType } = args;

    // Get the Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured");
      return {
        success: false,
        error: {
          type: "CONFIG_ERROR",
          message: "AI extraction is not configured",
        },
      };
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // Call Gemini Vision API
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
                    text: EXTRACTION_PROMPT,
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: imageBase64,
                    },
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
          error: {
            type: "API_ERROR",
            message: `AI extraction failed: ${response.status} ${response.statusText}`,
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
          error: {
            type: "EMPTY_RESPONSE",
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
          error: {
            type: "PARSE_ERROR",
            message: "AI response was not valid JSON",
          },
        };
      }

      // Convert to RecipeExtractionResult
      return parseGeminiResponse(parsedJson);
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          error: {
            type: "TIMEOUT",
            message: "AI extraction timed out. Please try again.",
          },
        };
      }

      return {
        success: false,
        error: {
          type: "EXTRACTION_FAILED",
          message: `AI extraction error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      };
    }
  },
});

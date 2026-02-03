/**
 * Extract Recipe With Gemini Action
 *
 * Uses Gemini AI to extract recipe data from HTML content when
 * structured data parsing (JSON-LD, microdata) fails.
 * Includes ingredient categorization and confidence scoring.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import type {
  ExtractedRecipeData,
  Confidence,
  IngredientCategory,
  RawIngredient,
} from "../lib/recipeTypes";

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
 * Gemini extraction prompt template
 *
 * Instructs Gemini to extract structured recipe data from HTML
 * with ingredient categorization and confidence scoring.
 */
const EXTRACTION_PROMPT = `You are a recipe extraction assistant. Analyze the following HTML content and extract recipe information.

Return a JSON object with the following structure (use exactly these field names):
{
  "title": "Recipe title",
  "imageUrl": "URL of the recipe image or null",
  "ingredients": [
    {
      "raw": "Original ingredient text",
      "parsed": {
        "name": "Ingredient name",
        "quantity": 1.5,
        "unit": "cup",
        "category": "one of: meat, produce, dairy, pantry, spices, condiments, bread, other"
      }
    }
  ],
  "instructions": ["Step 1 text", "Step 2 text"],
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "confidence": {
    "title": "high/medium/low",
    "imageUrl": "high/medium/low",
    "ingredients": "high/medium/low",
    "instructions": "high/medium/low",
    "servings": "high/medium/low",
    "prepTime": "high/medium/low",
    "cookTime": "high/medium/low"
  }
}

Guidelines:
- For ingredients, parse the quantity as a number (use 1 if not specified)
- For units, extract the unit or use "item" if none specified
- Categorize each ingredient:
  - meat: beef, chicken, pork, fish, seafood, bacon, sausage, etc.
  - produce: fruits, vegetables, herbs (fresh)
  - dairy: milk, cheese, butter, cream, yogurt, eggs
  - pantry: flour, sugar, oil, pasta, rice, canned goods, beans, etc.
  - spices: dried herbs, spices, seasoning blends
  - condiments: sauces, vinegar, mustard, mayo, dressings
  - bread: bread, rolls, tortillas, crackers
  - other: anything else
- For time values, convert to minutes (e.g., "1 hour" = 60)
- Use "low" confidence if the data seems uncertain or incomplete
- Use "medium" confidence for data that seems reasonable but not explicitly stated
- Use "high" confidence for clearly stated information

If no recipe is found in the HTML, return: {"error": "NO_RECIPE_FOUND"}

HTML Content:
`;

/**
 * Clean HTML content for AI processing
 * Removes scripts, styles, and excessive whitespace
 */
function cleanHtmlForAI(html: string): string {
  // Remove script and style tags with their contents
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Remove most HTML tags but keep text content
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Limit length to avoid token limits (keep first ~50K characters)
  if (cleaned.length > 50000) {
    cleaned = cleaned.substring(0, 50000);
  }

  return cleaned;
}

/**
 * Validate and normalize confidence level
 */
function normalizeConfidence(value: unknown): Confidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "low";
}

/**
 * Validate and normalize ingredient category
 */
function normalizeCategory(value: unknown): IngredientCategory {
  if (typeof value === "string" && INGREDIENT_CATEGORIES.includes(value as IngredientCategory)) {
    return value as IngredientCategory;
  }
  return "other";
}

/**
 * Parse Gemini response into ExtractedRecipeData
 */
function parseGeminiResponse(response: unknown): ExtractedRecipeData | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const data = response as Record<string, unknown>;

  // Check for error response
  if (data.error === "NO_RECIPE_FOUND") {
    return null;
  }

  // Extract title (required)
  const title = typeof data.title === "string" ? data.title : null;
  if (!title) {
    return null;
  }

  // Extract optional fields
  const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl : null;
  const servings = typeof data.servings === "number" ? data.servings : 4;
  const prepTime = typeof data.prepTime === "number" ? data.prepTime : 0;
  const cookTime = typeof data.cookTime === "number" ? data.cookTime : 0;

  // Extract instructions
  let instructions: string[] = [];
  if (Array.isArray(data.instructions)) {
    instructions = data.instructions
      .filter((s): s is string => typeof s === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Extract ingredients
  let ingredients: RawIngredient[] = [];
  if (Array.isArray(data.ingredients)) {
    ingredients = data.ingredients.map((ing: unknown) => {
      if (typeof ing === "string") {
        return { raw: ing, parsed: null };
      }
      if (ing && typeof ing === "object") {
        const ingObj = ing as Record<string, unknown>;
        const raw =
          typeof ingObj.raw === "string" ? ingObj.raw : JSON.stringify(ing);

        let parsed = null;
        if (ingObj.parsed && typeof ingObj.parsed === "object") {
          const p = ingObj.parsed as Record<string, unknown>;
          parsed = {
            name: typeof p.name === "string" ? p.name : raw,
            quantity: typeof p.quantity === "number" ? p.quantity : 1,
            unit: typeof p.unit === "string" ? p.unit : "item",
            category: normalizeCategory(p.category),
          };
        }

        return { raw, parsed };
      }
      return { raw: String(ing), parsed: null };
    });
  }

  // Extract confidence levels
  const confidence: Record<string, Confidence> = {
    title: "medium",
    imageUrl: "medium",
    ingredients: "medium",
    instructions: "medium",
    servings: "medium",
    prepTime: "medium",
    cookTime: "medium",
  };

  if (data.confidence && typeof data.confidence === "object") {
    const conf = data.confidence as Record<string, unknown>;
    for (const key of Object.keys(confidence)) {
      confidence[key] = normalizeConfidence(conf[key]);
    }
  }

  return {
    title,
    imageUrl,
    ingredients,
    instructions,
    servings,
    prepTime,
    cookTime,
    confidence,
    extractionMethod: "ai",
  };
}

/**
 * Extract recipe data from HTML using Gemini AI
 *
 * This action:
 * 1. Cleans HTML content for processing
 * 2. Calls Gemini API with extraction prompt
 * 3. Parses and validates the response
 * 4. Returns structured recipe data with confidence scores
 *
 * @param html - Raw HTML content from the recipe page
 * @returns Extraction result with recipe data or error
 */
export const extractRecipeWithGemini = action({
  args: {
    html: v.string(),
  },
  handler: async (
    _,
    args
  ): Promise<{
    success: boolean;
    data: ExtractedRecipeData | null;
    error: { type: string; message: string } | null;
  }> => {
    const { html } = args;

    // Get the Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured");
      return {
        success: false,
        data: null,
        error: {
          type: "EXTRACTION_FAILED",
          message: "AI extraction is not configured",
        },
      };
    }

    // Clean HTML for processing
    const cleanedHtml = cleanHtmlForAI(html);

    // Create abort controller for 60-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // Call Gemini API
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
                    text: EXTRACTION_PROMPT + cleanedHtml,
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
          data: null,
          error: {
            type: "EXTRACTION_FAILED",
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
          data: null,
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
        console.error("Failed to parse Gemini response as JSON:", textContent);
        return {
          success: false,
          data: null,
          error: {
            type: "EXTRACTION_FAILED",
            message: "AI response was not valid JSON",
          },
        };
      }

      // Convert to ExtractedRecipeData
      const extractedData = parseGeminiResponse(parsedJson);

      if (!extractedData) {
        return {
          success: false,
          data: null,
          error: {
            type: "NO_RECIPE_FOUND",
            message: "No recipe found in the page content",
          },
        };
      }

      return {
        success: true,
        data: extractedData,
        error: null,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          data: null,
          error: {
            type: "TIMEOUT",
            message: "AI extraction timed out. Please try again.",
          },
        };
      }

      return {
        success: false,
        data: null,
        error: {
          type: "EXTRACTION_FAILED",
          message: `AI extraction error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      };
    }
  },
});

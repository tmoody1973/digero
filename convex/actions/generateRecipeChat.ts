"use node";

/**
 * Generate Recipe Chat Action
 *
 * Uses Gemini 2.0 Flash AI to generate recipe suggestions from user messages.
 * Supports multimodal input (text and images) for ingredient identification.
 * Returns structured JSON with recipes, clarification questions, and meal plans.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";

/**
 * System prompt for Gemini - supports both conversation and recipe generation
 */
const RECIPE_SYSTEM_PROMPT = `You are Sous Chef, a friendly and knowledgeable culinary assistant. You help users with all things cooking - from casual conversation about food to generating detailed recipes.

## Response Modes

Determine the user's intent and respond appropriately:

### Conversational Mode
Use this for general cooking questions, food tips, ingredient questions, casual chat about food, encouragement, or when asking clarifying questions.

For conversational responses, return JSON with response_type: "conversation":
{"response_type":"conversation","summary":"Your conversational response here. Be friendly, helpful, and informative.","clarification_questions":["Optional follow-up questions if needed"]}

### Recipe Mode
Use this when the user explicitly asks for a recipe, lists ingredients wanting meal ideas, asks what they can make, requests a meal plan, or sends a photo of ingredients.

For recipe responses, return JSON with response_type: "recipes":
{"response_type":"recipes","summary":"Brief, friendly intro","clarification_questions":[],"recipes":[{"id":"string","name":"string","servings":4,"estimated_total_time_minutes":30,"difficulty":"easy|medium|hard","tags":[],"why_it_works":"string","ingredients":[{"name":"string","quantity":"string","unit":"string","is_optional":false,"note":"string"}],"steps":[{"step_number":1,"instruction":"string","estimated_time_minutes":0,"notes":"string"}],"variations":[{"name":"string","description":"string","type":"other"}],"equipment":[],"nutrition_notes":"string","leftover_and_waste_tips":"string"}],"meal_plan":null}

## Personality
- Friendly and encouraging - cooking should be fun!
- Knowledgeable but not condescending
- Practical - focus on what home cooks can actually do
- Patient with beginners, engaging with experienced cooks

## Guidelines
- Keep conversational responses concise but helpful
- Use everyday language, not chef jargon
- For recipes: mark extra ingredients as is_optional: true, provide 5-12 clear steps
- Never suggest unsafe practices
- Always output valid JSON with double-quoted keys and strings, no comments or trailing commas`;

/**
 * Conversation history message type
 */
interface ConversationMessage {
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
}

/**
 * AI Recipe response structure
 */
interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  is_optional: boolean;
  note?: string;
}

interface RecipeStep {
  step_number: number;
  instruction: string;
  estimated_time_minutes?: number;
  notes?: string;
}

interface RecipeVariation {
  name: string;
  description: string;
  type: string;
}

interface Recipe {
  id: string;
  name: string;
  servings: number;
  estimated_total_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  why_it_works: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  variations?: RecipeVariation[];
  equipment?: string[];
  nutrition_notes?: string;
  leftover_and_waste_tips?: string;
}

interface MealPlanMeal {
  meal_type: string;
  recipe_id: string;
  notes?: string;
}

interface MealPlan {
  type: "single_meal" | "day" | "week" | "custom";
  meals: MealPlanMeal[];
}

interface RecipeChatResponse {
  response_type: "conversation" | "recipes";
  summary: string;
  clarification_questions: string[];
  recipes: Recipe[];
  meal_plan: MealPlan | null;
}

/**
 * Parse and validate Gemini response
 */
function parseGeminiResponse(responseText: string): RecipeChatResponse | null {
  try {
    const parsed = JSON.parse(responseText);

    // Validate required fields
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    // Determine response type
    const responseType = parsed.response_type === "recipes" ? "recipes" : "conversation";

    // Set defaults for missing fields
    const response: RecipeChatResponse = {
      response_type: responseType,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      clarification_questions: Array.isArray(parsed.clarification_questions)
        ? parsed.clarification_questions.filter(
            (q: unknown) => typeof q === "string"
          )
        : [],
      recipes: [],
      meal_plan: null,
    };

    // Parse recipes array
    if (Array.isArray(parsed.recipes)) {
      response.recipes = parsed.recipes
        .filter((r: unknown) => r && typeof r === "object")
        .map((r: Record<string, unknown>) => ({
          id: typeof r.id === "string" ? r.id : `recipe_${Date.now()}`,
          name: typeof r.name === "string" ? r.name : "Untitled Recipe",
          servings: typeof r.servings === "number" ? r.servings : 4,
          estimated_total_time_minutes:
            typeof r.estimated_total_time_minutes === "number"
              ? r.estimated_total_time_minutes
              : 30,
          difficulty: ["easy", "medium", "hard"].includes(
            r.difficulty as string
          )
            ? (r.difficulty as "easy" | "medium" | "hard")
            : "medium",
          tags: Array.isArray(r.tags)
            ? r.tags.filter((t: unknown) => typeof t === "string")
            : [],
          why_it_works:
            typeof r.why_it_works === "string" ? r.why_it_works : "",
          ingredients: Array.isArray(r.ingredients)
            ? r.ingredients.map((ing: Record<string, unknown>) => ({
                name: typeof ing.name === "string" ? ing.name : "",
                quantity: typeof ing.quantity === "string" ? ing.quantity : "1",
                unit: typeof ing.unit === "string" ? ing.unit : "item",
                is_optional: ing.is_optional === true,
                note: typeof ing.note === "string" ? ing.note : undefined,
              }))
            : [],
          steps: Array.isArray(r.steps)
            ? r.steps.map((step: Record<string, unknown>, idx: number) => ({
                step_number:
                  typeof step.step_number === "number"
                    ? step.step_number
                    : idx + 1,
                instruction:
                  typeof step.instruction === "string" ? step.instruction : "",
                estimated_time_minutes:
                  typeof step.estimated_time_minutes === "number"
                    ? step.estimated_time_minutes
                    : undefined,
                notes:
                  typeof step.notes === "string" ? step.notes : undefined,
              }))
            : [],
          variations: Array.isArray(r.variations)
            ? r.variations.map((v: Record<string, unknown>) => ({
                name: typeof v.name === "string" ? v.name : "",
                description:
                  typeof v.description === "string" ? v.description : "",
                type: typeof v.type === "string" ? v.type : "other",
              }))
            : undefined,
          equipment: Array.isArray(r.equipment)
            ? r.equipment.filter((e: unknown) => typeof e === "string")
            : undefined,
          nutrition_notes:
            typeof r.nutrition_notes === "string"
              ? r.nutrition_notes
              : undefined,
          leftover_and_waste_tips:
            typeof r.leftover_and_waste_tips === "string"
              ? r.leftover_and_waste_tips
              : undefined,
        }));
    }

    // Parse meal plan
    if (parsed.meal_plan && typeof parsed.meal_plan === "object") {
      const mp = parsed.meal_plan as Record<string, unknown>;
      response.meal_plan = {
        type: ["single_meal", "day", "week", "custom"].includes(mp.type as string)
          ? (mp.type as "single_meal" | "day" | "week" | "custom")
          : "single_meal",
        meals: Array.isArray(mp.meals)
          ? mp.meals.map((m: Record<string, unknown>) => ({
              meal_type:
                typeof m.meal_type === "string" ? m.meal_type : "dinner",
              recipe_id:
                typeof m.recipe_id === "string" ? m.recipe_id : "",
              notes: typeof m.notes === "string" ? m.notes : undefined,
            }))
          : [],
      };
    }

    return response;
  } catch {
    return null;
  }
}

/**
 * Build Gemini API request contents
 */
function buildGeminiContents(
  message: string,
  imageBase64: string | undefined,
  conversationHistory: ConversationMessage[] | undefined
): Array<{ role: string; parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> }> {
  const contents: Array<{
    role: string;
    parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>;
  }> = [];

  // Add conversation history if provided
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
  }

  // Build current message parts
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

  // Add text if provided
  if (message.trim()) {
    parts.push({ text: message });
  }

  // Add image if provided
  if (imageBase64) {
    // Extract mime type and data from data URL
    const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      parts.push({
        inline_data: {
          mime_type: matches[1],
          data: matches[2],
        },
      });
    }
  }

  // Add prompt context if no text provided but image exists
  if (!message.trim() && imageBase64) {
    parts.unshift({
      text: "Please identify the ingredients in this image and suggest recipes I can make with them.",
    });
  }

  contents.push({
    role: "user",
    parts,
  });

  return contents;
}

/**
 * Generate recipe suggestions using Gemini 2.0 Flash
 *
 * This action:
 * 1. Builds request with conversation history and multimodal input
 * 2. Calls Gemini API with recipe system prompt
 * 3. Parses and validates the JSON response
 * 4. Returns structured recipe data or error
 *
 * @param message - User's text message
 * @param imageBase64 - Optional base64 encoded image (data URL format)
 * @param conversationHistory - Optional array of previous messages for context
 * @returns Result with recipe data or error
 */
export const generateRecipeChat = action({
  args: {
    message: v.string(),
    imageBase64: v.optional(v.string()),
    conversationHistory: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          text: v.string(),
          imageUrl: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (
    _,
    args
  ): Promise<{
    success: boolean;
    data: RecipeChatResponse | null;
    error: { type: string; message: string } | null;
  }> => {
    const { message, imageBase64, conversationHistory } = args;

    // Validate input
    if (!message.trim() && !imageBase64) {
      return {
        success: false,
        data: null,
        error: {
          type: "VALIDATION_ERROR",
          message: "Message or image is required",
        },
      };
    }

    // Get the Gemini API key
    const apiKey = process.env.GEMINI_API_KEY_CHAT || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY_CHAT / GEMINI_API_KEY not configured");
      return {
        success: false,
        data: null,
        error: {
          type: "CONFIG_ERROR",
          message: "AI recipe generation is not configured",
        },
      };
    }

    // Create abort controller for 60-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // Build request contents
      const contents = buildGeminiContents(message, imageBase64, conversationHistory);

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: RECIPE_SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
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
        console.error("Gemini API error:", response.status, errorText);

        // Handle rate limiting specifically
        if (response.status === 429) {
          return {
            success: false,
            data: null,
            error: {
              type: "RATE_LIMITED",
              message: "Sous Chef is taking a short break due to high demand. Please try again in a minute.",
            },
          };
        }

        return {
          success: false,
          data: null,
          error: {
            type: "API_ERROR",
            message: `AI service error: ${response.status} ${response.statusText}`,
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
            type: "EMPTY_RESPONSE",
            message: "AI returned an empty response. Please try again.",
          },
        };
      }

      // Parse JSON response
      const parsedData = parseGeminiResponse(textContent);

      if (!parsedData) {
        console.error("Failed to parse Gemini response:", textContent);
        return {
          success: false,
          data: null,
          error: {
            type: "PARSE_ERROR",
            message: "Failed to parse AI response. Please try again.",
          },
        };
      }

      return {
        success: true,
        data: parsedData,
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
            message: "AI request timed out. Please try again.",
          },
        };
      }

      return {
        success: false,
        data: null,
        error: {
          type: "UNKNOWN_ERROR",
          message: `AI request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      };
    }
  },
});

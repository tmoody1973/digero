"use node";

/**
 * Convert Recipe Diet Action
 *
 * Uses Gemini AI to intelligently convert recipes to vegetarian or vegan,
 * updating both ingredients and instructions appropriately.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type DietType = "vegetarian" | "vegan" | "gluten-free";

interface ConvertedIngredient {
  original: string;
  converted: string;
  changed: boolean;
  reason?: string;
}

interface ConversionResult {
  success: boolean;
  dietType: DietType;
  ingredients: ConvertedIngredient[];
  instructions: string[];
  instructionChanges: string[];
  tips: string[];
  error?: string;
}

/**
 * Build the conversion prompt with detailed context
 */
function buildConversionPrompt(
  dietType: DietType,
  ingredients: { name: string; quantity: number; unit: string }[],
  instructions: string[],
  recipeTitle: string
): string {
  const dietDescriptions: Record<DietType, string> = {
    vegan: "VEGAN (no animal products at all - no meat, fish, dairy, eggs, honey, or any animal-derived ingredients)",
    vegetarian: "VEGETARIAN (no meat or fish, but dairy and eggs are allowed)",
    "gluten-free": "GLUTEN-FREE (no wheat, barley, rye, or any gluten-containing ingredients)",
  };

  const dietGuidelines: Record<DietType, string[]> = {
    vegan: [
      "Replace meat/fish with appropriate plant proteins (tofu, tempeh, seitan, legumes, mushrooms)",
      "Replace dairy with plant-based alternatives (oat milk, coconut cream, nutritional yeast, cashew cream)",
      "Replace eggs with flax eggs, chia eggs, or commercial egg replacers depending on the use",
      "Replace honey with maple syrup or agave",
    ],
    vegetarian: [
      "Replace meat/fish with appropriate vegetarian proteins (tofu, tempeh, legumes, mushrooms, cheese, eggs)",
      "Dairy and eggs can remain",
      "Keep similar texture and protein content",
    ],
    "gluten-free": [
      "Replace wheat flour with gluten-free alternatives (almond flour, rice flour, oat flour marked GF, coconut flour)",
      "Replace regular pasta with gluten-free pasta (rice, corn, or legume-based)",
      "Replace soy sauce with tamari or coconut aminos",
      "Replace breadcrumbs with gluten-free breadcrumbs or crushed gluten-free crackers",
      "Check that all processed ingredients are certified gluten-free",
      "Replace regular oats with certified gluten-free oats",
      "Replace beer with gluten-free beer or broth in cooking",
    ],
  };

  const ingredientsList = ingredients
    .map((i, idx) => `${idx + 1}. ${i.quantity} ${i.unit} ${i.name}`)
    .join("\n");

  const instructionsList = instructions
    .map((inst, idx) => `${idx + 1}. ${inst}`)
    .join("\n");

  const guidelinesText = dietGuidelines[dietType].map(g => `- ${g}`).join("\n");

  return `You are a professional chef and nutritionist specializing in dietary adaptations. Convert the following recipe to be ${dietDescriptions[dietType]}.

RECIPE: "${recipeTitle}"

CURRENT INGREDIENTS:
${ingredientsList}

CURRENT INSTRUCTIONS:
${instructionsList}

CONVERSION GUIDELINES:
${guidelinesText}
- Maintain similar textures, flavors, and cooking properties
- Adjust cooking times if substitutes require different cooking
- Keep the recipe delicious and satisfying

Respond with a JSON object in this exact format:
{
  "ingredients": [
    {
      "original": "original ingredient as listed",
      "converted": "converted ingredient with same quantity format",
      "changed": true/false,
      "reason": "brief explanation if changed, null if not changed"
    }
  ],
  "instructions": ["updated instruction 1", "updated instruction 2", ...],
  "instructionChanges": ["description of what changed in instructions and why"],
  "tips": ["helpful tips for making this ${dietType} version delicious"]
}

Important:
- Keep ingredients in the same order
- If an ingredient doesn't need to change, keep it exactly as-is with changed: false
- Update instructions to reference the new ingredients by name
- Adjust cooking times/temperatures if needed for substitutes`;
}

/**
 * Call Gemini API with the conversion prompt
 */
async function callGeminiForConversion(prompt: string): Promise<ConversionResult | null> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3, // Lower temperature for more consistent results
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Gemini API error:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error("No text in Gemini response");
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return null;
  }
}

/**
 * Convert a recipe to vegetarian or vegan
 */
export const convertRecipeDiet = action({
  args: {
    recipeId: v.id("recipes"),
    dietType: v.union(v.literal("vegetarian"), v.literal("vegan"), v.literal("gluten-free")),
    saveAsNew: v.optional(v.boolean()), // If true, create a new recipe instead of modifying
  },
  handler: async (ctx, args): Promise<ConversionResult> => {
    // Fetch the recipe
    const recipe = await ctx.runQuery(api.recipes.get, { id: args.recipeId });

    if (!recipe) {
      return {
        success: false,
        dietType: args.dietType,
        ingredients: [],
        instructions: [],
        instructionChanges: [],
        tips: [],
        error: "Recipe not found",
      };
    }

    // Build the prompt
    const prompt = buildConversionPrompt(
      args.dietType,
      recipe.ingredients,
      recipe.instructions,
      recipe.title
    );

    // Call Gemini
    const result = await callGeminiForConversion(prompt);

    if (!result) {
      return {
        success: false,
        dietType: args.dietType,
        ingredients: [],
        instructions: [],
        instructionChanges: [],
        tips: [],
        error: "Failed to convert recipe. Please try again.",
      };
    }

    // Prepare the converted ingredients
    const newIngredients = result.ingredients.map((ing, idx) => ({
      name: ing.converted.replace(/^\d+(\.\d+)?\s*(cups?|tbsp|tsp|oz|lb|g|kg|ml|l)?\s*/i, "").trim(),
      quantity: recipe.ingredients[idx]?.quantity ?? 1,
      unit: recipe.ingredients[idx]?.unit ?? "",
      category: recipe.ingredients[idx]?.category ?? "other",
    }));

    const dietLabels: Record<DietType, string> = {
      vegan: "Vegan",
      vegetarian: "Vegetarian",
      "gluten-free": "Gluten-Free",
    };

    if (args.saveAsNew) {
      // Create a new recipe with the converted data
      await ctx.runMutation(api.recipes.createRecipe, {
        title: `${recipe.title} (${dietLabels[args.dietType]})`,
        source: recipe.source,
        sourceUrl: recipe.sourceUrl,
        youtubeVideoId: recipe.youtubeVideoId,
        imageUrl: recipe.imageUrl,
        ingredients: newIngredients,
        instructions: result.instructions,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
        cuisineType: recipe.cuisineType,
        dietaryTags: [...(recipe.dietaryTags || []).filter(t => !["contains-meat", "contains-dairy", "contains-gluten"].includes(t)), args.dietType],
        notes: `Converted from original recipe. Changes: ${(result.instructionChanges || []).join("; ")}`,
        nutrition: recipe.nutrition,
      });
    } else {
      // Update the existing recipe
      await ctx.runMutation(api.recipes.updateRecipe, {
        id: args.recipeId,
        ingredients: newIngredients,
        instructions: result.instructions,
        dietaryTags: [...(recipe.dietaryTags || []).filter(t => !["contains-meat", "contains-dairy", "contains-gluten"].includes(t)), args.dietType],
        notes: recipe.notes
          ? `${recipe.notes}\n\nConverted to ${dietLabels[args.dietType]}: ${(result.instructionChanges || []).join("; ")}`
          : `Converted to ${dietLabels[args.dietType]}: ${(result.instructionChanges || []).join("; ")}`,
      });
    }

    return {
      success: true,
      dietType: args.dietType,
      ingredients: result.ingredients,
      instructions: result.instructions,
      instructionChanges: result.instructionChanges || [],
      tips: result.tips || [],
    };
  },
});

"use node";

/**
 * Generate Recipe Image Action
 *
 * Convex action that calls Gemini API to generate a placeholder image
 * for recipes that don't have a user-provided image.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Generate a placeholder image for a recipe using Gemini AI
 *
 * This action:
 * 1. Accepts recipe title and main ingredients
 * 2. Calls Gemini API to generate an appetizing food image
 * 3. Stores the generated image in Convex file storage
 * 4. Updates the recipe with the new imageUrl
 *
 * Note: This is designed to be called asynchronously after recipe creation
 * so the user can continue immediately without waiting for image generation.
 */
export const generateRecipeImage = action({
  args: {
    recipeId: v.id("recipes"),
    title: v.string(),
    ingredients: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured, skipping image generation");
      return null;
    }

    try {
      // Build the prompt for image generation
      const ingredientsList = args.ingredients.slice(0, 5).join(", ");
      const prompt = `Generate a beautiful, appetizing food photography style image of "${args.title}".
Main ingredients include: ${ingredientsList}.
Style: Professional food photography, warm lighting, shallow depth of field,
appetizing presentation on a clean plate, top-down or 45-degree angle view.`;

      // Call Gemini API for image generation
      // Note: Using Gemini's Imagen model for image generation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generate?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "16:9",
              safetyFilterLevel: "block_few",
              personGeneration: "allow_adult",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        return null;
      }

      const data = await response.json();

      // Extract the generated image data
      const imageData = data.predictions?.[0]?.bytesBase64Encoded;

      if (!imageData) {
        console.warn("No image data received from Gemini");
        return null;
      }

      // Convert base64 to blob
      const binaryData = Uint8Array.from(atob(imageData), (c) =>
        c.charCodeAt(0)
      );
      const blob = new Blob([binaryData], { type: "image/png" });

      // Store the image in Convex file storage
      const storageId = await ctx.storage.store(blob);

      // Get the URL for the stored image
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        console.error("Failed to get URL for stored image");
        return null;
      }

      // Update the recipe with the new image URL
      await ctx.runMutation(internal.internalMutations.updateRecipeImage, {
        recipeId: args.recipeId,
        imageUrl,
      });

      return imageUrl;
    } catch (error) {
      console.error("Error generating recipe image:", error);
      return null;
    }
  },
});


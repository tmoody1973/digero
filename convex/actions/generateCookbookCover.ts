"use node";

/**
 * Generate Cookbook Cover Image Action
 *
 * Uses Gemini to generate an AI cover image for cookbooks.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";

/**
 * Generate a cover image for a cookbook using Gemini AI
 *
 * @param name - Cookbook name
 * @param description - Optional cookbook description
 * @returns URL of the generated image stored in Convex
 */
export const generateCookbookCover = action({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    imageUrl: string | null;
    error: string | null;
  }> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured");
      return {
        success: false,
        imageUrl: null,
        error: "AI image generation is not configured",
      };
    }

    try {
      // Build prompt for cookbook cover
      const prompt = `Generate a beautiful cookbook cover image for a cookbook called "${args.name}".
${args.description ? `Description: ${args.description}` : ""}

Style requirements:
- Professional cookbook cover aesthetic
- Warm, inviting colors
- Food photography style with appetizing ingredients or dishes
- Clean composition suitable for a cookbook cover
- No text or words in the image
- 16:9 aspect ratio`;

      // Call Gemini API for image generation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
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
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
              responseMimeType: "text/plain",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        return {
          success: false,
          imageUrl: null,
          error: "Failed to generate image",
        };
      }

      const data = await response.json();

      // Extract the generated image data
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (part: { inlineData?: { mimeType: string; data: string } }) =>
          part.inlineData?.mimeType?.startsWith("image/")
      );
      const imageData = imagePart?.inlineData?.data;

      if (!imageData) {
        console.warn("No image data received from Gemini");
        return {
          success: false,
          imageUrl: null,
          error: "No image generated",
        };
      }

      // Get the MIME type from the response
      const mimeType = imagePart?.inlineData?.mimeType || "image/png";

      // Convert base64 to blob
      const binaryData = Uint8Array.from(atob(imageData), (c) =>
        c.charCodeAt(0)
      );
      const blob = new Blob([binaryData], { type: mimeType });

      // Store the image in Convex file storage
      const storageId = await ctx.storage.store(blob);

      // Get the URL for the stored image
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        return {
          success: false,
          imageUrl: null,
          error: "Failed to store image",
        };
      }

      return {
        success: true,
        imageUrl,
        error: null,
      };
    } catch (error) {
      console.error("Error generating cookbook cover:", error);
      return {
        success: false,
        imageUrl: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Extract Recipe From URL Action
 *
 * Orchestrates the hybrid extraction pipeline:
 * 1. Fetch URL content
 * 2. Try JSON-LD parsing
 * 3. Try microdata parsing as fallback
 * 4. Fall back to Gemini AI extraction
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { parseJsonLdRecipe } from "../lib/parseJsonLdRecipe";
import { parseMicrodataRecipe } from "../lib/parseMicrodataRecipe";
import type { ExtractionResult, ExtractedRecipeData } from "../lib/recipeTypes";

/**
 * Extract recipe data from a URL using hybrid pipeline
 *
 * This action orchestrates the full extraction flow:
 * 1. Validates and fetches the URL content
 * 2. Attempts to parse JSON-LD structured data (most reliable)
 * 3. Falls back to microdata parsing if JSON-LD not found
 * 4. Uses Gemini AI extraction as final fallback
 *
 * @param url - The recipe URL to extract from
 * @returns ExtractionResult with recipe data or error details
 */
export const extractRecipeFromUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args): Promise<ExtractionResult> => {
    const { url } = args;

    // Step 1: Fetch URL content
    const fetchResult = await ctx.runAction(api.actions.fetchRecipeUrl.fetchRecipeUrl, {
      url,
    });

    if (!fetchResult.success || !fetchResult.html) {
      return {
        success: false,
        data: null,
        error: fetchResult.error
          ? {
              type: fetchResult.error.type,
              message: fetchResult.error.message,
            }
          : {
              type: "FETCH_FAILED",
              message: "Failed to fetch URL content",
            },
        sourceUrl: url,
      };
    }

    const html = fetchResult.html;
    let extractedData: ExtractedRecipeData | null = null;

    // Step 2: Try JSON-LD parsing (preferred)
    try {
      extractedData = parseJsonLdRecipe(html);
      if (extractedData) {
        return {
          success: true,
          data: extractedData,
          error: null,
          sourceUrl: url,
        };
      }
    } catch (error) {
      // JSON-LD parsing failed, continue to next method
      console.log("JSON-LD parsing failed, trying microdata...");
    }

    // Step 3: Try microdata parsing (fallback)
    try {
      extractedData = parseMicrodataRecipe(html);
      if (extractedData) {
        return {
          success: true,
          data: extractedData,
          error: null,
          sourceUrl: url,
        };
      }
    } catch (error) {
      // Microdata parsing failed, continue to AI extraction
      console.log("Microdata parsing failed, falling back to AI...");
    }

    // Step 4: Fall back to Gemini AI extraction
    try {
      const aiResult = await ctx.runAction(
        api.actions.extractRecipeWithGemini.extractRecipeWithGemini,
        { html }
      );

      if (aiResult.success && aiResult.data) {
        return {
          success: true,
          data: aiResult.data,
          error: null,
          sourceUrl: url,
        };
      }

      // AI extraction returned an error
      return {
        success: false,
        data: null,
        error: aiResult.error || {
          type: "EXTRACTION_FAILED",
          message: "AI extraction failed to find recipe data",
        },
        sourceUrl: url,
      };
    } catch (error) {
      // AI extraction threw an error
      return {
        success: false,
        data: null,
        error: {
          type: "EXTRACTION_FAILED",
          message: `AI extraction error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        sourceUrl: url,
      };
    }
  },
});

/**
 * Quick URL validation (client-side friendly)
 *
 * Simple action to validate URL format before attempting extraction.
 * Can be called from the frontend for immediate feedback.
 */
export const validateRecipeUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (_, args): Promise<{ valid: boolean; error: string | null }> => {
    const { url } = args;

    if (!url || url.trim().length === 0) {
      return {
        valid: false,
        error: "Please enter a URL",
      };
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return {
          valid: false,
          error: "URL must start with http:// or https://",
        };
      }
      return {
        valid: true,
        error: null,
      };
    } catch {
      return {
        valid: false,
        error: "Please enter a valid URL",
      };
    }
  },
});

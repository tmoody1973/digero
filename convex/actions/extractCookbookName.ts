"use node";

/**
 * Extract Cookbook Name Action
 *
 * Uses Gemini Vision API to extract the cookbook title from a cover photo.
 * Returns just the name string for use in scan session setup.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";

/**
 * Result of cookbook name extraction
 */
export interface CookbookNameResult {
  success: boolean;
  name?: string;
  author?: string;
  error?: {
    type: string;
    message: string;
  };
}

/**
 * Gemini extraction prompt for cookbook covers
 */
const EXTRACTION_PROMPT = `You are analyzing a cookbook cover image. Extract the cookbook title and author (if visible).

Return a JSON object with this exact structure:
{
  "success": true,
  "name": "The Cookbook Title",
  "author": "Author Name"
}

Guidelines:
- Extract the main title exactly as shown on the cover
- Include subtitle if prominent (e.g., "The Joy of Cooking: 75th Anniversary Edition")
- Extract author name if clearly visible, or null if not found
- For "author", look for names near "by", "By", or at bottom of cover

If this does not appear to be a cookbook cover, return:
{"success": false, "error": "NOT_A_COOKBOOK", "message": "This does not appear to be a cookbook cover"}

If the text is not readable, return:
{"success": false, "error": "NOT_READABLE", "message": "Could not read the cookbook title"}`;

/**
 * Parse Gemini response for cookbook name
 */
function parseGeminiResponse(response: unknown): CookbookNameResult {
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
        message: String(data.message || "Failed to extract cookbook name"),
      },
    };
  }

  // Extract name (required)
  const name = typeof data.name === "string" ? data.name.trim() : null;
  if (!name) {
    return {
      success: false,
      error: {
        type: "NO_NAME",
        message: "Could not extract cookbook name",
      },
    };
  }

  // Extract author (optional)
  const author =
    typeof data.author === "string" ? data.author.trim() : undefined;

  return {
    success: true,
    name,
    author: author || undefined,
  };
}

/**
 * Extract Cookbook Name Action
 *
 * Sends a cookbook cover image to Gemini Vision API for title extraction.
 * Accepts base64-encoded image data.
 *
 * @param imageBase64 - Base64-encoded image data (without data URI prefix)
 * @param mimeType - Image MIME type (image/jpeg, image/png, etc.)
 * @returns Extraction result with cookbook name or error
 */
export const extractCookbookName = action({
  args: {
    imageBase64: v.string(),
    mimeType: v.string(),
  },
  handler: async (_, args): Promise<CookbookNameResult> => {
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
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
              maxOutputTokens: 1024,
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

      // Convert to CookbookNameResult
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

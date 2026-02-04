"use node";

/**
 * Upload Placeholder Image Action
 *
 * One-time action to upload the AI recipe placeholder image to Convex storage.
 * Run this once to get a permanent URL for the placeholder.
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import * as fs from "fs";
import * as path from "path";

/**
 * Upload the AI recipe placeholder image from local assets to Convex storage.
 * Returns the permanent URL to use for AI-generated recipes.
 */
export const uploadPlaceholderImage = action({
  args: {
    imageBase64: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // Decode base64 to buffer
      const imageBuffer = Buffer.from(args.imageBase64, "base64");

      // Create a Blob from the buffer
      const blob = new Blob([imageBuffer], { type: "image/png" });

      // Store in Convex storage
      const storageId = await ctx.storage.store(blob);

      // Get the public URL
      const url = await ctx.storage.getUrl(storageId);

      if (!url) {
        return {
          success: false,
          error: "Failed to get storage URL",
        };
      }

      return {
        success: true,
        url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

"use node";

/**
 * Generate Speechmatics JWT Action
 *
 * Creates short-lived JWT tokens for Speechmatics Flow API authentication.
 * Tokens are generated server-side to keep the API key secure.
 */

import { v } from "convex/values";
import { action } from "../_generated/server";
import { createSpeechmaticsJWT } from "@speechmatics/auth";

/**
 * Generate a short-lived JWT for Speechmatics Flow API
 *
 * @returns JWT token string or error
 */
export const generate = action({
  args: {},
  handler: async (): Promise<{
    success: boolean;
    jwt: string | null;
    error: string | null;
  }> => {
    try {
      const apiKey = process.env.SPEECHMATICS_API_KEY;

      if (!apiKey) {
        console.error("[Speechmatics] API key not configured");
        return {
          success: false,
          jwt: null,
          error: "Speechmatics API key not configured",
        };
      }

      // Generate short-lived JWT (60 seconds)
      const jwt = await createSpeechmaticsJWT({
        type: "flow",
        apiKey,
        ttl: 60,
      });

      console.log("[Speechmatics] JWT generated successfully");

      return {
        success: true,
        jwt,
        error: null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate JWT";
      console.error("[Speechmatics] JWT generation error:", message);

      return {
        success: false,
        jwt: null,
        error: message,
      };
    }
  },
});

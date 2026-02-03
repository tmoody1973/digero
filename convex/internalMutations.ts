/**
 * Internal Mutations
 *
 * Internal mutations that are called by actions.
 * These run in Convex runtime (not Node.js).
 */

import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Internal mutation to update recipe image URL
 *
 * This is used by the generateRecipeImage action to update
 * the recipe after image generation completes.
 */
export const updateRecipeImage = internalMutation({
  args: {
    recipeId: v.id("recipes"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      imageUrl: args.imageUrl,
      updatedAt: Date.now(),
    });
    return args.recipeId;
  },
});

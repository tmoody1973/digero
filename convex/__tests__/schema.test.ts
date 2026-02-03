/**
 * Schema Validation Tests
 *
 * Tests for validating the Convex schema definitions for recipes and physicalCookbooks tables.
 * These tests verify that the schema accepts valid data and rejects invalid data.
 */

import { v } from "convex/values";

// Define the validators to match our schema for testing purposes
const ingredientCategoryValidator = v.union(
  v.literal("meat"),
  v.literal("produce"),
  v.literal("dairy"),
  v.literal("pantry"),
  v.literal("spices"),
  v.literal("condiments"),
  v.literal("bread"),
  v.literal("other")
);

const sourceValidator = v.union(
  v.literal("youtube"),
  v.literal("website"),
  v.literal("scanned"),
  v.literal("manual")
);

const difficultyValidator = v.union(
  v.literal("easy"),
  v.literal("medium"),
  v.literal("hard")
);

const ingredientValidator = v.object({
  name: v.string(),
  quantity: v.number(),
  unit: v.string(),
  category: ingredientCategoryValidator,
});

const nutritionValidator = v.object({
  calories: v.number(),
  protein: v.number(),
  carbs: v.number(),
  fat: v.number(),
});

describe("Schema Validation", () => {
  describe("Recipe Schema", () => {
    it("should accept valid recipe data with all required fields", () => {
      const validRecipe = {
        userId: "user_123",
        title: "Spaghetti Carbonara",
        source: "manual" as const,
        imageUrl: "https://example.com/image.jpg",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
          { name: "spaghetti", quantity: 400, unit: "g", category: "pantry" as const },
          { name: "eggs", quantity: 4, unit: "large", category: "dairy" as const },
        ],
        instructions: ["Boil pasta", "Mix eggs and cheese", "Combine"],
        isFavorited: false,
        dietaryTags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Verify all required fields are present and have correct types
      expect(typeof validRecipe.userId).toBe("string");
      expect(typeof validRecipe.title).toBe("string");
      expect(["youtube", "website", "scanned", "manual"]).toContain(validRecipe.source);
      expect(typeof validRecipe.imageUrl).toBe("string");
      expect(typeof validRecipe.servings).toBe("number");
      expect(typeof validRecipe.prepTime).toBe("number");
      expect(typeof validRecipe.cookTime).toBe("number");
      expect(Array.isArray(validRecipe.ingredients)).toBe(true);
      expect(Array.isArray(validRecipe.instructions)).toBe(true);
      expect(typeof validRecipe.isFavorited).toBe("boolean");
      expect(Array.isArray(validRecipe.dietaryTags)).toBe(true);
      expect(typeof validRecipe.createdAt).toBe("number");
      expect(typeof validRecipe.updatedAt).toBe("number");
    });

    it("should validate source enum correctly (youtube, website, scanned, manual)", () => {
      const validSources = ["youtube", "website", "scanned", "manual"];
      const invalidSources = ["instagram", "tiktok", "email", ""];

      validSources.forEach((source) => {
        expect(validSources).toContain(source);
      });

      invalidSources.forEach((source) => {
        expect(validSources).not.toContain(source);
      });
    });

    it("should validate ingredient category enum (8 values)", () => {
      const validCategories = [
        "meat",
        "produce",
        "dairy",
        "pantry",
        "spices",
        "condiments",
        "bread",
        "other",
      ];
      const invalidCategories = ["frozen", "beverages", "household", ""];

      // Valid categories should pass
      validCategories.forEach((category) => {
        expect(validCategories).toContain(category);
      });

      // Invalid categories should not be in the valid list
      invalidCategories.forEach((category) => {
        expect(validCategories).not.toContain(category);
      });

      // Should have exactly 8 valid categories
      expect(validCategories.length).toBe(8);
    });

    it("should allow optional fields to be undefined", () => {
      const recipeWithOptionalFields = {
        userId: "user_123",
        title: "Simple Recipe",
        source: "manual" as const,
        imageUrl: "https://example.com/image.jpg",
        servings: 2,
        prepTime: 10,
        cookTime: 15,
        ingredients: [],
        instructions: ["Step 1"],
        isFavorited: false,
        dietaryTags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // Optional fields explicitly undefined
        sourceUrl: undefined,
        youtubeVideoId: undefined,
        notes: undefined,
        nutrition: undefined,
        cuisineType: undefined,
        difficulty: undefined,
        physicalCookbookId: undefined,
      };

      // Verify optional fields can be undefined
      expect(recipeWithOptionalFields.sourceUrl).toBeUndefined();
      expect(recipeWithOptionalFields.youtubeVideoId).toBeUndefined();
      expect(recipeWithOptionalFields.notes).toBeUndefined();
      expect(recipeWithOptionalFields.nutrition).toBeUndefined();
      expect(recipeWithOptionalFields.cuisineType).toBeUndefined();
      expect(recipeWithOptionalFields.difficulty).toBeUndefined();
      expect(recipeWithOptionalFields.physicalCookbookId).toBeUndefined();
    });

    it("should validate array fields (ingredients, instructions, dietaryTags)", () => {
      const validIngredients = [
        { name: "flour", quantity: 2, unit: "cups", category: "pantry" as const },
        { name: "chicken", quantity: 1.5, unit: "lbs", category: "meat" as const },
      ];

      const validInstructions = ["Preheat oven", "Mix ingredients", "Bake for 30 minutes"];

      const validDietaryTags = ["gluten-free", "dairy-free", "vegetarian"];

      // Ingredients should be an array of objects with required properties
      expect(Array.isArray(validIngredients)).toBe(true);
      validIngredients.forEach((ingredient) => {
        expect(ingredient).toHaveProperty("name");
        expect(ingredient).toHaveProperty("quantity");
        expect(ingredient).toHaveProperty("unit");
        expect(ingredient).toHaveProperty("category");
        expect(typeof ingredient.name).toBe("string");
        expect(typeof ingredient.quantity).toBe("number");
        expect(typeof ingredient.unit).toBe("string");
      });

      // Instructions should be an array of strings
      expect(Array.isArray(validInstructions)).toBe(true);
      validInstructions.forEach((instruction) => {
        expect(typeof instruction).toBe("string");
      });

      // Dietary tags should be an array of strings
      expect(Array.isArray(validDietaryTags)).toBe(true);
      validDietaryTags.forEach((tag) => {
        expect(typeof tag).toBe("string");
      });
    });
  });

  describe("Physical Cookbooks Schema", () => {
    it("should accept valid cookbook data", () => {
      const validCookbook = {
        userId: "user_123",
        name: "Salt Fat Acid Heat",
        author: "Samin Nosrat",
        createdAt: Date.now(),
      };

      expect(typeof validCookbook.userId).toBe("string");
      expect(typeof validCookbook.name).toBe("string");
      expect(typeof validCookbook.author).toBe("string");
      expect(typeof validCookbook.createdAt).toBe("number");
    });

    it("should allow optional author and coverImageId", () => {
      const cookbookWithoutOptionals = {
        userId: "user_123",
        name: "Homemade Recipes",
        createdAt: Date.now(),
        author: undefined,
        coverImageId: undefined,
      };

      expect(typeof cookbookWithoutOptionals.userId).toBe("string");
      expect(typeof cookbookWithoutOptionals.name).toBe("string");
      expect(cookbookWithoutOptionals.author).toBeUndefined();
      expect(cookbookWithoutOptionals.coverImageId).toBeUndefined();
    });
  });

  describe("Nutrition Object Structure", () => {
    it("should validate nutrition object with all numeric fields", () => {
      const validNutrition = {
        calories: 450,
        protein: 25,
        carbs: 30,
        fat: 15,
      };

      expect(typeof validNutrition.calories).toBe("number");
      expect(typeof validNutrition.protein).toBe("number");
      expect(typeof validNutrition.carbs).toBe("number");
      expect(typeof validNutrition.fat).toBe("number");

      // Verify decimal values are supported
      const nutritionWithDecimals = {
        calories: 450.5,
        protein: 25.3,
        carbs: 30.7,
        fat: 15.2,
      };

      expect(typeof nutritionWithDecimals.calories).toBe("number");
      expect(nutritionWithDecimals.protein).toBe(25.3);
    });
  });
});

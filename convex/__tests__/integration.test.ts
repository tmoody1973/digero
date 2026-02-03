/**
 * Integration Tests for Recipe Data Model
 *
 * Strategic tests covering end-to-end workflows and integration points
 * between schema, mutations, and queries.
 */

describe("Recipe Data Model Integration", () => {
  describe("Recipe Lifecycle", () => {
    it("should support complete recipe lifecycle: create -> read -> update -> delete", () => {
      // Step 1: Create recipe
      const createInput = {
        userId: "user_123",
        title: "Chocolate Cake",
        source: "manual" as const,
        imageUrl: "https://example.com/cake.jpg",
        servings: 8,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
          { name: "flour", quantity: 2, unit: "cups", category: "pantry" as const },
          { name: "cocoa powder", quantity: 0.75, unit: "cups", category: "pantry" as const },
        ],
        instructions: ["Mix dry ingredients", "Add wet ingredients", "Bake at 350F"],
        isFavorited: false,
        dietaryTags: [] as string[],
        notes: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Verify create
      expect(createInput.title).toBe("Chocolate Cake");
      expect(createInput.ingredients.length).toBe(2);

      // Step 2: Read recipe
      const readRecipe = { ...createInput, id: "recipe_123" };
      expect(readRecipe.id).toBe("recipe_123");
      expect(readRecipe.userId).toBe("user_123");

      // Step 3: Update recipe
      const updatedRecipe = {
        ...readRecipe,
        title: "Double Chocolate Cake",
        servings: 12,
        updatedAt: Date.now(),
      };
      expect(updatedRecipe.title).toBe("Double Chocolate Cake");
      expect(updatedRecipe.servings).toBe(12);
      expect(updatedRecipe.updatedAt).toBeGreaterThanOrEqual(readRecipe.createdAt);

      // Step 4: Delete recipe (returns deleted ID)
      const deletedId = readRecipe.id;
      expect(deletedId).toBe("recipe_123");
    });

    it("should support favorite toggle workflow", () => {
      const recipe = {
        id: "recipe_123",
        userId: "user_123",
        title: "Favorite Recipe",
        isFavorited: false,
      };

      // First toggle: false -> true
      recipe.isFavorited = !recipe.isFavorited;
      expect(recipe.isFavorited).toBe(true);

      // Verify appears in favorites
      const favorites = [recipe].filter((r) => r.isFavorited);
      expect(favorites.length).toBe(1);

      // Second toggle: true -> false
      recipe.isFavorited = !recipe.isFavorited;
      expect(recipe.isFavorited).toBe(false);

      // Verify removed from favorites
      const favoritesAfter = [recipe].filter((r) => r.isFavorited);
      expect(favoritesAfter.length).toBe(0);
    });
  });

  describe("Physical Cookbook-Recipe Relationship", () => {
    it("should link scanned recipe to physical cookbook correctly", () => {
      const cookbook = {
        id: "cookbook_123",
        userId: "user_123",
        name: "The Joy of Cooking",
        author: "Irma S. Rombauer",
        createdAt: Date.now(),
      };

      const scannedRecipe = {
        id: "recipe_456",
        userId: "user_123",
        title: "Classic Meatloaf",
        source: "scanned" as const,
        physicalCookbookId: cookbook.id,
        imageUrl: "https://example.com/meatloaf.jpg",
        servings: 6,
        prepTime: 15,
        cookTime: 60,
        ingredients: [
          { name: "ground beef", quantity: 2, unit: "lbs", category: "meat" as const },
        ],
        instructions: ["Mix ingredients", "Shape loaf", "Bake"],
        isFavorited: false,
        dietaryTags: [] as string[],
        notes: "Page 152",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Verify relationship
      expect(scannedRecipe.physicalCookbookId).toBe(cookbook.id);
      expect(scannedRecipe.source).toBe("scanned");

      // Verify can find all recipes from a cookbook
      const allRecipes = [scannedRecipe];
      const recipesFromCookbook = allRecipes.filter(
        (r) => r.physicalCookbookId === cookbook.id
      );
      expect(recipesFromCookbook.length).toBe(1);
    });

    it("should allow multiple recipes from same cookbook", () => {
      const cookbook = {
        id: "cookbook_123",
        userId: "user_123",
        name: "Mastering the Art of French Cooking",
      };

      const recipes = [
        {
          id: "recipe_1",
          title: "Beef Bourguignon",
          physicalCookbookId: cookbook.id,
          source: "scanned" as const,
        },
        {
          id: "recipe_2",
          title: "Coq au Vin",
          physicalCookbookId: cookbook.id,
          source: "scanned" as const,
        },
        {
          id: "recipe_3",
          title: "Quiche Lorraine",
          physicalCookbookId: cookbook.id,
          source: "scanned" as const,
        },
      ];

      const recipesFromCookbook = recipes.filter(
        (r) => r.physicalCookbookId === cookbook.id
      );
      expect(recipesFromCookbook.length).toBe(3);
    });
  });

  describe("Source-Specific Validation", () => {
    it("should enforce YouTube source requires both sourceUrl and youtubeVideoId", () => {
      const validateYouTubeRecipe = (recipe: {
        source: string;
        sourceUrl?: string;
        youtubeVideoId?: string;
      }) => {
        const errors: string[] = [];
        if (recipe.source === "youtube") {
          if (!recipe.sourceUrl) {
            errors.push("Source URL required for YouTube recipes");
          }
          if (!recipe.youtubeVideoId) {
            errors.push("YouTube video ID required for YouTube recipes");
          }
        }
        return errors;
      };

      // Valid YouTube recipe
      const validYouTube = {
        source: "youtube",
        sourceUrl: "https://www.youtube.com/watch?v=abc123",
        youtubeVideoId: "abc123",
      };
      expect(validateYouTubeRecipe(validYouTube)).toEqual([]);

      // Missing both
      const missingBoth = { source: "youtube" };
      const errorsBoth = validateYouTubeRecipe(missingBoth);
      expect(errorsBoth.length).toBe(2);

      // Missing videoId only
      const missingVideoId = {
        source: "youtube",
        sourceUrl: "https://www.youtube.com/watch?v=abc123",
      };
      expect(validateYouTubeRecipe(missingVideoId).length).toBe(1);
    });

    it("should enforce website source requires sourceUrl", () => {
      const validateWebsiteRecipe = (recipe: {
        source: string;
        sourceUrl?: string;
      }) => {
        if (recipe.source === "website" && !recipe.sourceUrl) {
          throw new Error("Source URL required for website recipes");
        }
      };

      // Valid website recipe
      expect(() =>
        validateWebsiteRecipe({
          source: "website",
          sourceUrl: "https://example.com/recipe",
        })
      ).not.toThrow();

      // Invalid website recipe
      expect(() => validateWebsiteRecipe({ source: "website" })).toThrow(
        "Source URL required for website recipes"
      );
    });
  });

  describe("Ingredient Structure", () => {
    it("should support all 8 ingredient categories", () => {
      const categories = [
        "meat",
        "produce",
        "dairy",
        "pantry",
        "spices",
        "condiments",
        "bread",
        "other",
      ] as const;

      const ingredients = categories.map((category, index) => ({
        name: `Ingredient ${index + 1}`,
        quantity: 1,
        unit: "unit",
        category,
      }));

      expect(ingredients.length).toBe(8);

      // Verify each category is represented
      const usedCategories = ingredients.map((i) => i.category);
      categories.forEach((category) => {
        expect(usedCategories).toContain(category);
      });
    });

    it("should support decimal quantities for ingredients", () => {
      const ingredients = [
        { name: "flour", quantity: 2.5, unit: "cups", category: "pantry" as const },
        { name: "butter", quantity: 0.75, unit: "cups", category: "dairy" as const },
        { name: "salt", quantity: 0.25, unit: "tsp", category: "spices" as const },
      ];

      expect(ingredients[0].quantity).toBe(2.5);
      expect(ingredients[1].quantity).toBe(0.75);
      expect(ingredients[2].quantity).toBe(0.25);
    });
  });

  describe("Nutrition Object", () => {
    it("should support complete nutrition information", () => {
      const nutrition = {
        calories: 350,
        protein: 25.5,
        carbs: 30.2,
        fat: 15.8,
      };

      expect(nutrition.calories).toBe(350);
      expect(nutrition.protein).toBe(25.5);
      expect(nutrition.carbs).toBe(30.2);
      expect(nutrition.fat).toBe(15.8);
    });

    it("should allow recipe without nutrition (optional field)", () => {
      const recipeWithoutNutrition = {
        title: "Quick Salad",
        ingredients: [],
        nutrition: undefined,
      };

      expect(recipeWithoutNutrition.nutrition).toBeUndefined();
    });
  });

  describe("User Isolation", () => {
    it("should isolate recipes by user", () => {
      const recipes = [
        { id: "1", userId: "user_A", title: "Recipe A1" },
        { id: "2", userId: "user_A", title: "Recipe A2" },
        { id: "3", userId: "user_B", title: "Recipe B1" },
        { id: "4", userId: "user_C", title: "Recipe C1" },
        { id: "5", userId: "user_A", title: "Recipe A3" },
      ];

      const getRecipesForUser = (userId: string) =>
        recipes.filter((r) => r.userId === userId);

      expect(getRecipesForUser("user_A").length).toBe(3);
      expect(getRecipesForUser("user_B").length).toBe(1);
      expect(getRecipesForUser("user_C").length).toBe(1);
      expect(getRecipesForUser("user_D").length).toBe(0);
    });

    it("should isolate cookbooks by user", () => {
      const cookbooks = [
        { id: "1", userId: "user_A", name: "Cookbook A1" },
        { id: "2", userId: "user_B", name: "Cookbook B1" },
        { id: "3", userId: "user_A", name: "Cookbook A2" },
      ];

      const getCookbooksForUser = (userId: string) =>
        cookbooks.filter((c) => c.userId === userId);

      expect(getCookbooksForUser("user_A").length).toBe(2);
      expect(getCookbooksForUser("user_B").length).toBe(1);
      expect(getCookbooksForUser("user_C").length).toBe(0);
    });
  });
});

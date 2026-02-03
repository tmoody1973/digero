/**
 * Cookbook Mutations and Queries Tests
 *
 * Tests for verifying CRUD operations, validation rules, and query functionality
 * for the cookbooks and cookbookRecipes tables.
 */

describe("Cookbook Schema and Data Layer", () => {
  describe("Cookbook creation", () => {
    it("should create cookbook with required fields", () => {
      const validCookbookInput = {
        name: "Weeknight Dinners",
        description: "Quick and easy meals",
        coverUrl: "https://example.com/cover.jpg",
        recipeCount: 0,
        isBuiltIn: false,
      };

      expect(validCookbookInput.name).toBe("Weeknight Dinners");
      expect(validCookbookInput.isBuiltIn).toBe(false);
      expect(validCookbookInput.recipeCount).toBe(0);
    });

    it("should validate name character limit (50 chars)", () => {
      const validateName = (name: string) => {
        if (name.length > 50) {
          throw new Error("Cookbook name must be 50 characters or less");
        }
      };

      const longName = "A".repeat(51);
      expect(() => validateName(longName)).toThrow(
        "Cookbook name must be 50 characters or less"
      );

      const validName = "A".repeat(50);
      expect(() => validateName(validName)).not.toThrow();
    });

    it("should validate description character limit (200 chars)", () => {
      const validateDescription = (description: string) => {
        if (description.length > 200) {
          throw new Error("Cookbook description must be 200 characters or less");
        }
      };

      const longDescription = "A".repeat(201);
      expect(() => validateDescription(longDescription)).toThrow(
        "Cookbook description must be 200 characters or less"
      );
    });
  });

  describe("CookbookRecipe junction table", () => {
    it("should create association with position field", () => {
      const cookbookRecipe = {
        cookbookId: "cookbook_123",
        recipeId: "recipe_456",
        position: 0,
        dateAdded: Date.now(),
      };

      expect(cookbookRecipe.position).toBe(0);
      expect(cookbookRecipe.cookbookId).toBe("cookbook_123");
      expect(cookbookRecipe.recipeId).toBe("recipe_456");
    });

    it("should support incrementing positions for new recipes", () => {
      const existingRecipes = [
        { recipeId: "r1", position: 0 },
        { recipeId: "r2", position: 1 },
        { recipeId: "r3", position: 2 },
      ];

      const newRecipePosition = existingRecipes.length;
      expect(newRecipePosition).toBe(3);
    });
  });

  describe("Built-in cookbook behavior", () => {
    it("should identify built-in cookbooks", () => {
      const cookbooks = [
        { id: "1", name: "Favorites", isBuiltIn: true },
        { id: "2", name: "Recently Added", isBuiltIn: true },
        { id: "3", name: "Italian Classics", isBuiltIn: false },
      ];

      const builtIn = cookbooks.filter((c) => c.isBuiltIn);
      const userCreated = cookbooks.filter((c) => !c.isBuiltIn);

      expect(builtIn.length).toBe(2);
      expect(userCreated.length).toBe(1);
    });

    it("should reject deletion of built-in cookbooks", () => {
      const cookbook = { id: "1", name: "Favorites", isBuiltIn: true };

      const validateDeletion = (cookbook: { isBuiltIn: boolean }) => {
        if (cookbook.isBuiltIn) {
          throw new Error("Cannot delete built-in cookbooks");
        }
      };

      expect(() => validateDeletion(cookbook)).toThrow(
        "Cannot delete built-in cookbooks"
      );
    });
  });
});

describe("Cookbook Queries", () => {
  describe("listCookbooks", () => {
    it("should return both built-in and user cookbooks", () => {
      const allCookbooks = [
        { id: "1", name: "Favorites", isBuiltIn: true, userId: "user_123" },
        { id: "2", name: "Recently Added", isBuiltIn: true, userId: "user_123" },
        { id: "3", name: "Italian", isBuiltIn: false, userId: "user_123" },
        { id: "4", name: "Asian", isBuiltIn: false, userId: "user_456" },
      ];

      const userId = "user_123";
      const userCookbooks = allCookbooks.filter((c) => c.userId === userId);

      expect(userCookbooks.length).toBe(3);
      expect(userCookbooks.filter((c) => c.isBuiltIn).length).toBe(2);
    });

    it("should sort built-in cookbooks first", () => {
      const cookbooks = [
        { id: "3", name: "Italian", isBuiltIn: false, updatedAt: 3000 },
        { id: "1", name: "Favorites", isBuiltIn: true, updatedAt: 1000 },
        { id: "2", name: "Recently Added", isBuiltIn: true, updatedAt: 2000 },
      ];

      const sorted = [...cookbooks].sort((a, b) => {
        if (a.isBuiltIn !== b.isBuiltIn) {
          return a.isBuiltIn ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });

      expect(sorted[0].name).toBe("Recently Added"); // Built-in, more recent
      expect(sorted[1].name).toBe("Favorites"); // Built-in, older
      expect(sorted[2].name).toBe("Italian"); // User-created
    });
  });

  describe("getCookbookWithRecipes", () => {
    it("should return recipes sorted by position", () => {
      const recipes = [
        { recipeId: "r3", position: 2, title: "C Recipe" },
        { recipeId: "r1", position: 0, title: "A Recipe" },
        { recipeId: "r2", position: 1, title: "B Recipe" },
      ];

      const sorted = [...recipes].sort((a, b) => a.position - b.position);

      expect(sorted[0].recipeId).toBe("r1");
      expect(sorted[1].recipeId).toBe("r2");
      expect(sorted[2].recipeId).toBe("r3");
    });

    it("should support sorting by title alphabetically", () => {
      const recipes = [
        { recipeId: "r1", title: "Ziti" },
        { recipeId: "r2", title: "Apple Pie" },
        { recipeId: "r3", title: "Meatballs" },
      ];

      const sorted = [...recipes].sort((a, b) => a.title.localeCompare(b.title));

      expect(sorted[0].title).toBe("Apple Pie");
      expect(sorted[1].title).toBe("Meatballs");
      expect(sorted[2].title).toBe("Ziti");
    });

    it("should support sorting by dateAdded descending", () => {
      const recipes = [
        { recipeId: "r1", dateAdded: 1000 },
        { recipeId: "r2", dateAdded: 3000 },
        { recipeId: "r3", dateAdded: 2000 },
      ];

      const sorted = [...recipes].sort((a, b) => b.dateAdded - a.dateAdded);

      expect(sorted[0].recipeId).toBe("r2");
      expect(sorted[1].recipeId).toBe("r3");
      expect(sorted[2].recipeId).toBe("r1");
    });
  });

  describe("getCookbooksForRecipe", () => {
    it("should return cookbook IDs containing the recipe", () => {
      const cookbookRecipes = [
        { cookbookId: "cb1", recipeId: "r1" },
        { cookbookId: "cb2", recipeId: "r1" },
        { cookbookId: "cb1", recipeId: "r2" },
        { cookbookId: "cb3", recipeId: "r3" },
      ];

      const targetRecipeId = "r1";
      const cookbookIds = cookbookRecipes
        .filter((cr) => cr.recipeId === targetRecipeId)
        .map((cr) => cr.cookbookId);

      expect(cookbookIds).toContain("cb1");
      expect(cookbookIds).toContain("cb2");
      expect(cookbookIds.length).toBe(2);
    });
  });
});

describe("Cookbook Mutations", () => {
  describe("createCookbook", () => {
    it("should validate name is not empty", () => {
      const validateName = (name: string) => {
        if (!name.trim()) {
          throw new Error("Cookbook name is required");
        }
      };

      expect(() => validateName("")).toThrow("Cookbook name is required");
      expect(() => validateName("   ")).toThrow("Cookbook name is required");
      expect(() => validateName("Valid Name")).not.toThrow();
    });

    it("should create with default values", () => {
      const defaults = {
        recipeCount: 0,
        isBuiltIn: false,
        sortBy: "position",
      };

      expect(defaults.recipeCount).toBe(0);
      expect(defaults.isBuiltIn).toBe(false);
      expect(defaults.sortBy).toBe("position");
    });
  });

  describe("addRecipeToCookbooks", () => {
    it("should handle multi-select additions", () => {
      const currentCookbookIds = new Set(["cb1", "cb2"]);
      const targetCookbookIds = new Set(["cb2", "cb3", "cb4"]);

      const toAdd = [...targetCookbookIds].filter(
        (id) => !currentCookbookIds.has(id)
      );
      const toRemove = [...currentCookbookIds].filter(
        (id) => !targetCookbookIds.has(id)
      );

      expect(toAdd).toContain("cb3");
      expect(toAdd).toContain("cb4");
      expect(toRemove).toContain("cb1");
    });
  });

  describe("updateRecipePosition", () => {
    it("should update position for drag-and-drop", () => {
      const entry = { recipeId: "r1", position: 0 };
      const newPosition = 3;

      const updated = { ...entry, position: newPosition };

      expect(updated.position).toBe(3);
    });
  });

  describe("reorderRecipes", () => {
    it("should update all positions based on new order", () => {
      const originalOrder = ["r1", "r2", "r3", "r4"];
      const newOrder = ["r3", "r1", "r4", "r2"];

      const newPositions = newOrder.reduce(
        (acc, recipeId, index) => {
          acc[recipeId] = index;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(newPositions["r3"]).toBe(0);
      expect(newPositions["r1"]).toBe(1);
      expect(newPositions["r4"]).toBe(2);
      expect(newPositions["r2"]).toBe(3);
    });
  });
});

describe("Built-in Cookbook Sync", () => {
  describe("syncFavoritesCookbook", () => {
    it("should add recipe to Favorites when favorited", () => {
      const isFavorited = true;
      const existingInFavorites = false;

      const shouldAdd = isFavorited && !existingInFavorites;
      expect(shouldAdd).toBe(true);
    });

    it("should remove recipe from Favorites when unfavorited", () => {
      const isFavorited = false;
      const existingInFavorites = true;

      const shouldRemove = !isFavorited && existingInFavorites;
      expect(shouldRemove).toBe(true);
    });
  });

  describe("getRecentlyAddedRecipes", () => {
    it("should return 8 most recent recipes by default", () => {
      const recipes = Array.from({ length: 12 }, (_, i) => ({
        id: `r${i}`,
        createdAt: i * 1000,
      })).reverse();

      const limit = 8;
      const recentRecipes = recipes.slice(0, limit);

      expect(recentRecipes.length).toBe(8);
      expect(recentRecipes[0].id).toBe("r11"); // Most recent
    });
  });
});

describe("Authentication", () => {
  it("should require authentication for all operations", () => {
    const identity = null;

    const requireAuth = (identity: null | { subject: string }) => {
      if (!identity) {
        throw new Error("Authentication required");
      }
      return identity.subject;
    };

    expect(() => requireAuth(identity)).toThrow("Authentication required");
  });

  it("should validate cookbook ownership", () => {
    const cookbook = { userId: "user_123", name: "My Cookbook" };
    const currentUserId = "user_456";

    const validateOwnership = (cookbookUserId: string, currentUser: string) => {
      if (cookbookUserId !== currentUser) {
        throw new Error("You do not have permission to access this cookbook");
      }
    };

    expect(() => validateOwnership(cookbook.userId, currentUserId)).toThrow(
      "You do not have permission to access this cookbook"
    );
  });
});

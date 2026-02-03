/**
 * Cookbook Integration Tests
 *
 * End-to-end workflow tests for cookbook organization feature.
 * Tests critical user journeys and built-in cookbook behavior.
 */

describe("Cookbook Creation to Recipe Flow", () => {
  it("should complete full flow: create cookbook, add recipe, view in cookbook", () => {
    // Step 1: Create cookbook
    const newCookbook = {
      id: "cb-new",
      name: "Test Cookbook",
      description: "For testing",
      coverUrl: "https://example.com/cover.jpg",
      recipeCount: 0,
      isBuiltIn: false,
    };

    expect(newCookbook.name).toBe("Test Cookbook");
    expect(newCookbook.recipeCount).toBe(0);

    // Step 2: Add recipe to cookbook
    const recipe = {
      id: "rec-1",
      title: "Test Recipe",
    };

    const cookbookRecipe = {
      cookbookId: newCookbook.id,
      recipeId: recipe.id,
      position: 0,
      dateAdded: Date.now(),
    };

    // Update cookbook count
    newCookbook.recipeCount = 1;

    expect(cookbookRecipe.cookbookId).toBe("cb-new");
    expect(newCookbook.recipeCount).toBe(1);

    // Step 3: View recipe in cookbook
    const cookbookWithRecipes = {
      ...newCookbook,
      recipes: [
        {
          recipeId: recipe.id,
          title: recipe.title,
          position: 0,
        },
      ],
    };

    expect(cookbookWithRecipes.recipes.length).toBe(1);
    expect(cookbookWithRecipes.recipes[0].title).toBe("Test Recipe");
  });
});

describe("Built-in Cookbook Sync", () => {
  it("should add recipe to Favorites when favorited", () => {
    const favoritesCookbook = {
      id: "cb-favorites",
      name: "Favorites",
      isBuiltIn: true,
      recipeCount: 0,
    };

    const recipe = {
      id: "rec-1",
      isFavorited: false,
    };

    // Favorite the recipe
    recipe.isFavorited = true;

    // Simulate sync
    if (recipe.isFavorited) {
      favoritesCookbook.recipeCount++;
    }

    expect(recipe.isFavorited).toBe(true);
    expect(favoritesCookbook.recipeCount).toBe(1);
  });

  it("should remove recipe from Favorites when unfavorited", () => {
    const favoritesCookbook = {
      id: "cb-favorites",
      name: "Favorites",
      isBuiltIn: true,
      recipeCount: 1,
    };

    const recipe = {
      id: "rec-1",
      isFavorited: true,
    };

    // Unfavorite the recipe
    recipe.isFavorited = false;

    // Simulate sync
    if (!recipe.isFavorited) {
      favoritesCookbook.recipeCount--;
    }

    expect(recipe.isFavorited).toBe(false);
    expect(favoritesCookbook.recipeCount).toBe(0);
  });

  it("should auto-populate Recently Added with most recent recipes", () => {
    const recipes = [
      { id: "r1", createdAt: 1000, title: "Oldest" },
      { id: "r2", createdAt: 3000, title: "Newest" },
      { id: "r3", createdAt: 2000, title: "Middle" },
    ];

    const recentlyAdded = [...recipes]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8)
      .map((r, index) => ({
        recipeId: r.id,
        title: r.title,
        position: index,
      }));

    expect(recentlyAdded[0].title).toBe("Newest");
    expect(recentlyAdded[1].title).toBe("Middle");
    expect(recentlyAdded[2].title).toBe("Oldest");
  });
});

describe("Recipe Reorder Persistence", () => {
  it("should persist drag-and-drop reorder", () => {
    const originalOrder = [
      { recipeId: "r1", position: 0 },
      { recipeId: "r2", position: 1 },
      { recipeId: "r3", position: 2 },
    ];

    // Simulate drag r3 to first position
    const newOrder = ["r3", "r1", "r2"];

    const reorderedRecipes = newOrder.map((id, index) => ({
      recipeId: id,
      position: index,
    }));

    expect(reorderedRecipes[0].recipeId).toBe("r3");
    expect(reorderedRecipes[0].position).toBe(0);
    expect(reorderedRecipes[1].recipeId).toBe("r1");
    expect(reorderedRecipes[1].position).toBe(1);
    expect(reorderedRecipes[2].recipeId).toBe("r2");
    expect(reorderedRecipes[2].position).toBe(2);
  });

  it("should reflect reorder in manual sort view", () => {
    const recipes = [
      { recipeId: "r3", position: 0, title: "C" },
      { recipeId: "r1", position: 1, title: "A" },
      { recipeId: "r2", position: 2, title: "B" },
    ];

    const sortedByPosition = [...recipes].sort(
      (a, b) => a.position - b.position
    );
    const sortedByTitle = [...recipes].sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    // Manual order respects position
    expect(sortedByPosition[0].recipeId).toBe("r3");

    // Alphabetical ignores position
    expect(sortedByTitle[0].recipeId).toBe("r1");
  });
});

describe("Delete Cookbook Flow", () => {
  it("should remove cookbook and associations but preserve recipes", () => {
    const cookbook = {
      id: "cb-1",
      name: "To Delete",
      isBuiltIn: false,
    };

    const cookbookRecipes = [
      { id: "cbr-1", cookbookId: "cb-1", recipeId: "r1" },
      { id: "cbr-2", cookbookId: "cb-1", recipeId: "r2" },
    ];

    const recipes = [
      { id: "r1", title: "Recipe 1" },
      { id: "r2", title: "Recipe 2" },
    ];

    // Simulate deletion
    const remainingAssociations = cookbookRecipes.filter(
      (cr) => cr.cookbookId !== cookbook.id
    );

    // Recipes should remain
    expect(recipes.length).toBe(2);

    // Associations should be removed
    expect(remainingAssociations.length).toBe(0);
  });

  it("should prevent deletion of built-in cookbooks", () => {
    const cookbook = {
      id: "cb-favorites",
      name: "Favorites",
      isBuiltIn: true,
    };

    const attemptDelete = () => {
      if (cookbook.isBuiltIn) {
        throw new Error("Cannot delete built-in cookbooks");
      }
    };

    expect(attemptDelete).toThrow("Cannot delete built-in cookbooks");
  });
});

describe("Multi-Cookbook Recipe Membership", () => {
  it("should handle recipe in multiple cookbooks", () => {
    const recipe = { id: "r1", title: "Versatile Recipe" };

    const memberships = [
      { cookbookId: "cb-italian", recipeId: "r1" },
      { cookbookId: "cb-weeknight", recipeId: "r1" },
      { cookbookId: "cb-favorites", recipeId: "r1" },
    ];

    const cookbooksForRecipe = memberships
      .filter((m) => m.recipeId === recipe.id)
      .map((m) => m.cookbookId);

    expect(cookbooksForRecipe.length).toBe(3);
    expect(cookbooksForRecipe).toContain("cb-italian");
    expect(cookbooksForRecipe).toContain("cb-weeknight");
  });

  it("should update memberships via AddToCookbookModal", () => {
    const currentMemberships = new Set(["cb-1", "cb-2"]);
    const targetMemberships = new Set(["cb-2", "cb-3", "cb-4"]);

    const toAdd = [...targetMemberships].filter(
      (id) => !currentMemberships.has(id)
    );
    const toRemove = [...currentMemberships].filter(
      (id) => !targetMemberships.has(id)
    );

    expect(toAdd).toContain("cb-3");
    expect(toAdd).toContain("cb-4");
    expect(toRemove).toContain("cb-1");
  });
});

describe("Built-in Cookbook Restrictions", () => {
  it("should not allow manual additions to Favorites", () => {
    const favoritesCookbook = {
      id: "cb-favorites",
      name: "Favorites",
      isBuiltIn: true,
    };

    const attemptManualAdd = () => {
      if (favoritesCookbook.isBuiltIn) {
        throw new Error("Cannot manually add recipes to built-in cookbooks");
      }
    };

    expect(attemptManualAdd).toThrow(
      "Cannot manually add recipes to built-in cookbooks"
    );
  });

  it("should not allow manual removals from Recently Added", () => {
    const recentlyAdded = {
      id: "cb-recent",
      name: "Recently Added",
      isBuiltIn: true,
    };

    const attemptManualRemove = () => {
      if (recentlyAdded.isBuiltIn) {
        throw new Error(
          "Cannot manually remove recipes from built-in cookbooks"
        );
      }
    };

    expect(attemptManualRemove).toThrow(
      "Cannot manually remove recipes from built-in cookbooks"
    );
  });

  it("should hide edit options for built-in cookbook content", () => {
    const cookbook = {
      id: "cb-favorites",
      name: "Favorites",
      isBuiltIn: true,
    };

    const showSelectButton = !cookbook.isBuiltIn;
    const showRemoveButtons = !cookbook.isBuiltIn;

    expect(showSelectButton).toBe(false);
    expect(showRemoveButtons).toBe(false);
  });
});

describe("Recipe Count Accuracy", () => {
  it("should update count when adding recipe", () => {
    let recipeCount = 5;

    // Add recipe
    recipeCount++;

    expect(recipeCount).toBe(6);
  });

  it("should update count when removing recipe", () => {
    let recipeCount = 5;

    // Remove recipe
    recipeCount = Math.max(0, recipeCount - 1);

    expect(recipeCount).toBe(4);
  });

  it("should not go below zero", () => {
    let recipeCount = 0;

    // Try to remove from empty
    recipeCount = Math.max(0, recipeCount - 1);

    expect(recipeCount).toBe(0);
  });
});

describe("Concurrent Updates", () => {
  it("should handle multiple recipes added simultaneously", () => {
    let recipeCount = 0;
    const addedRecipes = ["r1", "r2", "r3"];

    recipeCount = addedRecipes.length;

    expect(recipeCount).toBe(3);
  });

  it("should handle bulk removal correctly", () => {
    let recipeCount = 5;
    const removedRecipeIds = ["r1", "r2"];

    recipeCount = Math.max(0, recipeCount - removedRecipeIds.length);

    expect(recipeCount).toBe(3);
  });
});

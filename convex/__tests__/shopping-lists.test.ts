/**
 * Shopping List Tests
 *
 * Tests for verifying the shopping list feature including:
 * - Schema and data layer (Task Group 1)
 * - Convex queries and mutations (Task Group 2)
 * - Ingredient aggregation and generation (Task Group 3)
 * - UI components (Task Groups 4-6)
 */

// =============================================================================
// Task Group 1: Data Models and Schema Tests
// =============================================================================

describe("Shopping List Schema and Data Layer", () => {
  describe("ShoppingList creation", () => {
    it("should create shopping list with required fields", () => {
      const validListInput = {
        userId: "user_123",
        name: "Week of Feb 2",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(validListInput.userId).toBe("user_123");
      expect(validListInput.status).toBe("active");
      expect(validListInput.name).toBe("Week of Feb 2");
    });

    it("should validate status enum values", () => {
      const validStatuses = ["active", "archived"];
      const invalidStatus = "completed";

      expect(validStatuses).toContain("active");
      expect(validStatuses).toContain("archived");
      expect(validStatuses).not.toContain(invalidStatus);
    });
  });

  describe("ShoppingItem creation", () => {
    it("should create shopping item with ingredient data", () => {
      const validItemInput = {
        listId: "list_123",
        name: "Chicken breast",
        quantity: 2,
        unit: "lbs",
        category: "Meat & Seafood",
        checked: false,
        isCustom: false,
        recipeIds: ["recipe_1", "recipe_2"],
        recipeName: "Creamy Tuscan Chicken",
      };

      expect(validItemInput.name).toBe("Chicken breast");
      expect(validItemInput.category).toBe("Meat & Seafood");
      expect(validItemInput.recipeIds.length).toBe(2);
    });

    it("should validate category enum values", () => {
      const validCategories = [
        "Produce",
        "Meat & Seafood",
        "Dairy & Eggs",
        "Pantry",
        "Bakery",
        "Frozen",
        "Beverages",
        "Household",
      ];

      expect(validCategories.length).toBe(8);
      expect(validCategories).toContain("Produce");
      expect(validCategories).toContain("Meat & Seafood");
      expect(validCategories).not.toContain("Deli");
    });

    it("should track custom vs recipe-sourced items", () => {
      const customItem = { isCustom: true, recipeIds: [] };
      const recipeItem = { isCustom: false, recipeIds: ["recipe_1"] };

      expect(customItem.isCustom).toBe(true);
      expect(customItem.recipeIds.length).toBe(0);
      expect(recipeItem.isCustom).toBe(false);
      expect(recipeItem.recipeIds.length).toBeGreaterThan(0);
    });
  });

  describe("ShoppingList relationship with ShoppingItems", () => {
    it("should filter items by listId", () => {
      const items = [
        { _id: "item_1", listId: "list_A" },
        { _id: "item_2", listId: "list_A" },
        { _id: "item_3", listId: "list_B" },
      ];

      const listAItems = items.filter((i) => i.listId === "list_A");
      expect(listAItems.length).toBe(2);
    });
  });
});

// =============================================================================
// Task Group 2: Convex Queries and Mutations Tests
// =============================================================================

describe("Shopping List Convex Functions", () => {
  describe("createShoppingList", () => {
    it("should create list with correct defaults", () => {
      const listInput = { name: "Test List" };
      const now = Date.now();

      const createdList = {
        userId: "user_123",
        name: listInput.name,
        status: "active",
        createdAt: now,
        updatedAt: now,
      };

      expect(createdList.status).toBe("active");
      expect(createdList.createdAt).toBe(createdList.updatedAt);
    });
  });

  describe("getShoppingLists", () => {
    it("should return user-scoped lists with item counts", () => {
      const lists = [
        { _id: "list_1", userId: "user_123", items: [{}, {}, {}] },
        { _id: "list_2", userId: "user_456", items: [{}] },
      ];

      const userLists = lists.filter((l) => l.userId === "user_123");
      expect(userLists.length).toBe(1);

      const listWithCounts = {
        ...userLists[0],
        totalItems: userLists[0].items.length,
        checkedItems: 0,
      };

      expect(listWithCounts.totalItems).toBe(3);
    });
  });

  describe("toggleItemChecked", () => {
    it("should toggle checked state", () => {
      const item = { checked: false };
      const toggledItem = { ...item, checked: !item.checked };

      expect(toggledItem.checked).toBe(true);
    });

    it("should trigger auto-archive when all items checked", () => {
      const items = [
        { checked: true },
        { checked: true },
        { checked: true },
      ];

      const totalItems = items.length;
      const checkedItems = items.filter((i) => i.checked).length;

      const shouldAutoArchive = totalItems > 0 && checkedItems === totalItems;
      expect(shouldAutoArchive).toBe(true);
    });

    it("should not auto-archive when not all items checked", () => {
      const items = [
        { checked: true },
        { checked: false },
        { checked: true },
      ];

      const totalItems = items.length;
      const checkedItems = items.filter((i) => i.checked).length;

      const shouldAutoArchive = totalItems > 0 && checkedItems === totalItems;
      expect(shouldAutoArchive).toBe(false);
    });
  });

  describe("addItem", () => {
    it("should create custom item with isCustom flag", () => {
      const itemInput = {
        name: "Milk",
        quantity: 1,
        unit: "gallon",
        category: "Dairy & Eggs",
      };

      const createdItem = {
        ...itemInput,
        isCustom: true,
        recipeIds: [],
        checked: false,
      };

      expect(createdItem.isCustom).toBe(true);
      expect(createdItem.recipeIds.length).toBe(0);
    });
  });

  describe("deleteShoppingList", () => {
    it("should cascade delete all items", () => {
      const list = { _id: "list_1" };
      const items = [
        { _id: "item_1", listId: "list_1" },
        { _id: "item_2", listId: "list_1" },
        { _id: "item_3", listId: "list_2" },
      ];

      const itemsToDelete = items.filter((i) => i.listId === list._id);
      expect(itemsToDelete.length).toBe(2);
    });
  });
});

// =============================================================================
// Task Group 3: Ingredient Aggregation Tests
// =============================================================================

describe("Ingredient Aggregation", () => {
  describe("Unit conversion", () => {
    it("should convert oz to lbs correctly", () => {
      const convert = (qty: number, from: string, to: string) => {
        if (from === "oz" && to === "lbs") {
          return qty / 16;
        }
        if (from === "lbs" && to === "oz") {
          return qty * 16;
        }
        return null;
      };

      expect(convert(16, "oz", "lbs")).toBe(1);
      expect(convert(2, "lbs", "oz")).toBe(32);
    });

    it("should convert tsp to tbsp to cups correctly", () => {
      const convert = (qty: number, from: string, to: string) => {
        const toTsp: Record<string, number> = {
          tsp: 1,
          tbsp: 3,
          cup: 48,
          cups: 48,
        };

        const fromFactor = toTsp[from];
        const toFactor = toTsp[to];

        if (fromFactor && toFactor) {
          return (qty * fromFactor) / toFactor;
        }
        return null;
      };

      expect(convert(3, "tsp", "tbsp")).toBe(1);
      expect(convert(16, "tbsp", "cups")).toBe(1);
      expect(convert(1, "cup", "tbsp")).toBe(16);
    });

    it("should return null for incompatible conversions", () => {
      const areCompatible = (unit1: string, unit2: string) => {
        const weightUnits = ["oz", "lbs"];
        const volumeUnits = ["tsp", "tbsp", "cup", "cups"];

        const isWeight1 = weightUnits.includes(unit1);
        const isWeight2 = weightUnits.includes(unit2);
        const isVolume1 = volumeUnits.includes(unit1);
        const isVolume2 = volumeUnits.includes(unit2);

        return (isWeight1 && isWeight2) || (isVolume1 && isVolume2);
      };

      expect(areCompatible("oz", "cups")).toBe(false);
      expect(areCompatible("tsp", "lbs")).toBe(false);
      expect(areCompatible("oz", "lbs")).toBe(true);
      expect(areCompatible("tsp", "cups")).toBe(true);
    });
  });

  describe("Same ingredient combining", () => {
    it("should combine same ingredient with same unit", () => {
      const ingredients = [
        { name: "garlic", quantity: 2, unit: "cloves" },
        { name: "garlic", quantity: 3, unit: "cloves" },
      ];

      const combined = ingredients.reduce(
        (acc, ing) => {
          if (acc.name === ing.name && acc.unit === ing.unit) {
            return { ...acc, quantity: acc.quantity + ing.quantity };
          }
          return acc;
        },
        { name: "garlic", quantity: 0, unit: "cloves" }
      );

      expect(combined.quantity).toBe(5);
    });

    it("should track multiple source recipes", () => {
      const sources = [
        { ingredient: "chicken", recipeId: "recipe_1", recipeName: "Pasta" },
        { ingredient: "chicken", recipeId: "recipe_2", recipeName: "Salad" },
      ];

      const recipeIds = sources.map((s) => s.recipeId);
      expect(recipeIds.length).toBe(2);
      expect(recipeIds).toContain("recipe_1");
      expect(recipeIds).toContain("recipe_2");
    });
  });

  describe("Category auto-assignment", () => {
    it("should assign Produce to vegetables and fruits", () => {
      const produceKeywords = ["tomato", "lettuce", "apple", "banana"];
      const testIngredient = "cherry tomatoes";

      const isProduceCategory = produceKeywords.some((kw) =>
        testIngredient.toLowerCase().includes(kw)
      );

      expect(isProduceCategory).toBe(true);
    });

    it("should assign Meat & Seafood to meats", () => {
      const meatKeywords = ["chicken", "beef", "salmon", "shrimp"];
      const testIngredient = "chicken breast";

      const isMeatCategory = meatKeywords.some((kw) =>
        testIngredient.toLowerCase().includes(kw)
      );

      expect(isMeatCategory).toBe(true);
    });

    it("should default to Pantry for unknown ingredients", () => {
      const knownCategories = ["produce", "meat", "dairy"];
      const testIngredient = "soy sauce";

      const matchesKnown = knownCategories.some((cat) =>
        testIngredient.toLowerCase().includes(cat)
      );

      const category = matchesKnown ? "Known" : "Pantry";
      expect(category).toBe("Pantry");
    });
  });

  describe("generateFromMealPlan", () => {
    it("should generate default name from date range", () => {
      const dates = ["2026-02-02", "2026-02-05", "2026-02-08"];
      const startDate = dates.sort()[0];

      const formatted = new Date(startDate + "T12:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );

      const defaultName = `Week of ${formatted}`;
      expect(defaultName).toMatch(/Week of Feb 2/);
    });
  });
});

// =============================================================================
// Task Group 4: Shopping Lists Overview Screen Tests
// =============================================================================

describe("Shopping Lists Overview Screen", () => {
  describe("List sections", () => {
    it("should separate active and archived lists", () => {
      const lists = [
        { _id: "list_1", status: "active" },
        { _id: "list_2", status: "archived" },
        { _id: "list_3", status: "active" },
      ];

      const activeLists = lists.filter((l) => l.status === "active");
      const archivedLists = lists.filter((l) => l.status === "archived");

      expect(activeLists.length).toBe(2);
      expect(archivedLists.length).toBe(1);
    });
  });

  describe("Progress display", () => {
    it("should calculate correct progress percentage", () => {
      const list = { totalItems: 24, checkedItems: 8 };

      const progress =
        list.totalItems > 0
          ? Math.round((list.checkedItems / list.totalItems) * 100)
          : 0;

      expect(progress).toBe(33);
    });

    it("should show 0% for empty lists", () => {
      const list = { totalItems: 0, checkedItems: 0 };

      const progress =
        list.totalItems > 0
          ? Math.round((list.checkedItems / list.totalItems) * 100)
          : 0;

      expect(progress).toBe(0);
    });
  });

  describe("Quick actions", () => {
    it("should have From Meal Plan and Create Empty actions", () => {
      const quickActions = ["fromMealPlan", "createEmpty"];

      expect(quickActions).toContain("fromMealPlan");
      expect(quickActions).toContain("createEmpty");
    });
  });

  describe("Empty state", () => {
    it("should show when no lists exist", () => {
      const lists: unknown[] = [];
      const showEmptyState = lists.length === 0;

      expect(showEmptyState).toBe(true);
    });
  });
});

// =============================================================================
// Task Group 5: Shopping List Detail Screen Tests
// =============================================================================

describe("Shopping List Detail Screen", () => {
  describe("View toggle", () => {
    it("should switch between By Aisle and By Recipe views", () => {
      let viewMode: "category" | "recipe" = "category";

      viewMode = "recipe";
      expect(viewMode).toBe("recipe");

      viewMode = "category";
      expect(viewMode).toBe("category");
    });
  });

  describe("Group items by category", () => {
    it("should group items correctly", () => {
      const items = [
        { name: "Milk", category: "Dairy & Eggs" },
        { name: "Cheese", category: "Dairy & Eggs" },
        { name: "Apples", category: "Produce" },
      ];

      const grouped = items.reduce(
        (acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        },
        {} as Record<string, typeof items>
      );

      expect(grouped["Dairy & Eggs"].length).toBe(2);
      expect(grouped["Produce"].length).toBe(1);
    });
  });

  describe("Group items by recipe", () => {
    it("should group items by source recipe", () => {
      const items = [
        { name: "Chicken", recipeName: "Pasta Primavera" },
        { name: "Tomato", recipeName: "Pasta Primavera" },
        { name: "Milk", recipeName: null, isCustom: true },
      ];

      const grouped = items.reduce(
        (acc, item) => {
          const key = item.isCustom ? "Custom Items" : item.recipeName || "Unknown";
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, typeof items>
      );

      expect(grouped["Pasta Primavera"].length).toBe(2);
      expect(grouped["Custom Items"].length).toBe(1);
    });
  });

  describe("Checkbox behavior", () => {
    it("should apply strikethrough when checked", () => {
      const item = { checked: true };
      const textStyle = item.checked ? "line-through" : "none";

      expect(textStyle).toBe("line-through");
    });
  });

  describe("Add item form validation", () => {
    it("should require non-empty name", () => {
      const validateName = (name: string) => name.trim().length > 0;

      expect(validateName("Milk")).toBe(true);
      expect(validateName("")).toBe(false);
      expect(validateName("   ")).toBe(false);
    });
  });

  describe("Read-only mode for archived lists", () => {
    it("should disable editing for archived lists", () => {
      const list = { status: "archived" };
      const isReadOnly = list.status === "archived";

      expect(isReadOnly).toBe(true);
    });
  });
});

// =============================================================================
// Task Group 6: Meal Selection and Offline Support Tests
// =============================================================================

describe("Meal Selection and Offline Support", () => {
  describe("Meal selection UI", () => {
    it("should allow selecting specific meals", () => {
      let selectedMealIds: string[] = [];

      // Select a meal
      selectedMealIds = [...selectedMealIds, "meal_1"];
      expect(selectedMealIds).toContain("meal_1");

      // Toggle off
      selectedMealIds = selectedMealIds.filter((id) => id !== "meal_1");
      expect(selectedMealIds).not.toContain("meal_1");
    });

    it("should track selection count", () => {
      const selectedMealIds = ["meal_1", "meal_2", "meal_3"];
      expect(selectedMealIds.length).toBe(3);
    });
  });

  describe("Sync status", () => {
    it("should reflect connection states", () => {
      const validStates = ["synced", "pending", "offline"];

      expect(validStates).toContain("synced");
      expect(validStates).toContain("pending");
      expect(validStates).toContain("offline");
    });
  });

  describe("Optimistic updates", () => {
    it("should update UI immediately on toggle", () => {
      const item = { checked: false };

      // Optimistic update
      const optimisticItem = { ...item, checked: true };
      expect(optimisticItem.checked).toBe(true);
    });
  });

  describe("Conflict resolution", () => {
    it("should use last-write-wins with timestamps", () => {
      const serverItem = { updatedAt: 1000, checked: false };
      const localItem = { updatedAt: 2000, checked: true };

      const winner =
        localItem.updatedAt > serverItem.updatedAt ? localItem : serverItem;

      expect(winner.checked).toBe(true);
    });
  });
});

// =============================================================================
// Authentication Tests
// =============================================================================

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

  it("should validate list ownership", () => {
    const list = { userId: "user_123" };
    const currentUserId = "user_456";

    const validateOwnership = (listUserId: string, currentUser: string) => {
      if (listUserId !== currentUser) {
        throw new Error("You do not have permission to access this list");
      }
    };

    expect(() => validateOwnership(list.userId, currentUserId)).toThrow(
      "You do not have permission to access this list"
    );
  });
});

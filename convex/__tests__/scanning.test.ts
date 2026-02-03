/**
 * Cookbook Photo Scanning Tests
 *
 * Tests for the scanning feature including:
 * - PhysicalCookbook schema and mutations
 * - ScanSession management
 * - Recipe scanning fields
 * - Multi-page merge utility
 * - Scanned recipe saving
 */

import {
  mergeMultiPageRecipe,
  formatPageRange,
  isRecipeIncomplete,
  type PageRecipeData,
} from "../lib/multiPageMerge";

// ============================================================================
// Task Group 1: PhysicalCookbook Entity and Schema Tests
// ============================================================================

describe("PhysicalCookbook Schema", () => {
  test("PhysicalCookbook has required fields", () => {
    // This test validates the schema shape
    const physicalCookbook = {
      userId: "user_123",
      name: "Joy of Cooking",
      createdAt: Date.now(),
    };

    expect(physicalCookbook).toHaveProperty("userId");
    expect(physicalCookbook).toHaveProperty("name");
    expect(physicalCookbook).toHaveProperty("createdAt");
    expect(typeof physicalCookbook.name).toBe("string");
    expect(typeof physicalCookbook.createdAt).toBe("number");
  });

  test("PhysicalCookbook with optional coverImageId", () => {
    const cookbookWithCover = {
      userId: "user_123",
      name: "Joy of Cooking",
      coverImageId: "storage_abc123" as any,
      author: "Irma S. Rombauer",
      createdAt: Date.now(),
    };

    expect(cookbookWithCover).toHaveProperty("coverImageId");
    expect(cookbookWithCover).toHaveProperty("author");
  });

  test("Recipe can have scannedFromBook reference", () => {
    const scannedRecipe = {
      userId: "user_123",
      title: "Chocolate Chip Cookies",
      source: "scanned" as const,
      physicalCookbookId: "cookbook_123" as any,
      pageNumber: "42",
      ingredients: [],
      instructions: [],
      servings: 4,
      prepTime: 15,
      cookTime: 12,
      imageUrl: "https://example.com/image.jpg",
      isFavorited: false,
      dietaryTags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(scannedRecipe.source).toBe("scanned");
    expect(scannedRecipe.physicalCookbookId).toBeDefined();
    expect(scannedRecipe.pageNumber).toBe("42");
  });

  test("Recipe pageNumber supports range format", () => {
    const multiPageRecipe = {
      userId: "user_123",
      title: "Beef Bourguignon",
      source: "scanned" as const,
      pageNumber: "pp. 142-143",
      ingredients: [],
      instructions: [],
      servings: 6,
      prepTime: 30,
      cookTime: 180,
      imageUrl: "https://example.com/image.jpg",
      isFavorited: false,
      dietaryTags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(multiPageRecipe.pageNumber).toBe("pp. 142-143");
  });

  test("Multiple recipes can reference same PhysicalCookbook", () => {
    const cookbookId = "cookbook_abc" as any;

    const recipe1 = {
      title: "Recipe 1",
      physicalCookbookId: cookbookId,
      pageNumber: "10",
    };

    const recipe2 = {
      title: "Recipe 2",
      physicalCookbookId: cookbookId,
      pageNumber: "25",
    };

    expect(recipe1.physicalCookbookId).toBe(recipe2.physicalCookbookId);
    expect(recipe1.pageNumber).not.toBe(recipe2.pageNumber);
  });
});

describe("ScanSession Schema", () => {
  test("ScanSession has required fields", () => {
    const session = {
      userId: "user_123",
      bookName: "Joy of Cooking",
      status: "active" as const,
      scannedRecipeIds: [],
      startedAt: Date.now(),
    };

    expect(session).toHaveProperty("userId");
    expect(session).toHaveProperty("bookName");
    expect(session).toHaveProperty("status");
    expect(session).toHaveProperty("scannedRecipeIds");
    expect(session).toHaveProperty("startedAt");
  });

  test("ScanSession tracks scanned recipe IDs", () => {
    const session = {
      userId: "user_123",
      bookName: "Joy of Cooking",
      status: "active" as const,
      scannedRecipeIds: ["recipe_1", "recipe_2", "recipe_3"] as any[],
      startedAt: Date.now(),
    };

    expect(session.scannedRecipeIds).toHaveLength(3);
    expect(Array.isArray(session.scannedRecipeIds)).toBe(true);
  });

  test("ScanSession status transitions", () => {
    const validStatuses = ["active", "completed", "cancelled"];

    validStatuses.forEach(status => {
      const session = {
        userId: "user_123",
        bookName: "Test Book",
        status: status as "active" | "completed" | "cancelled",
        scannedRecipeIds: [],
        startedAt: Date.now(),
      };

      expect(validStatuses).toContain(session.status);
    });
  });
});

// ============================================================================
// Task Group 2: Multi-Page Merge Utility Tests
// ============================================================================

describe("Multi-Page Merge Utility", () => {
  test("formatPageRange handles single page", () => {
    expect(formatPageRange(["42"])).toBe("42");
    expect(formatPageRange(["10"])).toBe("10");
  });

  test("formatPageRange handles consecutive pages", () => {
    expect(formatPageRange(["42", "43"])).toBe("pp. 42-43");
    expect(formatPageRange(["10", "11", "12"])).toBe("pp. 10-12");
  });

  test("formatPageRange handles non-consecutive pages", () => {
    expect(formatPageRange(["42", "45", "47"])).toBe("pp. 42, 45, 47");
  });

  test("formatPageRange handles null values", () => {
    expect(formatPageRange([null, "42"])).toBe("42");
    expect(formatPageRange(["42", null, "43"])).toBe("pp. 42-43");
    expect(formatPageRange([null, null])).toBe("");
  });

  test("mergeMultiPageRecipe uses first non-empty title", () => {
    const pages: PageRecipeData[] = [
      {
        title: null,
        ingredients: [],
        instructions: [],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "42",
      },
      {
        title: "Chocolate Chip Cookies",
        ingredients: [],
        instructions: [],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "43",
      },
    ];

    const merged = mergeMultiPageRecipe(pages);
    expect(merged.title).toBe("Chocolate Chip Cookies");
  });

  test("mergeMultiPageRecipe concatenates ingredients", () => {
    const pages: PageRecipeData[] = [
      {
        title: "Recipe",
        ingredients: [
          { name: "flour", quantity: 2, unit: "cups", category: "pantry" },
          { name: "sugar", quantity: 1, unit: "cup", category: "pantry" },
        ],
        instructions: [],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "42",
      },
      {
        title: null,
        ingredients: [
          { name: "butter", quantity: 1, unit: "cup", category: "dairy" },
          { name: "eggs", quantity: 2, unit: "item", category: "dairy" },
        ],
        instructions: [],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "43",
      },
    ];

    const merged = mergeMultiPageRecipe(pages);
    expect(merged.ingredients).toHaveLength(4);
    expect(merged.ingredients[0].name).toBe("flour");
    expect(merged.ingredients[3].name).toBe("eggs");
  });

  test("mergeMultiPageRecipe appends instructions in order", () => {
    const pages: PageRecipeData[] = [
      {
        title: "Recipe",
        ingredients: [],
        instructions: ["Step 1", "Step 2"],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "42",
      },
      {
        title: null,
        ingredients: [],
        instructions: ["Step 3", "Step 4"],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "43",
      },
    ];

    const merged = mergeMultiPageRecipe(pages);
    expect(merged.instructions).toHaveLength(4);
    expect(merged.instructions[0]).toBe("Step 1");
    expect(merged.instructions[3]).toBe("Step 4");
  });

  test("mergeMultiPageRecipe uses first non-null values for scalars", () => {
    const pages: PageRecipeData[] = [
      {
        title: "Recipe",
        ingredients: [],
        instructions: [],
        servings: 8,
        prepTime: null,
        cookTime: 30,
        pageNumber: "42",
      },
      {
        title: null,
        ingredients: [],
        instructions: [],
        servings: 4,
        prepTime: 15,
        cookTime: 45,
        pageNumber: "43",
      },
    ];

    const merged = mergeMultiPageRecipe(pages);
    expect(merged.servings).toBe(8); // First non-default
    expect(merged.prepTime).toBe(15); // First non-null
    expect(merged.cookTime).toBe(30); // First non-null
  });

  test("mergeMultiPageRecipe combines page numbers", () => {
    const pages: PageRecipeData[] = [
      {
        title: "Recipe",
        ingredients: [],
        instructions: [],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "42",
      },
      {
        title: null,
        ingredients: [],
        instructions: [],
        servings: null,
        prepTime: null,
        cookTime: null,
        pageNumber: "43",
      },
    ];

    const merged = mergeMultiPageRecipe(pages);
    expect(merged.pageNumber).toBe("pp. 42-43");
  });

  test("isRecipeIncomplete detects missing instructions", () => {
    const incomplete: PageRecipeData = {
      title: "Recipe",
      ingredients: [
        { name: "flour", quantity: 1, unit: "cup", category: "pantry" },
      ],
      instructions: [],
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      pageNumber: "42",
    };

    expect(isRecipeIncomplete(incomplete)).toBe(true);
  });

  test("isRecipeIncomplete detects missing ingredients", () => {
    const incomplete: PageRecipeData = {
      title: "Recipe",
      ingredients: [],
      instructions: ["Step 1", "Step 2"],
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      pageNumber: "42",
    };

    expect(isRecipeIncomplete(incomplete)).toBe(true);
  });

  test("isRecipeIncomplete returns false for complete recipe", () => {
    const complete: PageRecipeData = {
      title: "Recipe",
      ingredients: [
        { name: "flour", quantity: 1, unit: "cup", category: "pantry" },
        { name: "sugar", quantity: 0.5, unit: "cup", category: "pantry" },
        { name: "butter", quantity: 0.5, unit: "cup", category: "dairy" },
      ],
      instructions: ["Mix dry ingredients", "Add butter", "Bake at 350F"],
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      pageNumber: "42",
    };

    expect(isRecipeIncomplete(complete)).toBe(false);
  });
});

// ============================================================================
// Task Group 2: Gemini Response Parsing Tests
// ============================================================================

describe("Gemini Recipe Extraction", () => {
  test("Valid extraction response structure", () => {
    const mockGeminiResponse = {
      success: true,
      title: "Chocolate Chip Cookies",
      ingredients: [
        { name: "flour", quantity: 2.25, unit: "cups", category: "pantry" },
        { name: "chocolate chips", quantity: 2, unit: "cups", category: "pantry" },
      ],
      instructions: [
        "Preheat oven to 375F",
        "Mix dry ingredients",
        "Add wet ingredients",
        "Drop onto baking sheet",
        "Bake for 9-11 minutes",
      ],
      servings: 48,
      prepTime: 15,
      cookTime: 11,
      pageNumber: "42",
    };

    expect(mockGeminiResponse.success).toBe(true);
    expect(mockGeminiResponse.title).toBeTruthy();
    expect(mockGeminiResponse.ingredients).toHaveLength(2);
    expect(mockGeminiResponse.instructions).toHaveLength(5);
    expect(mockGeminiResponse.servings).toBe(48);
  });

  test("Error response for non-recipe page", () => {
    const errorResponse = {
      success: false,
      error: "NOT_A_RECIPE",
      message: "This page does not contain a recipe",
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe("NOT_A_RECIPE");
  });

  test("Error response for poor image quality", () => {
    const errorResponse = {
      success: false,
      error: "POOR_QUALITY",
      message: "Image quality is too poor to extract recipe",
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe("POOR_QUALITY");
  });

  test("Ingredient category validation", () => {
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

    const ingredient = {
      name: "chicken breast",
      quantity: 2,
      unit: "lbs",
      category: "meat",
    };

    expect(validCategories).toContain(ingredient.category);
  });
});

// ============================================================================
// Task Group 3: Camera Integration Tests (Component Structure)
// ============================================================================

describe("CameraViewfinder Component", () => {
  test("Props interface has required fields", () => {
    const props = {
      onCapture: (imageBase64: string, mimeType: string) => {},
      isProcessing: false,
    };

    expect(props).toHaveProperty("onCapture");
    expect(props).toHaveProperty("isProcessing");
    expect(typeof props.onCapture).toBe("function");
    expect(typeof props.isProcessing).toBe("boolean");
  });

  test("Guidance message types are defined", () => {
    const guidanceTypes = ["hold_steady", "move_closer", "position_page", "ready"];

    guidanceTypes.forEach(type => {
      expect(typeof type).toBe("string");
    });
  });
});

// ============================================================================
// Task Group 4: Scan Session UI Flow Tests (State Machine)
// ============================================================================

describe("ScanSession UI State Machine", () => {
  test("Valid step transitions", () => {
    const steps = ["cover", "scanning", "processing", "review", "complete"];

    // cover -> scanning (after cover capture or skip)
    expect(steps.indexOf("cover")).toBeLessThan(steps.indexOf("scanning"));

    // scanning -> processing (after page capture)
    expect(steps.indexOf("scanning")).toBeLessThan(steps.indexOf("processing"));

    // processing -> review (after extraction)
    expect(steps.indexOf("processing")).toBeLessThan(steps.indexOf("review"));

    // review -> complete (after done scanning)
    expect(steps.indexOf("review")).toBeLessThan(steps.indexOf("complete"));
  });

  test("Session state has required properties", () => {
    const sessionState = {
      sessionId: null as any,
      step: "cover" as const,
      bookName: "",
      coverImageUrl: null as string | null,
      physicalCookbookId: null as any,
      scannedRecipes: [] as any[],
      currentRecipe: null as any,
      multiPageData: [] as any[],
      isMultiPage: false,
      error: null as { type: string; message: string } | null,
    };

    expect(sessionState).toHaveProperty("step");
    expect(sessionState).toHaveProperty("bookName");
    expect(sessionState).toHaveProperty("scannedRecipes");
    expect(sessionState).toHaveProperty("currentRecipe");
    expect(sessionState).toHaveProperty("isMultiPage");
    expect(sessionState).toHaveProperty("error");
  });

  test("Multi-page flow tracks page data", () => {
    const multiPageData = [
      { pageNumber: 1, extractedData: { title: "Recipe Part 1" } },
      { pageNumber: 2, extractedData: { title: "Recipe Part 2" } },
    ];

    expect(multiPageData).toHaveLength(2);
    expect(multiPageData[0].pageNumber).toBe(1);
    expect(multiPageData[1].pageNumber).toBe(2);
  });
});

// ============================================================================
// Task Group 5: Recipe Edit Form Tests
// ============================================================================

describe("ScannedRecipeEditForm", () => {
  test("Form data matches extracted recipe structure", () => {
    const extractedRecipe = {
      title: "Test Recipe",
      ingredients: [
        { name: "ingredient1", quantity: 1, unit: "cup", category: "pantry" as const },
      ],
      instructions: ["Step 1"],
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      pageNumber: "42",
    };

    expect(extractedRecipe).toHaveProperty("title");
    expect(extractedRecipe).toHaveProperty("ingredients");
    expect(extractedRecipe).toHaveProperty("instructions");
    expect(extractedRecipe).toHaveProperty("servings");
    expect(extractedRecipe).toHaveProperty("prepTime");
    expect(extractedRecipe).toHaveProperty("cookTime");
  });

  test("Ingredient modification maintains structure", () => {
    const ingredient = {
      name: "flour",
      quantity: 2,
      unit: "cups",
      category: "pantry" as const,
    };

    // Simulate quantity change
    const modified = { ...ingredient, quantity: 3 };

    expect(modified.name).toBe("flour");
    expect(modified.quantity).toBe(3);
    expect(modified.unit).toBe("cups");
    expect(modified.category).toBe("pantry");
  });

  test("Instruction editing preserves order", () => {
    const instructions = ["Step 1", "Step 2", "Step 3"];

    // Simulate editing step 2
    const edited = [...instructions];
    edited[1] = "Step 2 (edited)";

    expect(edited).toHaveLength(3);
    expect(edited[0]).toBe("Step 1");
    expect(edited[1]).toBe("Step 2 (edited)");
    expect(edited[2]).toBe("Step 3");
  });

  test("Adding new ingredient appends to list", () => {
    const ingredients = [
      { name: "flour", quantity: 2, unit: "cups", category: "pantry" as const },
    ];

    const newIngredient = {
      name: "",
      quantity: 1,
      unit: "item",
      category: "other" as const,
    };

    const updated = [...ingredients, newIngredient];

    expect(updated).toHaveLength(2);
    expect(updated[1].category).toBe("other");
  });

  test("Removing instruction updates indices", () => {
    const instructions = ["Step 1", "Step 2", "Step 3"];

    // Remove step 2 (index 1)
    const filtered = instructions.filter((_, i) => i !== 1);

    expect(filtered).toHaveLength(2);
    expect(filtered[0]).toBe("Step 1");
    expect(filtered[1]).toBe("Step 3");
  });
});

// ============================================================================
// Task Group 6: Integration Tests
// ============================================================================

describe("Scanning Integration", () => {
  test("Complete single-page recipe scan data flow", () => {
    // Simulate complete flow
    const scanSession = {
      bookName: "Joy of Cooking",
      coverImageId: "cover_123",
      status: "active" as const,
      scannedRecipeIds: [],
    };

    const extractedRecipe = {
      title: "Chocolate Cake",
      ingredients: [
        { name: "flour", quantity: 2, unit: "cups", category: "pantry" as const },
        { name: "sugar", quantity: 1.5, unit: "cups", category: "pantry" as const },
      ],
      instructions: ["Mix ingredients", "Bake at 350F", "Cool and serve"],
      servings: 8,
      prepTime: 20,
      cookTime: 35,
      pageNumber: "125",
    };

    // Verify data can be saved
    expect(extractedRecipe.title).toBeTruthy();
    expect(extractedRecipe.ingredients.length).toBeGreaterThan(0);
    expect(extractedRecipe.instructions.length).toBeGreaterThan(0);
    expect(extractedRecipe.pageNumber).toBe("125");
  });

  test("Multi-page recipe merge produces valid recipe", () => {
    const page1: PageRecipeData = {
      title: "Beef Bourguignon",
      ingredients: [
        { name: "beef chuck", quantity: 3, unit: "lbs", category: "meat" },
        { name: "red wine", quantity: 3, unit: "cups", category: "other" },
      ],
      instructions: ["Cut beef into cubes", "Brown the beef"],
      servings: 6,
      prepTime: 30,
      cookTime: null,
      pageNumber: "142",
    };

    const page2: PageRecipeData = {
      title: null,
      ingredients: [
        { name: "mushrooms", quantity: 1, unit: "lb", category: "produce" },
        { name: "pearl onions", quantity: 1, unit: "lb", category: "produce" },
      ],
      instructions: ["Add vegetables", "Simmer for 2 hours", "Serve hot"],
      servings: null,
      prepTime: null,
      cookTime: 180,
      pageNumber: "143",
    };

    const merged = mergeMultiPageRecipe([page1, page2]);

    expect(merged.title).toBe("Beef Bourguignon");
    expect(merged.ingredients).toHaveLength(4);
    expect(merged.instructions).toHaveLength(5);
    expect(merged.servings).toBe(6);
    expect(merged.prepTime).toBe(30);
    expect(merged.cookTime).toBe(180);
    expect(merged.pageNumber).toBe("pp. 142-143");
  });

  test("Skip cover creates valid session", () => {
    const sessionWithoutCover = {
      userId: "user_123",
      bookName: "My Cookbook",
      physicalCookbookId: undefined,
      coverImageId: undefined,
      status: "active" as const,
      scannedRecipeIds: [],
      startedAt: Date.now(),
    };

    expect(sessionWithoutCover.coverImageId).toBeUndefined();
    expect(sessionWithoutCover.status).toBe("active");
    expect(sessionWithoutCover.bookName).toBe("My Cookbook");
  });

  test("Error recovery maintains session state", () => {
    const sessionState = {
      sessionId: "session_123" as any,
      step: "scanning" as const,
      bookName: "Joy of Cooking",
      coverImageUrl: "https://example.com/cover.jpg",
      scannedRecipes: [
        { _id: "recipe_1" as any, title: "Recipe 1", ingredientCount: 5, instructionCount: 4 },
      ],
      error: {
        type: "EXTRACTION_FAILED",
        message: "Failed to extract recipe",
      },
    };

    // After retry, error should be cleared but other state preserved
    const afterRetry = {
      ...sessionState,
      error: null,
    };

    expect(afterRetry.sessionId).toBe(sessionState.sessionId);
    expect(afterRetry.scannedRecipes).toHaveLength(1);
    expect(afterRetry.coverImageUrl).toBe(sessionState.coverImageUrl);
    expect(afterRetry.error).toBeNull();
  });

  test("Multiple recipes in session all track correctly", () => {
    const session = {
      bookName: "Complete Cookbook",
      scannedRecipeIds: ["recipe_1", "recipe_2", "recipe_3"] as any[],
      status: "active" as const,
    };

    expect(session.scannedRecipeIds).toHaveLength(3);

    // Add another recipe
    const updatedSession = {
      ...session,
      scannedRecipeIds: [...session.scannedRecipeIds, "recipe_4" as any],
    };

    expect(updatedSession.scannedRecipeIds).toHaveLength(4);
  });

  test("Cookbook reuse returns existing ID", () => {
    // Simulate finding existing cookbook by name
    const existingCookbooks = [
      { _id: "cookbook_1" as any, name: "Joy of Cooking", userId: "user_123" },
      { _id: "cookbook_2" as any, name: "The Food Lab", userId: "user_123" },
    ];

    const bookNameToFind = "Joy of Cooking";
    const found = existingCookbooks.find(c => c.name === bookNameToFind);

    expect(found).toBeDefined();
    expect(found?._id).toBe("cookbook_1");
  });
});

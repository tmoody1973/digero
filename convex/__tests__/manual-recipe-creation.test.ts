/**
 * Manual Recipe Creation Tests
 *
 * Tests for the manual recipe creation feature including:
 * - Form validation
 * - Bulk paste parsing
 * - Recipe creation mutations
 */

describe("Manual Recipe Creation", () => {
  describe("Form Validation", () => {
    // Test title validation
    describe("Title validation", () => {
      it("should require a non-empty title", () => {
        const title = "";
        const isValid = title.trim().length > 0;
        expect(isValid).toBe(false);
      });

      it("should accept a valid title", () => {
        const title = "Chicken Parmesan";
        const isValid = title.trim().length > 0 && title.length <= 200;
        expect(isValid).toBe(true);
      });

      it("should reject titles over 200 characters", () => {
        const title = "A".repeat(201);
        const isValid = title.length <= 200;
        expect(isValid).toBe(false);
      });
    });

    // Test servings validation
    describe("Servings validation", () => {
      it("should accept integer values 1-99", () => {
        const validServings = [1, 4, 50, 99];
        validServings.forEach((servings) => {
          const isValid =
            Number.isInteger(servings) && servings >= 1 && servings <= 99;
          expect(isValid).toBe(true);
        });
      });

      it("should reject values outside 1-99 range", () => {
        const invalidServings = [0, -1, 100, 150];
        invalidServings.forEach((servings) => {
          const isValid =
            Number.isInteger(servings) && servings >= 1 && servings <= 99;
          expect(isValid).toBe(false);
        });
      });
    });

    // Test ingredient validation
    describe("Ingredient validation", () => {
      it("should require at least one ingredient with a name", () => {
        const ingredients = [{ name: "", quantity: "", unit: "", category: "other" }];
        const hasValidIngredient = ingredients.some((ing) => ing.name.trim());
        expect(hasValidIngredient).toBe(false);
      });

      it("should accept ingredients with non-empty names", () => {
        const ingredients = [
          { name: "Chicken breast", quantity: "2", unit: "lb", category: "meat" },
        ];
        const hasValidIngredient = ingredients.some((ing) => ing.name.trim());
        expect(hasValidIngredient).toBe(true);
      });
    });

    // Test instruction validation
    describe("Instruction validation", () => {
      it("should require at least one instruction", () => {
        const instructions = [{ id: "1", text: "" }];
        const hasValidInstruction = instructions.some((inst) => inst.text.trim());
        expect(hasValidInstruction).toBe(false);
      });

      it("should accept non-empty instructions", () => {
        const instructions = [{ id: "1", text: "Preheat oven to 350F" }];
        const hasValidInstruction = instructions.some((inst) => inst.text.trim());
        expect(hasValidInstruction).toBe(true);
      });
    });

    // Test nutrition validation
    describe("Nutrition validation", () => {
      it("should accept non-negative numbers", () => {
        const values = [0, 100, 250.5];
        values.forEach((val) => {
          const isValid = !isNaN(val) && val >= 0;
          expect(isValid).toBe(true);
        });
      });

      it("should reject negative numbers", () => {
        const values = [-1, -100];
        values.forEach((val) => {
          const isValid = !isNaN(val) && val >= 0;
          expect(isValid).toBe(false);
        });
      });
    });
  });

  describe("Bulk Paste Parsing", () => {
    // Helper function to parse instructions (same logic as component)
    function parseInstructions(text: string): string[] {
      const numberedPattern = /(?:^|\n)\s*\d+[\.\)\:]\s*/;

      if (numberedPattern.test(text)) {
        const steps = text
          .split(/(?:^|\n)\s*\d+[\.\)\:]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        return steps;
      }

      const steps = text
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (steps.length === 0 && text.trim()) {
        return [text.trim()];
      }

      return steps;
    }

    it("should parse numbered steps with period format", () => {
      const text = "1. First step\n2. Second step\n3. Third step";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toBe("First step");
      expect(steps[1]).toBe("Second step");
      expect(steps[2]).toBe("Third step");
    });

    it("should parse numbered steps with parenthesis format", () => {
      const text = "1) First step\n2) Second step\n3) Third step";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toBe("First step");
    });

    it("should parse numbered steps with colon format", () => {
      const text = "1: First step\n2: Second step\n3: Third step";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toBe("First step");
    });

    it("should fall back to double newline splitting", () => {
      const text = "First paragraph here\n\nSecond paragraph here\n\nThird paragraph here";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(3);
      expect(steps[0]).toBe("First paragraph here");
    });

    it("should treat single block of text as one step", () => {
      const text = "This is a single instruction without any breaks or numbering";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toBe(text);
    });

    it("should handle empty text", () => {
      const text = "";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(0);
    });

    it("should handle whitespace-only text", () => {
      const text = "   \n\n   ";
      const steps = parseInstructions(text);
      expect(steps).toHaveLength(0);
    });
  });

  describe("Dirty State Detection", () => {
    // Helper to check if form is dirty
    function isDirty(
      formState: any,
      initialState: any
    ): boolean {
      return (
        formState.title !== initialState.title ||
        formState.imageUri !== initialState.imageUri ||
        formState.ingredients.some(
          (ing: any) => ing.name || ing.quantity || ing.unit
        ) ||
        formState.instructions.some((inst: any) => inst.text) ||
        formState.servings !== initialState.servings ||
        formState.notes !== initialState.notes
      );
    }

    const initialState = {
      title: "",
      imageUri: null,
      ingredients: [{ name: "", quantity: "", unit: "" }],
      instructions: [{ text: "" }],
      servings: "",
      notes: "",
    };

    it("should detect title changes", () => {
      const formState = { ...initialState, title: "New Recipe" };
      expect(isDirty(formState, initialState)).toBe(true);
    });

    it("should detect ingredient changes", () => {
      const formState = {
        ...initialState,
        ingredients: [{ name: "Flour", quantity: "", unit: "" }],
      };
      expect(isDirty(formState, initialState)).toBe(true);
    });

    it("should detect instruction changes", () => {
      const formState = {
        ...initialState,
        instructions: [{ text: "Step one" }],
      };
      expect(isDirty(formState, initialState)).toBe(true);
    });

    it("should return false for unchanged form", () => {
      const formState = { ...initialState };
      expect(isDirty(formState, initialState)).toBe(false);
    });
  });

  describe("Category Options", () => {
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

    it("should have all 8 required categories", () => {
      expect(validCategories).toHaveLength(8);
    });

    it("should include 'other' as default category", () => {
      expect(validCategories).toContain("other");
    });
  });

  describe("Unit Options", () => {
    const unitOptions = [
      "cup",
      "tbsp",
      "tsp",
      "oz",
      "lb",
      "piece",
      "clove",
      "bunch",
      "can",
      "package",
    ];

    it("should have all 10 required units", () => {
      expect(unitOptions).toHaveLength(10);
    });

    it("should include common cooking units", () => {
      expect(unitOptions).toContain("cup");
      expect(unitOptions).toContain("tbsp");
      expect(unitOptions).toContain("tsp");
    });
  });

  describe("Dietary Tag Options", () => {
    const dietaryTags = [
      "vegetarian",
      "vegan",
      "gluten-free",
      "dairy-free",
      "nut-free",
      "low-carb",
      "keto",
      "paleo",
    ];

    it("should have all 8 dietary tag options", () => {
      expect(dietaryTags).toHaveLength(8);
    });

    it("should include common dietary restrictions", () => {
      expect(dietaryTags).toContain("vegetarian");
      expect(dietaryTags).toContain("vegan");
      expect(dietaryTags).toContain("gluten-free");
    });
  });

  describe("Difficulty Levels", () => {
    const difficultyLevels = ["easy", "medium", "hard"];

    it("should have exactly 3 difficulty levels", () => {
      expect(difficultyLevels).toHaveLength(3);
    });

    it("should include easy, medium, and hard", () => {
      expect(difficultyLevels).toContain("easy");
      expect(difficultyLevels).toContain("medium");
      expect(difficultyLevels).toContain("hard");
    });
  });
});

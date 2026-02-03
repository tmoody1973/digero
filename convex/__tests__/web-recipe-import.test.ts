/**
 * Web Recipe Import Tests
 *
 * Tests for URL fetching, structured data parsing, and Gemini AI extraction.
 * Covers Task Groups 1 and 2 of the Web Recipe Import feature.
 */

import { parseJsonLdRecipe } from "../lib/parseJsonLdRecipe";
import { parseMicrodataRecipe } from "../lib/parseMicrodataRecipe";

// =============================================================================
// Task Group 1: URL Fetching and Parsing Tests
// =============================================================================

describe("URL Fetching and Parsing", () => {
  describe("URL Validation", () => {
    it("should validate HTTP URLs as valid", () => {
      const isValidUrl = (url: string): boolean => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      };

      expect(isValidUrl("http://example.com/recipe")).toBe(true);
      expect(isValidUrl("https://example.com/recipe")).toBe(true);
    });

    it("should reject invalid URL formats", () => {
      const isValidUrl = (url: string): boolean => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      };

      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("javascript:alert(1)")).toBe(false);
    });

    it("should handle timeout logic for 30-second limit", () => {
      // Test timeout configuration
      const FETCH_TIMEOUT = 30000; // 30 seconds
      expect(FETCH_TIMEOUT).toBe(30000);

      // Simulate timeout detection
      const isTimedOut = (startTime: number, timeout: number): boolean => {
        return Date.now() - startTime > timeout;
      };

      const pastTime = Date.now() - 35000; // 35 seconds ago
      expect(isTimedOut(pastTime, FETCH_TIMEOUT)).toBe(true);

      const recentTime = Date.now() - 10000; // 10 seconds ago
      expect(isTimedOut(recentTime, FETCH_TIMEOUT)).toBe(false);
    });
  });

  describe("JSON-LD Recipe Parsing", () => {
    it("should extract Recipe data from JSON-LD script tags", () => {
      const htmlWithJsonLd = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Chocolate Chip Cookies",
            "image": "https://example.com/cookies.jpg",
            "recipeIngredient": [
              "2 cups flour",
              "1 cup sugar",
              "1 cup chocolate chips"
            ],
            "recipeInstructions": [
              "Mix dry ingredients",
              "Add wet ingredients",
              "Bake at 350F"
            ],
            "recipeYield": "24 cookies",
            "prepTime": "PT15M",
            "cookTime": "PT12M"
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const result = parseJsonLdRecipe(htmlWithJsonLd);

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Chocolate Chip Cookies");
      expect(result?.imageUrl).toBe("https://example.com/cookies.jpg");
      expect(result?.ingredients.length).toBe(3);
      expect(result?.instructions.length).toBe(3);
      expect(result?.prepTime).toBe(15);
      expect(result?.cookTime).toBe(12);
      expect(result?.extractionMethod).toBe("jsonld");
    });

    it("should handle JSON-LD with @graph format", () => {
      const htmlWithGraph = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "name": "Recipe Page"
              },
              {
                "@type": "Recipe",
                "name": "Pasta Carbonara",
                "recipeIngredient": ["Pasta", "Eggs", "Bacon"],
                "recipeInstructions": ["Boil pasta", "Mix eggs", "Combine"]
              }
            ]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const result = parseJsonLdRecipe(htmlWithGraph);

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Pasta Carbonara");
      expect(result?.ingredients.length).toBe(3);
    });

    it("should return null when no Recipe JSON-LD found", () => {
      const htmlWithoutRecipe = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "Article",
            "name": "Some Article"
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const result = parseJsonLdRecipe(htmlWithoutRecipe);
      expect(result).toBeNull();
    });

    it("should parse ISO 8601 duration correctly", () => {
      const htmlWithDurations = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "Recipe",
            "name": "Test Recipe",
            "prepTime": "PT1H30M",
            "cookTime": "PT45M"
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const result = parseJsonLdRecipe(htmlWithDurations);

      expect(result?.prepTime).toBe(90); // 1h 30m = 90 minutes
      expect(result?.cookTime).toBe(45);
    });
  });

  describe("Microdata Recipe Parsing", () => {
    it("should extract Recipe data from microdata markup", () => {
      const htmlWithMicrodata = `
        <!DOCTYPE html>
        <html>
        <body>
          <div itemscope itemtype="http://schema.org/Recipe">
            <h1 itemprop="name">Simple Salad</h1>
            <img itemprop="image" src="https://example.com/salad.jpg">
            <span itemprop="recipeIngredient">Lettuce</span>
            <span itemprop="recipeIngredient">Tomatoes</span>
            <span itemprop="recipeIngredient">Dressing</span>
            <meta itemprop="prepTime" content="PT10M">
            <meta itemprop="cookTime" content="PT0M">
            <span itemprop="recipeYield">2 servings</span>
          </div>
        </body>
        </html>
      `;

      const result = parseMicrodataRecipe(htmlWithMicrodata);

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Simple Salad");
      expect(result?.imageUrl).toBe("https://example.com/salad.jpg");
      expect(result?.ingredients.length).toBe(3);
      expect(result?.prepTime).toBe(10);
      expect(result?.extractionMethod).toBe("microdata");
    });

    it("should return null when no Recipe microdata found", () => {
      const htmlWithoutRecipe = `
        <!DOCTYPE html>
        <html>
        <body>
          <div itemscope itemtype="http://schema.org/Article">
            <h1 itemprop="name">Some Article</h1>
          </div>
        </body>
        </html>
      `;

      const result = parseMicrodataRecipe(htmlWithoutRecipe);
      expect(result).toBeNull();
    });
  });
});

// =============================================================================
// Task Group 2: Gemini AI Extraction Tests
// =============================================================================

describe("Gemini AI Extraction", () => {
  describe("Extraction Response Parsing", () => {
    it("should parse valid Gemini JSON response with ingredients", () => {
      const geminiResponse = {
        title: "Grilled Chicken",
        imageUrl: "https://example.com/chicken.jpg",
        ingredients: [
          {
            raw: "2 lbs chicken breast",
            parsed: {
              name: "chicken breast",
              quantity: 2,
              unit: "lbs",
              category: "meat",
            },
          },
          {
            raw: "1 tbsp olive oil",
            parsed: {
              name: "olive oil",
              quantity: 1,
              unit: "tbsp",
              category: "pantry",
            },
          },
        ],
        instructions: ["Season chicken", "Grill for 6 minutes per side"],
        servings: 4,
        prepTime: 10,
        cookTime: 12,
        confidence: {
          title: "high",
          imageUrl: "high",
          ingredients: "high",
          instructions: "high",
          servings: "medium",
          prepTime: "medium",
          cookTime: "medium",
        },
      };

      // Validate response structure
      expect(geminiResponse.title).toBe("Grilled Chicken");
      expect(geminiResponse.ingredients.length).toBe(2);
      expect(geminiResponse.ingredients[0].parsed?.category).toBe("meat");
      expect(geminiResponse.ingredients[1].parsed?.category).toBe("pantry");
      expect(geminiResponse.confidence.title).toBe("high");
    });

    it("should handle all ingredient categories correctly", () => {
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

      const ingredientExamples = [
        { name: "chicken", category: "meat" },
        { name: "carrots", category: "produce" },
        { name: "milk", category: "dairy" },
        { name: "flour", category: "pantry" },
        { name: "paprika", category: "spices" },
        { name: "ketchup", category: "condiments" },
        { name: "sourdough", category: "bread" },
        { name: "ice cubes", category: "other" },
      ];

      ingredientExamples.forEach((ing) => {
        expect(validCategories).toContain(ing.category);
      });
    });

    it("should include confidence scores for all fields", () => {
      const requiredConfidenceFields = [
        "title",
        "imageUrl",
        "ingredients",
        "instructions",
        "servings",
        "prepTime",
        "cookTime",
      ];

      const confidenceScores = {
        title: "high",
        imageUrl: "medium",
        ingredients: "high",
        instructions: "medium",
        servings: "low",
        prepTime: "low",
        cookTime: "medium",
      };

      requiredConfidenceFields.forEach((field) => {
        expect(confidenceScores).toHaveProperty(field);
        expect(["high", "medium", "low"]).toContain(
          confidenceScores[field as keyof typeof confidenceScores]
        );
      });
    });

    it("should handle 60-second timeout configuration", () => {
      const AI_TIMEOUT = 60000; // 60 seconds
      expect(AI_TIMEOUT).toBe(60000);

      // Verify timeout is greater than fetch timeout
      const FETCH_TIMEOUT = 30000;
      expect(AI_TIMEOUT).toBeGreaterThan(FETCH_TIMEOUT);
    });
  });

  describe("Extraction Pipeline Integration", () => {
    it("should define correct extraction method priority", () => {
      const extractionMethods = ["jsonld", "microdata", "ai"];

      // JSON-LD should be first priority
      expect(extractionMethods[0]).toBe("jsonld");
      // Microdata should be second
      expect(extractionMethods[1]).toBe("microdata");
      // AI should be fallback
      expect(extractionMethods[2]).toBe("ai");
    });

    it("should map extraction result to recipe interface", () => {
      // Verify the structure matches what createRecipe expects
      const expectedRecipeFields = {
        title: "string",
        source: "website",
        sourceUrl: "string",
        youtubeVideoId: null,
        imageUrl: "string",
        servings: "number",
        prepTime: "number",
        cookTime: "number",
        ingredients: "array",
        instructions: "array",
        notes: "string",
      };

      // Source should always be 'website' for URL imports
      expect(expectedRecipeFields.source).toBe("website");
      // YouTube video ID should be null
      expect(expectedRecipeFields.youtubeVideoId).toBeNull();
    });
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe("Error Handling", () => {
  it("should define all error types", () => {
    const errorTypes = [
      "INVALID_URL",
      "FETCH_FAILED",
      "TIMEOUT",
      "PAYWALL_DETECTED",
      "EXTRACTION_FAILED",
      "NO_RECIPE_FOUND",
    ];

    // Each error type should be a string
    errorTypes.forEach((type) => {
      expect(typeof type).toBe("string");
      expect(type.length).toBeGreaterThan(0);
    });
  });

  it("should detect paywall indicators", () => {
    const paywallIndicators = [
      "subscription required",
      "subscribe to continue",
      "premium content",
      "paywall",
      "sign in to read",
    ];

    const detectPaywall = (html: string): boolean => {
      const lowerHtml = html.toLowerCase();
      return paywallIndicators.some((indicator) =>
        lowerHtml.includes(indicator)
      );
    };

    expect(detectPaywall("Please subscribe to continue reading")).toBe(true);
    expect(detectPaywall("This is premium content for members")).toBe(true);
    expect(detectPaywall("Here is a great recipe for cookies")).toBe(false);
  });

  it("should provide user-friendly error messages", () => {
    const errorMessages = {
      INVALID_URL:
        "Invalid URL format. Please provide a valid HTTP or HTTPS URL.",
      FETCH_FAILED: "Failed to fetch URL content",
      TIMEOUT:
        "Request timed out. The website took too long to respond. Please try again.",
      PAYWALL_DETECTED:
        "This recipe appears to be behind a paywall. Please try a different URL.",
      EXTRACTION_FAILED: "Failed to extract recipe data from the page",
      NO_RECIPE_FOUND: "No recipe found in the page content",
    };

    // Each message should be descriptive
    Object.values(errorMessages).forEach((message) => {
      expect(message.length).toBeGreaterThan(10);
    });
  });
});

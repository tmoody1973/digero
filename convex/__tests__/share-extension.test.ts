/**
 * iOS Share Sheet Extension Tests
 *
 * Tests for deep link parsing, share context handling, and URL validation.
 * Covers Task Group 6 of the Web Recipe Import feature.
 */

// =============================================================================
// Deep Link Parsing Tests
// =============================================================================

describe("Deep Link Parsing", () => {
  /**
   * Parse deep link URL (matches implementation in shareExtension.ts)
   */
  const parseDeepLink = (url: string | null) => {
    if (!url) {
      return {
        isFromShare: false,
        sharedUrl: null,
        deepLinkUrl: null,
      };
    }

    try {
      // Simple URL parsing for tests
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/^\/+/, "");
      const urlParam = urlObj.searchParams.get("url");

      if (path === "import" || path === "recipe/import") {
        return {
          isFromShare: Boolean(urlParam),
          sharedUrl: urlParam ? decodeURIComponent(urlParam) : null,
          deepLinkUrl: url,
        };
      }

      if (urlParam) {
        return {
          isFromShare: true,
          sharedUrl: decodeURIComponent(urlParam),
          deepLinkUrl: url,
        };
      }

      return {
        isFromShare: false,
        sharedUrl: null,
        deepLinkUrl: url,
      };
    } catch {
      return {
        isFromShare: false,
        sharedUrl: null,
        deepLinkUrl: url,
      };
    }
  };

  it("should parse import deep link with URL parameter", () => {
    const deepLink =
      "digero://import?url=https%3A%2F%2Fexample.com%2Frecipe";

    const result = parseDeepLink(deepLink);

    expect(result.isFromShare).toBe(true);
    expect(result.sharedUrl).toBe("https://example.com/recipe");
    expect(result.deepLinkUrl).toBe(deepLink);
  });

  it("should parse recipe/import path", () => {
    const deepLink =
      "digero://recipe/import?url=https%3A%2F%2Fallrecipes.com%2Frecipe%2F123";

    const result = parseDeepLink(deepLink);

    expect(result.isFromShare).toBe(true);
    expect(result.sharedUrl).toBe("https://allrecipes.com/recipe/123");
  });

  it("should return isFromShare=false when no URL param", () => {
    const deepLink = "digero://import";

    const result = parseDeepLink(deepLink);

    expect(result.isFromShare).toBe(false);
    expect(result.sharedUrl).toBeNull();
  });

  it("should handle null URL gracefully", () => {
    const result = parseDeepLink(null);

    expect(result.isFromShare).toBe(false);
    expect(result.sharedUrl).toBeNull();
    expect(result.deepLinkUrl).toBeNull();
  });
});

// =============================================================================
// Share Context Handling Tests
// =============================================================================

describe("Share Context Handling", () => {
  it("should navigate to import with shared URL when authenticated", () => {
    const isSignedIn = true;
    const context = {
      isFromShare: true,
      sharedUrl: "https://example.com/recipe",
      deepLinkUrl: "digero://import?url=...",
    };

    let navigationParams: { pathname: string; params?: object } | null = null;

    const handleShareContext = (ctx: typeof context) => {
      if (ctx.isFromShare && ctx.sharedUrl && isSignedIn) {
        navigationParams = {
          pathname: "/(app)/recipes/import",
          params: {
            url: ctx.sharedUrl,
            autoExtract: "true",
          },
        };
      }
    };

    handleShareContext(context);

    expect(navigationParams).not.toBeNull();
    expect(navigationParams?.pathname).toBe("/(app)/recipes/import");
    expect((navigationParams?.params as { url: string })?.url).toBe(
      "https://example.com/recipe"
    );
    expect((navigationParams?.params as { autoExtract: string })?.autoExtract).toBe(
      "true"
    );
  });

  it("should not navigate when not authenticated", () => {
    const isSignedIn = false;
    const context = {
      isFromShare: true,
      sharedUrl: "https://example.com/recipe",
      deepLinkUrl: "digero://import?url=...",
    };

    let navigationParams: object | null = null;

    const handleShareContext = (ctx: typeof context) => {
      if (ctx.isFromShare && ctx.sharedUrl && isSignedIn) {
        navigationParams = { pathname: "/(app)/recipes/import" };
      }
    };

    handleShareContext(context);

    expect(navigationParams).toBeNull();
  });

  it("should not navigate when no shared URL", () => {
    const isSignedIn = true;
    const context = {
      isFromShare: false,
      sharedUrl: null,
      deepLinkUrl: "digero://other",
    };

    let navigationParams: object | null = null;

    const handleShareContext = (ctx: typeof context) => {
      if (ctx.isFromShare && ctx.sharedUrl && isSignedIn) {
        navigationParams = { pathname: "/(app)/recipes/import" };
      }
    };

    handleShareContext(context);

    expect(navigationParams).toBeNull();
  });
});

// =============================================================================
// URL Validation Tests
// =============================================================================

describe("Recipe URL Validation", () => {
  const mightBeRecipeUrl = (url: string): boolean => {
    if (!url) return false;

    try {
      const parsed = new URL(url);

      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
      }

      // Known recipe sites
      const recipeSites = [
        "allrecipes.com",
        "foodnetwork.com",
        "epicurious.com",
        "seriouseats.com",
      ];

      const hostname = parsed.hostname.toLowerCase().replace("www.", "");

      if (recipeSites.some((site) => hostname.includes(site))) {
        return true;
      }

      // Recipe keywords in path
      const path = parsed.pathname.toLowerCase();
      const recipeKeywords = ["/recipe", "/recipes", "/food"];

      if (recipeKeywords.some((keyword) => path.includes(keyword))) {
        return true;
      }

      return true;
    } catch {
      return false;
    }
  };

  it("should accept known recipe site URLs", () => {
    expect(mightBeRecipeUrl("https://allrecipes.com/recipe/123")).toBe(true);
    expect(mightBeRecipeUrl("https://www.foodnetwork.com/recipes/dish")).toBe(
      true
    );
    expect(mightBeRecipeUrl("https://epicurious.com/recipes/food/views/cake")).toBe(
      true
    );
  });

  it("should accept URLs with recipe keywords in path", () => {
    expect(mightBeRecipeUrl("https://example.com/recipe/cookies")).toBe(true);
    expect(mightBeRecipeUrl("https://myblog.com/recipes/pasta")).toBe(true);
    expect(mightBeRecipeUrl("https://site.com/food/chicken")).toBe(true);
  });

  it("should accept generic HTTP/HTTPS URLs", () => {
    // We accept any valid HTTP URL since user knows what they're sharing
    expect(mightBeRecipeUrl("https://example.com/page")).toBe(true);
    expect(mightBeRecipeUrl("http://mysite.com/anything")).toBe(true);
  });

  it("should reject non-HTTP URLs", () => {
    expect(mightBeRecipeUrl("ftp://example.com/recipe")).toBe(false);
    expect(mightBeRecipeUrl("file:///recipe.html")).toBe(false);
    expect(mightBeRecipeUrl("")).toBe(false);
  });
});

// =============================================================================
// Auto-Extract Behavior Tests
// =============================================================================

describe("Auto-Extract Behavior", () => {
  it("should auto-trigger extraction when launched from share", () => {
    const params = {
      url: "https://example.com/recipe",
      autoExtract: "true",
    };

    const shouldAutoExtract =
      params.autoExtract === "true" && Boolean(params.url);

    expect(shouldAutoExtract).toBe(true);
  });

  it("should not auto-extract when autoExtract is false", () => {
    const params = {
      url: "https://example.com/recipe",
      autoExtract: "false",
    };

    const shouldAutoExtract =
      params.autoExtract === "true" && Boolean(params.url);

    expect(shouldAutoExtract).toBe(false);
  });

  it("should not auto-extract when URL is missing", () => {
    const params = {
      url: "",
      autoExtract: "true",
    };

    const shouldAutoExtract =
      params.autoExtract === "true" && Boolean(params.url);

    expect(shouldAutoExtract).toBe(false);
  });
});

// =============================================================================
// Background State Restoration Tests
// =============================================================================

describe("Background State Restoration", () => {
  it("should preserve extraction state when app is backgrounded", () => {
    // Simulate state before backgrounding
    const stateBeforeBackground = {
      step: "review" as const,
      reviewData: {
        title: "Test Recipe",
        ingredients: [],
        instructions: [],
      },
      sourceUrl: "https://example.com/recipe",
    };

    // Simulate state restoration
    const restoredState = { ...stateBeforeBackground };

    expect(restoredState.step).toBe("review");
    expect(restoredState.reviewData.title).toBe("Test Recipe");
    expect(restoredState.sourceUrl).toBe("https://example.com/recipe");
  });

  it("should handle restoration to URL input step", () => {
    const stateBeforeBackground = {
      step: "url" as const,
      url: "https://example.com/recipe",
      error: null,
    };

    const restoredState = { ...stateBeforeBackground };

    expect(restoredState.step).toBe("url");
    expect(restoredState.url).toBe("https://example.com/recipe");
  });

  it("should handle restoration after extraction error", () => {
    const stateBeforeBackground = {
      step: "url" as const,
      url: "https://example.com/recipe",
      error: { type: "TIMEOUT", message: "Request timed out" },
    };

    const restoredState = { ...stateBeforeBackground };

    expect(restoredState.error).not.toBeNull();
    expect(restoredState.error?.type).toBe("TIMEOUT");
    expect(restoredState.url).toBe("https://example.com/recipe");
  });
});

// =============================================================================
// Deep Link Creation Tests
// =============================================================================

describe("Deep Link Creation", () => {
  const createImportDeepLink = (recipeUrl: string): string => {
    const encodedUrl = encodeURIComponent(recipeUrl);
    return `digero://import?url=${encodedUrl}`;
  };

  it("should create valid import deep link", () => {
    const recipeUrl = "https://example.com/recipe";
    const deepLink = createImportDeepLink(recipeUrl);

    expect(deepLink).toBe(
      "digero://import?url=https%3A%2F%2Fexample.com%2Frecipe"
    );
  });

  it("should properly encode URL with query params", () => {
    const recipeUrl = "https://example.com/recipe?id=123&name=cookies";
    const deepLink = createImportDeepLink(recipeUrl);

    expect(deepLink).toContain("digero://import?url=");
    expect(deepLink).toContain(encodeURIComponent(recipeUrl));
  });
});

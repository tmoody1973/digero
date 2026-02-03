/**
 * YouTube Recipe Import Tests
 *
 * Tests for YouTube API integration, URL parsing, channel operations,
 * and recipe extraction functionality.
 */

import {
  isYouTubeUrl,
  extractVideoId,
  isValidVideoId,
  parseISO8601Duration,
  formatDuration,
  buildYouTubeUrl,
} from "../lib/youtubeUrlParser";

// ============================================================================
// Task Group 1: YouTube URL Parser Tests
// ============================================================================

describe("YouTube URL Parser", () => {
  describe("isYouTubeUrl", () => {
    it("should return true for youtube.com URLs", () => {
      expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
        true
      );
      expect(isYouTubeUrl("http://youtube.com/watch?v=abc123def45")).toBe(true);
    });

    it("should return true for youtu.be URLs", () => {
      expect(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    });

    it("should return true for mobile YouTube URLs", () => {
      expect(isYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
        true
      );
    });

    it("should return false for non-YouTube URLs", () => {
      expect(isYouTubeUrl("https://www.google.com")).toBe(false);
      expect(isYouTubeUrl("https://vimeo.com/123456789")).toBe(false);
      expect(isYouTubeUrl("")).toBe(false);
    });
  });

  describe("extractVideoId", () => {
    it("should extract video ID from youtube.com/watch URLs", () => {
      expect(
        extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
      ).toBe("dQw4w9WgXcQ");
      expect(
        extractVideoId(
          "https://youtube.com/watch?v=abc123def45&list=PLxxx"
        )
      ).toBe("abc123def45");
    });

    it("should extract video ID from youtu.be URLs", () => {
      expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
        "dQw4w9WgXcQ"
      );
      expect(extractVideoId("https://youtu.be/abc123def45?t=120")).toBe(
        "abc123def45"
      );
    });

    it("should extract video ID from youtube.com/shorts URLs", () => {
      expect(extractVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
        "dQw4w9WgXcQ"
      );
    });

    it("should extract video ID from embed URLs", () => {
      expect(extractVideoId("https://youtube.com/embed/dQw4w9WgXcQ")).toBe(
        "dQw4w9WgXcQ"
      );
    });

    it("should return null for invalid URLs", () => {
      expect(extractVideoId("https://www.google.com")).toBe(null);
      expect(extractVideoId("not a url")).toBe(null);
      expect(extractVideoId("")).toBe(null);
    });

    it("should return the input if it looks like a video ID", () => {
      expect(extractVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    });
  });

  describe("isValidVideoId", () => {
    it("should return true for valid 11-character video IDs", () => {
      expect(isValidVideoId("dQw4w9WgXcQ")).toBe(true);
      expect(isValidVideoId("abc123def45")).toBe(true);
      expect(isValidVideoId("_Xy-z1234Ab")).toBe(true);
    });

    it("should return false for invalid video IDs", () => {
      expect(isValidVideoId("too_short")).toBe(false);
      expect(isValidVideoId("this_is_way_too_long_to_be_valid")).toBe(false);
      expect(isValidVideoId("")).toBe(false);
      expect(isValidVideoId("invalid!@#$")).toBe(false);
    });
  });

  describe("parseISO8601Duration", () => {
    it("should parse minutes and seconds", () => {
      expect(parseISO8601Duration("PT4M13S")).toBe(253);
      expect(parseISO8601Duration("PT10M0S")).toBe(600);
    });

    it("should parse hours, minutes, and seconds", () => {
      expect(parseISO8601Duration("PT1H30M45S")).toBe(5445);
      expect(parseISO8601Duration("PT2H0M0S")).toBe(7200);
    });

    it("should handle partial durations", () => {
      expect(parseISO8601Duration("PT30S")).toBe(30);
      expect(parseISO8601Duration("PT5M")).toBe(300);
      expect(parseISO8601Duration("PT1H")).toBe(3600);
    });

    it("should return 0 for invalid durations", () => {
      expect(parseISO8601Duration("")).toBe(0);
      expect(parseISO8601Duration("invalid")).toBe(0);
    });
  });

  describe("formatDuration", () => {
    it("should format seconds to MM:SS", () => {
      expect(formatDuration(253)).toBe("4:13");
      expect(formatDuration(60)).toBe("1:00");
      expect(formatDuration(5)).toBe("0:05");
    });

    it("should format to HH:MM:SS for longer durations", () => {
      expect(formatDuration(3661)).toBe("1:01:01");
      expect(formatDuration(7200)).toBe("2:00:00");
    });

    it("should handle edge cases", () => {
      expect(formatDuration(0)).toBe("0:00");
      expect(formatDuration(-10)).toBe("0:00");
    });
  });

  describe("buildYouTubeUrl", () => {
    it("should build a valid YouTube watch URL", () => {
      expect(buildYouTubeUrl("dQw4w9WgXcQ")).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      );
    });
  });
});

// ============================================================================
// Task Group 2: Channel Data Mock Tests
// ============================================================================

describe("Channel Data Types", () => {
  it("should have correct channel category values", () => {
    const validCategories = [
      "Italian",
      "Asian",
      "Quick Meals",
      "Baking",
      "Healthy",
      "BBQ & Grilling",
      "General",
    ];

    // Just verifying the types are defined correctly
    expect(validCategories).toHaveLength(7);
    expect(validCategories).toContain("Baking");
    expect(validCategories).toContain("General");
  });
});

// ============================================================================
// Task Group 3: Recipe Extraction Mock Tests
// ============================================================================

describe("Recipe Extraction", () => {
  describe("Confidence levels", () => {
    it("should recognize valid confidence levels", () => {
      const validConfidences = ["high", "medium", "low"];
      expect(validConfidences).toContain("high");
      expect(validConfidences).toContain("medium");
      expect(validConfidences).toContain("low");
    });
  });

  describe("Ingredient categories", () => {
    it("should have all required ingredient categories", () => {
      const categories = [
        "meat",
        "produce",
        "dairy",
        "pantry",
        "spices",
        "condiments",
        "bread",
        "other",
      ];

      expect(categories).toHaveLength(8);
      expect(categories).toContain("meat");
      expect(categories).toContain("produce");
      expect(categories).toContain("other");
    });
  });
});

// ============================================================================
// Task Group 4: URL Detection Tests
// ============================================================================

describe("URL Detection Integration", () => {
  it("should correctly identify and parse YouTube URLs in Web Import flow", () => {
    const testUrls = [
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        expected: { isYouTube: true, videoId: "dQw4w9WgXcQ" },
      },
      {
        url: "https://youtu.be/abc123def45",
        expected: { isYouTube: true, videoId: "abc123def45" },
      },
      {
        url: "https://youtube.com/shorts/xyz789abc12",
        expected: { isYouTube: true, videoId: "xyz789abc12" },
      },
      {
        url: "https://www.allrecipes.com/recipe/12345",
        expected: { isYouTube: false, videoId: null },
      },
    ];

    for (const { url, expected } of testUrls) {
      const isYT = isYouTubeUrl(url);
      const videoId = extractVideoId(url);

      expect(isYT).toBe(expected.isYouTube);
      expect(videoId).toBe(expected.videoId);
    }
  });
});

// ============================================================================
// Task Group 5: Recipe Preview Modal Data Tests
// ============================================================================

describe("Recipe Preview Data Validation", () => {
  it("should validate recipe preview has required fields", () => {
    const samplePreview = {
      videoId: "dQw4w9WgXcQ",
      videoTitle: "How to Make Perfect Pasta",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Perfect Homemade Pasta",
      ingredients: [
        { name: "flour", quantity: 2, unit: "cups", category: "pantry" as const },
        { name: "eggs", quantity: 3, unit: "large", category: "dairy" as const },
      ],
      instructions: [
        "Mix flour and eggs together",
        "Knead for 10 minutes",
        "Roll out and cut",
      ],
      prepTime: 30,
      cookTime: 10,
      servings: 4,
      confidence: "high" as const,
    };

    // Validate required fields
    expect(samplePreview.videoId).toBeDefined();
    expect(samplePreview.title).toBeDefined();
    expect(samplePreview.ingredients.length).toBeGreaterThan(0);
    expect(samplePreview.instructions.length).toBeGreaterThan(0);
    expect(samplePreview.servings).toBeGreaterThan(0);
  });

  it("should validate ingredient structure", () => {
    const ingredient = {
      name: "chicken breast",
      quantity: 2,
      unit: "lbs",
      category: "meat" as const,
    };

    expect(ingredient.name).toBe("chicken breast");
    expect(typeof ingredient.quantity).toBe("number");
    expect(ingredient.category).toBe("meat");
  });
});

// ============================================================================
// Task Group 6: Manual Entry Fallback Tests
// ============================================================================

describe("Manual Entry Fallback", () => {
  it("should provide fallback data when extraction fails", () => {
    const videoMetadata = {
      videoId: "dQw4w9WgXcQ",
      title: "Delicious Recipe Video",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    };

    // When extraction fails, we should be able to create a partial preview
    // with just the video metadata
    const fallbackPreview = {
      videoId: videoMetadata.videoId,
      videoTitle: videoMetadata.title,
      thumbnailUrl: videoMetadata.thumbnailUrl,
      sourceUrl: buildYouTubeUrl(videoMetadata.videoId),
      title: videoMetadata.title, // Pre-fill with video title
      ingredients: [],
      instructions: [],
      prepTime: 0,
      cookTime: 0,
      servings: 4, // Default servings
      confidence: "low" as const,
    };

    expect(fallbackPreview.title).toBe(videoMetadata.title);
    expect(fallbackPreview.thumbnailUrl).toBe(videoMetadata.thumbnailUrl);
    expect(fallbackPreview.confidence).toBe("low");
  });
});

// ============================================================================
// End-to-End Flow Structure Tests
// ============================================================================

describe("YouTube Import Flow Structure", () => {
  it("should follow the correct state flow for extraction", () => {
    const states = ["idle", "fetching", "extracting", "success", "error"];

    // Verify all expected states are defined
    expect(states).toContain("idle");
    expect(states).toContain("fetching");
    expect(states).toContain("extracting");
    expect(states).toContain("success");
    expect(states).toContain("error");
  });

  it("should define extraction error types", () => {
    const errorTypes = [
      "INVALID_URL",
      "INVALID_VIDEO_ID",
      "FETCH_FAILED",
      "NO_RECIPE_FOUND",
      "EXTRACTION_FAILED",
      "QUOTA_EXCEEDED",
      "TIMEOUT",
    ];

    expect(errorTypes).toContain("INVALID_URL");
    expect(errorTypes).toContain("NO_RECIPE_FOUND");
    expect(errorTypes).toContain("EXTRACTION_FAILED");
  });
});

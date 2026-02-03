/**
 * Seed Featured Channels
 *
 * Seeds the youtubeChannels table with curated featured cooking channels.
 * This mutation should be called once to populate initial featured channels.
 */

import { mutation } from "./_generated/server";

/**
 * Channel category type
 */
type ChannelCategory =
  | "Italian"
  | "Asian"
  | "Quick Meals"
  | "Baking"
  | "Healthy"
  | "BBQ & Grilling"
  | "General";

/**
 * Featured channel data from curated list
 */
interface FeaturedChannel {
  youtubeChannelId: string;
  name: string;
  handle: string;
  subscribers: string;
  videoCount: number;
  description: string;
  cuisineTypes: string[];
  category: ChannelCategory;
}

/**
 * Parse subscriber count string to number
 */
function parseSubscriberCount(count: string): number {
  const numMatch = count.match(/[\d.]+/);
  if (!numMatch) return 0;

  const num = parseFloat(numMatch[0]);
  if (count.includes("M")) {
    return Math.round(num * 1000000);
  }
  if (count.includes("K")) {
    return Math.round(num * 1000);
  }
  return Math.round(num);
}

/**
 * Map cuisine types to category
 */
function mapToCategory(cuisineTypes: string[]): ChannelCategory {
  const cuisines = cuisineTypes.map((c) => c.toLowerCase());

  if (
    cuisines.some((c) =>
      ["italian", "pasta", "pizza"].some((k) => c.includes(k))
    )
  ) {
    return "Italian";
  }
  if (
    cuisines.some((c) =>
      [
        "asian",
        "korean",
        "japanese",
        "chinese",
        "thai",
        "indonesian",
        "vietnamese",
      ].some((k) => c.includes(k))
    )
  ) {
    return "Asian";
  }
  if (
    cuisines.some((c) =>
      ["quick", "fast", "easy", "short"].some((k) => c.includes(k))
    )
  ) {
    return "Quick Meals";
  }
  if (
    cuisines.some((c) =>
      ["baking", "pastry", "dessert", "chocolate", "cake"].some((k) =>
        c.includes(k)
      )
    )
  ) {
    return "Baking";
  }
  if (
    cuisines.some((c) =>
      ["healthy", "vegetarian", "vegan", "salad"].some((k) => c.includes(k))
    )
  ) {
    return "Healthy";
  }
  if (
    cuisines.some((c) => ["bbq", "grilling", "grill"].some((k) => c.includes(k)))
  ) {
    return "BBQ & Grilling";
  }

  return "General";
}

/**
 * Curated list of featured cooking channels
 */
// Real YouTube channel IDs (24 character format starting with UC)
const FEATURED_CHANNELS: FeaturedChannel[] = [
  {
    youtubeChannelId: "UCsaGKqPZnGp_7N80hcHySGQ", // Joshua Weissman
    name: "Joshua Weissman",
    handle: "@JoshuaWeissman",
    subscribers: "10.2M",
    videoCount: 500,
    description:
      "Popular food YouTuber known for 'But Better' and 'But Cheaper' series, making restaurant-quality food at home.",
    cuisineTypes: ["American", "International", "Fast Food Remakes"],
    category: "General",
  },
  {
    youtubeChannelId: "UCJHA_jMfCvEnv-3kRjTCQXw", // Binging with Babish
    name: "Babish Culinary Universe",
    handle: "@babishculinaryuniverse",
    subscribers: "10M",
    videoCount: 600,
    description:
      "Andrew Rea's channel featuring 'Binging with Babish' series recreating dishes from movies, TV shows, and video games.",
    cuisineTypes: ["American", "International", "Pop Culture Recipes"],
    category: "General",
  },
  {
    youtubeChannelId: "UCRIZtPl9nb9RiXc9btSTQNw", // Gordon Ramsay
    name: "Gordon Ramsay",
    handle: "@GordonRamsay",
    subscribers: "21.5M",
    videoCount: 800,
    description:
      "World-renowned celebrity chef sharing professional cooking techniques, recipes, and entertaining content.",
    cuisineTypes: ["British", "French", "International", "Fine Dining"],
    category: "General",
  },
  {
    youtubeChannelId: "UCJFp8uSYCjXOMnkUyb3CQ3Q", // Tasty
    name: "Tasty",
    handle: "@Tasty",
    subscribers: "21.4M",
    videoCount: 2000,
    description:
      "BuzzFeed's popular food brand known for overhead cooking videos, viral recipes, and easy-to-follow tutorials.",
    cuisineTypes: ["American", "International", "Comfort Food", "Desserts"],
    category: "Quick Meals",
  },
  {
    youtubeChannelId: "UCFjd060Z3nTHv0UyO8M43mQ", // Nick DiGiovanni
    name: "Nick DiGiovanni",
    handle: "@NickDiGiovanni",
    subscribers: "27.3M",
    videoCount: 400,
    description:
      "Former MasterChef finalist known for making complex recipes approachable, food challenges, and collaborations.",
    cuisineTypes: ["American", "International", "Gourmet"],
    category: "General",
  },
  {
    youtubeChannelId: "UC3SKbLslzPwpZ7w-gk4RYeg", // Maangchi
    name: "Maangchi",
    handle: "@Maangchi",
    subscribers: "6.5M",
    videoCount: 400,
    description:
      "The 'YouTube's Korean Julia Child' known for authentic Korean recipes with detailed instructions.",
    cuisineTypes: ["Korean", "Traditional Korean"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCqqJQ_cXSat0KIAVfIfKkVA", // Adam Ragusea
    name: "Adam Ragusea",
    handle: "@AdamRagusea",
    subscribers: "2.3M",
    videoCount: 350,
    description:
      "Food science and practical home cooking channel focusing on why recipes work and how to adapt them.",
    cuisineTypes: ["American", "International", "Science-Based"],
    category: "General",
  },
  {
    youtubeChannelId: "UCsz_93v-fkWLD3rJ2_ba0qA", // Marion's Kitchen
    name: "Marion's Kitchen",
    handle: "@MarionsKitchen",
    subscribers: "4.8M",
    videoCount: 600,
    description:
      "Australian-Thai food blogger sharing authentic Asian recipes with easy-to-follow instructions.",
    cuisineTypes: ["Thai", "Asian", "Southeast Asian"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCddiUEpeqJcYeBxX1IVBKvQ", // Bon Appetit
    name: "Bon Appetit",
    handle: "@BonAppetit",
    subscribers: "6.2M",
    videoCount: 1200,
    description:
      "Bon Appetit magazine's YouTube channel featuring test kitchen recipes and cooking techniques.",
    cuisineTypes: ["American", "International", "Gourmet"],
    category: "General",
  },
  {
    youtubeChannelId: "UCxr2d4As312LulcajAkKJYw", // America's Test Kitchen
    name: "America's Test Kitchen",
    handle: "@AmericasTestKitchen",
    subscribers: "2.1M",
    videoCount: 800,
    description:
      "Science-based cooking channel with rigorously tested recipes and equipment reviews.",
    cuisineTypes: ["American", "International", "Science-Based"],
    category: "General",
  },
  {
    youtubeChannelId: "UCtuUmLzJMk7ixNfvnJ2vYow", // Chinese Cooking Demystified
    name: "Chinese Cooking Demystified",
    handle: "@ChineseCookingDemystified",
    subscribers: "1.5M",
    videoCount: 200,
    description:
      "In-depth exploration of authentic Chinese cooking techniques and regional cuisines.",
    cuisineTypes: ["Chinese", "Regional Chinese", "Traditional"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCjKt04dmt0-HX1uX-p69MBg", // Brian Lagerstrom
    name: "Brian Lagerstrom",
    handle: "@BrianLagerstrom",
    subscribers: "1.8M",
    videoCount: 300,
    description:
      "Former professional chef sharing restaurant-quality recipes adapted for home cooking.",
    cuisineTypes: ["American", "International", "Restaurant-Style"],
    category: "General",
  },
];

/**
 * Seed featured channels mutation
 *
 * Populates the youtubeChannels table with curated featured cooking channels.
 * This is idempotent - it will skip channels that already exist.
 */
export const seedFeaturedChannels = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let seededCount = 0;
    let skippedCount = 0;

    for (const channel of FEATURED_CHANNELS) {
      // Check if channel already exists
      const existing = await ctx.db
        .query("youtubeChannels")
        .withIndex("by_youtube_channel_id", (q) =>
          q.eq("youtubeChannelId", channel.youtubeChannelId)
        )
        .first();

      if (existing) {
        // Update to ensure it's marked as featured
        if (!existing.isFeatured) {
          await ctx.db.patch(existing._id, {
            isFeatured: true,
            updatedAt: now,
          });
        }
        skippedCount++;
        continue;
      }

      // Create new channel
      await ctx.db.insert("youtubeChannels", {
        youtubeChannelId: channel.youtubeChannelId,
        name: channel.name,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=f97316&color=fff&size=200`,
        subscriberCount: parseSubscriberCount(channel.subscribers),
        description: channel.description,
        videoCount: channel.videoCount,
        category: channel.category,
        isFeatured: true,
        lastFetchedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      seededCount++;
    }

    return {
      seeded: seededCount,
      skipped: skippedCount,
      total: FEATURED_CHANNELS.length,
    };
  },
});

/**
 * Clear all featured channels mutation
 *
 * Removes the featured flag from all channels.
 * Useful for resetting the featured channels list.
 */
export const clearFeaturedChannels = mutation({
  args: {},
  handler: async (ctx) => {
    const featuredChannels = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();

    for (const channel of featuredChannels) {
      await ctx.db.patch(channel._id, {
        isFeatured: false,
        updatedAt: Date.now(),
      });
    }

    return {
      cleared: featuredChannels.length,
    };
  },
});

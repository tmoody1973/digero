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
const FEATURED_CHANNELS: FeaturedChannel[] = [
  {
    youtubeChannelId: "UCeitan",
    name: "Eitan Bernath",
    handle: "@eitan",
    subscribers: "362K",
    videoCount: 907,
    description:
      "Chef, Author, Entertainer, Entrepreneur, Activist. Eitan is a young culinary star known for his energetic cooking style and approachable recipes.",
    cuisineTypes: ["American", "International", "Comfort Food"],
    category: "General",
  },
  {
    youtubeChannelId: "UCThatLittlePuff",
    name: "That Little Puff",
    handle: "@ThatLittlePuff",
    subscribers: "36.7M",
    videoCount: 500,
    description:
      "A viral cooking channel featuring a cat chef creating fun and creative recipes. Known for its unique presentation style.",
    cuisineTypes: ["Asian", "Fusion", "Creative"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCDONA",
    name: "DONA",
    handle: "@DONA",
    subscribers: "33.6M",
    videoCount: 400,
    description:
      "Korean cooking channel known for visually stunning food videos and ASMR-style content featuring Korean and Asian cuisine.",
    cuisineTypes: ["Korean", "Asian", "Desserts"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCBayashiTV",
    name: "Bayashi TV",
    handle: "@BayashiTV",
    subscribers: "32.9M",
    videoCount: 600,
    description:
      "Japanese cooking channel featuring quick, satisfying cooking videos with impressive knife skills and creative presentations.",
    cuisineTypes: ["Japanese", "Asian", "Street Food"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCVillageCookingChannel",
    name: "Village Cooking Channel",
    handle: "@VillageCookingChannel",
    subscribers: "28.8M",
    videoCount: 300,
    description:
      "Indian cooking channel showcasing traditional village-style cooking with large-scale recipes prepared outdoors using traditional methods.",
    cuisineTypes: ["Indian", "Traditional", "Village Style"],
    category: "General",
  },
  {
    youtubeChannelId: "UCAjaKitchen",
    name: "Aja Kitchen",
    handle: "@AjaKitchen",
    subscribers: "28.7M",
    videoCount: 350,
    description:
      "Popular cooking channel known for authentic Asian recipes with a home-style touch and easy-to-follow tutorials.",
    cuisineTypes: ["Asian", "Indonesian", "Home Cooking"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCLiziqi",
    name: "Liziqi",
    handle: "@Liziqi",
    subscribers: "27.3M",
    videoCount: 150,
    description:
      "Chinese content creator known for cinematic videos showcasing traditional Chinese cooking, farming, and craftsmanship.",
    cuisineTypes: ["Chinese", "Traditional", "Farm-to-Table"],
    category: "Asian",
  },
  {
    youtubeChannelId: "UCNickDiGiovanni",
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
    youtubeChannelId: "UCalbertcancook",
    name: "albert_cancook",
    handle: "@albertcancook",
    subscribers: "26.7M",
    videoCount: 450,
    description:
      "Fast-paced, visually satisfying cooking videos that go viral for their entertainment and educational value.",
    cuisineTypes: ["International", "Quick Recipes", "Comfort Food"],
    category: "Quick Meals",
  },
  {
    youtubeChannelId: "UCGordonRamsay",
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
    youtubeChannelId: "UCTasty",
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
    youtubeChannelId: "UCAmauryGuichon",
    name: "Amaury Guichon",
    handle: "@AmauryGuichon",
    subscribers: "21.4M",
    videoCount: 200,
    description:
      "World-famous pastry chef known for incredible chocolate sculptures and artistic dessert creations.",
    cuisineTypes: ["Pastry", "Chocolate", "Desserts", "French"],
    category: "Baking",
  },
  {
    youtubeChannelId: "UCJoshuaWeissman",
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
    youtubeChannelId: "UCBabish",
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
    youtubeChannelId: "UCMaangchi",
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
    youtubeChannelId: "UCFoodNetwork",
    name: "Food Network",
    handle: "@FoodNetwork",
    subscribers: "12.8M",
    videoCount: 1500,
    description:
      "Official YouTube channel of Food Network featuring clips from popular shows and recipes from celebrity chefs.",
    cuisineTypes: ["American", "International", "Various"],
    category: "General",
  },
  {
    youtubeChannelId: "UCMarionsKitchen",
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
    youtubeChannelId: "UCAdamRagusea",
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
    youtubeChannelId: "UCChineseCookingDemystified",
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
    youtubeChannelId: "UCNishaMadhulika",
    name: "Nisha Madhulika",
    handle: "@NishaMadhulika",
    subscribers: "14.9M",
    videoCount: 1800,
    description:
      "Popular Indian cooking channel featuring vegetarian recipes and traditional Indian dishes.",
    cuisineTypes: ["Indian", "Vegetarian", "Traditional Indian"],
    category: "Healthy",
  },
  {
    youtubeChannelId: "UCBrianLagerstrom",
    name: "Brian Lagerstrom",
    handle: "@BrianLagerstrom",
    subscribers: "1.8M",
    videoCount: 300,
    description:
      "Former professional chef sharing restaurant-quality recipes adapted for home cooking.",
    cuisineTypes: ["American", "International", "Restaurant-Style"],
    category: "General",
  },
  {
    youtubeChannelId: "UCBonAppetit",
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
    youtubeChannelId: "UCAmericasTestKitchen",
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
    youtubeChannelId: "UCKabitasKitchen",
    name: "Kabita's Kitchen",
    handle: "@KabitasKitchen",
    subscribers: "14.4M",
    videoCount: 1600,
    description:
      "Popular Indian cooking channel featuring easy-to-make Indian recipes for everyday cooking.",
    cuisineTypes: ["Indian", "North Indian", "Home Cooking"],
    category: "General",
  },
  {
    youtubeChannelId: "UCPailinsKitchen",
    name: "Pailin's Kitchen",
    handle: "@PailinsKitchen",
    subscribers: "1.2M",
    videoCount: 250,
    description:
      "Authentic Thai cooking channel run by a Thai-Canadian chef sharing traditional recipes.",
    cuisineTypes: ["Thai", "Southeast Asian", "Traditional"],
    category: "Asian",
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

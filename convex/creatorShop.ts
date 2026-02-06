/**
 * Creator Shop Functions
 *
 * Convex queries and mutations for creator product shop,
 * orders, and member discounts.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// =============================================================================
// Product Queries
// =============================================================================

/**
 * Get active products for a creator's shop (user-facing)
 */
export const getProducts = query({
  args: {
    creatorId: v.id("creatorProfiles"),
    type: v.optional(
      v.union(
        v.literal("cookbook"),
        v.literal("course"),
        v.literal("merchandise"),
        v.literal("subscription"),
        v.literal("equipment")
      )
    ),
  },
  handler: async (ctx, args) => {
    let productsQuery = ctx.db
      .query("creatorProducts")
      .withIndex("by_creator_active", (q) =>
        q.eq("creatorId", args.creatorId).eq("isActive", true)
      );

    const products = await productsQuery.collect();

    // Filter by type if specified
    if (args.type) {
      return products.filter((p) => p.type === args.type);
    }

    // Sort featured first, then by sales
    return products.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      return b.totalSales - a.totalSales;
    });
  },
});

/**
 * Get all products for a creator (including inactive - for management)
 */
export const getAllProducts = query({
  args: {
    creatorId: v.id("creatorProfiles"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("creatorProducts")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    // Sort: active first, then featured, then by sales
    return products.sort((a, b) => {
      // Active products first
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      // Featured first within active
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      // Then by sales
      return b.totalSales - a.totalSales;
    });
  },
});

/**
 * Get a single product by ID
 */
export const getProduct = query({
  args: { productId: v.id("creatorProducts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

/**
 * Get creator info for product page
 */
export const getCreator = query({
  args: { creatorId: v.id("creatorProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.creatorId);
  },
});

/**
 * Get featured products across all creators
 */
export const getFeaturedProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const products = await ctx.db
      .query("creatorProducts")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true).eq("isActive", true))
      .take(limit);

    // Enrich with creator info
    return Promise.all(
      products.map(async (product) => {
        const creator = await ctx.db.get(product.creatorId);
        return {
          ...product,
          creatorName: creator?.channelName || "Unknown",
          creatorAvatar: creator?.channelAvatarUrl || "",
        };
      })
    );
  },
});

// =============================================================================
// Product Management (for creators)
// =============================================================================

/**
 * Create a new product
 */
export const createProduct = mutation({
  args: {
    creatorId: v.id("creatorProfiles"),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("cookbook"),
      v.literal("course"),
      v.literal("merchandise"),
      v.literal("subscription"),
      v.literal("equipment")
    ),
    imageUrl: v.string(),
    additionalImages: v.optional(v.array(v.string())),
    price: v.number(),
    memberDiscount: v.number(),
    digitalAssetUrl: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    requiresShipping: v.boolean(),
    shippingCost: v.optional(v.number()),
    inventory: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const productId = await ctx.db.insert("creatorProducts", {
      creatorId: args.creatorId,
      name: args.name,
      description: args.description,
      type: args.type,
      imageUrl: args.imageUrl,
      additionalImages: args.additionalImages || [],
      price: args.price,
      currency: "USD",
      memberDiscount: args.memberDiscount,
      digitalAssetUrl: args.digitalAssetUrl,
      externalUrl: args.externalUrl,
      requiresShipping: args.requiresShipping,
      shippingCost: args.shippingCost,
      inventory: args.inventory,
      trackInventory: args.trackInventory || false,
      isActive: true,
      isFeatured: false,
      totalSales: 0,
      totalRevenue: 0,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

/**
 * Update a product
 */
export const updateProduct = mutation({
  args: {
    productId: v.id("creatorProducts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    memberDiscount: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    inventory: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;

    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// =============================================================================
// Purchase Flow
// =============================================================================

/**
 * Purchase a product
 */
export const purchaseProduct = mutation({
  args: {
    productId: v.id("creatorProducts"),
    applyMemberDiscount: v.boolean(),
    quantity: v.optional(v.number()),
    shippingAddress: v.optional(
      v.object({
        name: v.string(),
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        postalCode: v.string(),
        country: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("Product is not available");
    }

    const quantity = args.quantity || 1;

    // Check inventory
    if (product.trackInventory && product.inventory !== undefined) {
      if (product.inventory < quantity) {
        throw new Error("Not enough inventory");
      }
    }

    // Calculate pricing
    const unitPrice = product.price;
    const discountAmount = args.applyMemberDiscount
      ? Math.floor(unitPrice * (product.memberDiscount / 100))
      : 0;
    const discountedPrice = unitPrice - discountAmount;
    const subtotal = discountedPrice * quantity;
    const shippingCost = product.requiresShipping ? (product.shippingCost || 0) : 0;
    const total = subtotal + shippingCost;

    // Calculate commission (50/50 split)
    const creatorCommission = Math.floor(subtotal * 0.5);
    const platformFee = subtotal - creatorCommission;

    const now = Date.now();

    // Create order
    const orderId = await ctx.db.insert("creatorOrders", {
      buyerId: identity.subject,
      creatorId: product.creatorId,
      productId: args.productId,
      quantity,
      unitPrice,
      discountApplied: discountAmount * quantity,
      subtotal,
      shippingCost,
      total,
      status: "pending",
      shippingAddress: args.shippingAddress,
      creatorCommission,
      platformFee,
      createdAt: now,
    });

    // If digital product, generate download URL immediately
    if (!product.requiresShipping && product.digitalAssetUrl) {
      const downloadExpiry = now + 7 * 24 * 60 * 60 * 1000; // 7 days

      await ctx.db.patch(orderId, {
        downloadUrl: product.digitalAssetUrl,
        downloadExpiresAt: downloadExpiry,
      });
    }

    // Return order ID for payment processing
    return {
      success: true,
      orderId,
      total,
      requiresPayment: true,
    };
  },
});

/**
 * Mark order as paid (called after successful payment)
 */
export const markOrderPaid = mutation({
  args: {
    orderId: v.id("creatorOrders"),
    paymentIntentId: v.optional(v.string()),
    revenuecatTransactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const now = Date.now();

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "paid",
      stripePaymentIntentId: args.paymentIntentId,
      revenuecatTransactionId: args.revenuecatTransactionId,
      paidAt: now,
    });

    // Update product stats
    const product = await ctx.db.get(order.productId);
    if (product) {
      await ctx.db.patch(order.productId, {
        totalSales: product.totalSales + order.quantity,
        totalRevenue: product.totalRevenue + order.subtotal,
        updatedAt: now,
      });

      // Update inventory if tracking
      if (product.trackInventory && product.inventory !== undefined) {
        await ctx.db.patch(order.productId, {
          inventory: product.inventory - order.quantity,
        });
      }
    }

    // If digital product, mark as fulfilled immediately
    if (!product?.requiresShipping) {
      await ctx.db.patch(args.orderId, {
        status: "fulfilled",
        fulfilledAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Get user's orders
 */
export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const orders = await ctx.db
      .query("creatorOrders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", identity.subject))
      .order("desc")
      .collect();

    // Enrich with product and creator info
    return Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        const creator = await ctx.db.get(order.creatorId);

        return {
          ...order,
          productName: product?.name || "Unknown",
          productImage: product?.imageUrl || "",
          creatorName: creator?.channelName || "Unknown",
        };
      })
    );
  },
});

/**
 * Get creator's orders (for fulfillment)
 */
export const getCreatorOrders = query({
  args: {
    creatorId: v.id("creatorProfiles"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("fulfilled"),
        v.literal("refunded"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("creatorOrders")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId));

    const orders = await query.order("desc").collect();

    // Filter by status if specified
    const filtered = args.status
      ? orders.filter((o) => o.status === args.status)
      : orders;

    // Enrich with product info
    return Promise.all(
      filtered.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        return {
          ...order,
          productName: product?.name || "Unknown",
          productImage: product?.imageUrl || "",
        };
      })
    );
  },
});

/**
 * Mark order as fulfilled (for physical products)
 */
export const fulfillOrder = mutation({
  args: {
    orderId: v.id("creatorOrders"),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "paid") {
      throw new Error("Order is not in paid status");
    }

    await ctx.db.patch(args.orderId, {
      status: "fulfilled",
      fulfilledAt: Date.now(),
    });

    return { success: true };
  },
});

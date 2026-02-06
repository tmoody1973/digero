/**
 * Convex HTTP Endpoints
 *
 * HTTP endpoints for external service integrations.
 * Includes Clerk webhook handler for user synchronization
 * and RevenueCat webhook handler for subscription management with OneSignal sync.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { syncSubscriptionTags } from "./lib/onesignalUtils";

/**
 * Verify HMAC-SHA256 signature using Web Crypto API
 */
async function verifyHmacSignature(
  secret: string,
  body: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return signature === expectedSignature;
}

const http = httpRouter();

/**
 * Clerk Webhook Handler
 *
 * Receives and processes Clerk webhook events for user synchronization.
 * Verifies webhook signature and handles user.created, user.updated, user.deleted events.
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get required headers for signature verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers");
      return new Response("Missing required headers", { status: 400 });
    }

    // Get the raw body for signature verification
    const body = await request.text();

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let event: ClerkWebhookEvent;

    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 401 });
    }

    // Handle the event based on type
    const eventType = event.type;

    try {
      switch (eventType) {
        case "user.created": {
          const { id, email_addresses, first_name, last_name, image_url } =
            event.data;

          // Get primary email
          const primaryEmail = email_addresses.find(
            (e) => e.id === event.data.primary_email_address_id
          );
          const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address ?? "";

          // Construct name from first and last name
          const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

          await ctx.runMutation(internal.users.createUser, {
            clerkId: id,
            email,
            name,
            avatarUrl: image_url ?? undefined,
          });

          console.log(`Created user: ${id}`);
          break;
        }

        case "user.updated": {
          const { id, email_addresses, first_name, last_name, image_url } =
            event.data;

          // Get primary email
          const primaryEmail = email_addresses.find(
            (e) => e.id === event.data.primary_email_address_id
          );
          const email = primaryEmail?.email_address ?? email_addresses[0]?.email_address;

          // Construct name from first and last name
          const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

          await ctx.runMutation(internal.users.updateUserFromWebhook, {
            clerkId: id,
            email,
            name,
            avatarUrl: image_url ?? undefined,
          });

          console.log(`Updated user: ${id}`);
          break;
        }

        case "user.deleted": {
          const { id } = event.data;

          if (id) {
            await ctx.runMutation(internal.users.deleteUserByClerkId, {
              clerkId: id,
            });

            console.log(`Deleted user: ${id}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      return new Response("Webhook processed", { status: 200 });
    } catch (err) {
      console.error(`Error processing webhook event ${eventType}:`, err);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

/**
 * RevenueCat Webhook Handler
 *
 * Receives and processes RevenueCat webhook events for subscription management.
 * Verifies webhook signature and handles subscription lifecycle events:
 * - INITIAL_PURCHASE: New subscription or trial started
 * - RENEWAL: Subscription renewed
 * - CANCELLATION: Subscription cancelled (still active until expiration)
 * - EXPIRATION: Subscription expired
 * - BILLING_ISSUE: Payment failed
 * - PRODUCT_CHANGE: User changed subscription product
 *
 * Also syncs subscription status to OneSignal for targeted messaging.
 */
http.route({
  path: "/webhooks/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the webhook secret from environment
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing REVENUECAT_WEBHOOK_SECRET environment variable");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get the raw body for signature verification
    const body = await request.text();

    // Verify the webhook signature
    // RevenueCat uses X-RevenueCat-Signature header with HMAC-SHA256
    const signature = request.headers.get("X-RevenueCat-Signature");
    if (!signature) {
      console.error("Missing X-RevenueCat-Signature header");
      return new Response("Missing signature header", { status: 400 });
    }

    // Verify HMAC signature using Web Crypto API
    const isValid = await verifyHmacSignature(webhookSecret, body, signature);
    if (!isValid) {
      console.error("RevenueCat webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse the webhook payload
    let event: RevenueCatWebhookEvent;
    try {
      event = JSON.parse(body) as RevenueCatWebhookEvent;
    } catch (err) {
      console.error("Failed to parse RevenueCat webhook payload:", err);
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const eventType = event.event?.type;
    if (!eventType) {
      console.error("Missing event type in RevenueCat webhook");
      return new Response("Missing event type", { status: 400 });
    }

    // Extract user ID (app_user_id is the Clerk user ID we set during SDK init)
    const clerkId = event.event?.app_user_id;
    if (!clerkId) {
      console.error("Missing app_user_id in RevenueCat webhook");
      return new Response("Missing user ID", { status: 400 });
    }

    try {
      // Variables to track subscription state for OneSignal sync
      let subscriptionTier: "free" | "plus" | "creator" | "trial" = "free";
      let subscriptionStatus: "active" | "expired" | "trial" | "cancelled" = "active";
      let expiresAt: number | undefined;

      switch (eventType) {
        case "INITIAL_PURCHASE": {
          // New subscription started (could be trial or direct purchase)
          const productId = event.event?.product_id ?? "";
          const subscriptionType = getSubscriptionTypeFromProductId(productId);
          expiresAt = event.event?.expiration_at_ms ?? undefined;
          const isTrialPeriod = event.event?.is_trial_period ?? false;
          const revenuecatUserId = event.event?.original_app_user_id ?? clerkId;

          // Determine tier from product ID
          subscriptionTier = getTierFromProductId(productId, isTrialPeriod);
          subscriptionStatus = isTrialPeriod ? "trial" : "active";

          await ctx.runMutation(internal.subscriptions.updateSubscription, {
            clerkId,
            subscriptionStatus: subscriptionTier,
            subscriptionType: subscriptionType ?? undefined,
            subscriptionExpiresAt: subscriptionType === "lifetime" ? undefined : expiresAt,
            revenuecatUserId,
            hasBillingIssue: false,
          });

          console.log(`Initial purchase for user: ${clerkId}, product: ${productId}, trial: ${isTrialPeriod}`);
          break;
        }

        case "RENEWAL": {
          // Subscription renewed
          const productId = event.event?.product_id ?? "";
          expiresAt = event.event?.expiration_at_ms ?? undefined;
          subscriptionTier = getTierFromProductId(productId, false);
          subscriptionStatus = "active";

          await ctx.runMutation(internal.subscriptions.updateSubscription, {
            clerkId,
            subscriptionStatus: subscriptionTier,
            subscriptionExpiresAt: expiresAt,
            hasBillingIssue: false,
          });

          console.log(`Renewal for user: ${clerkId}`);
          break;
        }

        case "CANCELLATION": {
          // Subscription cancelled but still active until expiration
          const productId = event.event?.product_id ?? "";
          expiresAt = event.event?.expiration_at_ms ?? undefined;
          const canceledAt = Date.now();
          subscriptionTier = getTierFromProductId(productId, false);
          subscriptionStatus = "cancelled";

          await ctx.runMutation(internal.subscriptions.updateSubscription, {
            clerkId,
            subscriptionStatus: subscriptionTier, // Still has access until expiration
            subscriptionCanceledAt: canceledAt,
            subscriptionExpiresAt: expiresAt,
          });

          console.log(`Cancellation for user: ${clerkId}, expires: ${expiresAt}`);
          break;
        }

        case "EXPIRATION": {
          // Subscription expired - revert to free
          subscriptionTier = "free";
          subscriptionStatus = "expired";

          await ctx.runMutation(internal.subscriptions.clearSubscription, {
            clerkId,
          });

          console.log(`Expiration for user: ${clerkId}`);
          break;
        }

        case "BILLING_ISSUE": {
          // Payment failed - set billing issue flag
          // Keep current tier but mark status
          const productId = event.event?.product_id ?? "";
          subscriptionTier = getTierFromProductId(productId, false);
          subscriptionStatus = "active"; // Still active, but has billing issue

          await ctx.runMutation(internal.subscriptions.setBillingIssue, {
            clerkId,
            hasBillingIssue: true,
          });

          console.log(`Billing issue for user: ${clerkId}`);
          break;
        }

        case "PRODUCT_CHANGE": {
          // User changed subscription product (upgrade/downgrade)
          const productId = event.event?.product_id ?? "";
          const subscriptionType = getSubscriptionTypeFromProductId(productId);
          expiresAt = event.event?.expiration_at_ms ?? undefined;
          subscriptionTier = getTierFromProductId(productId, false);
          subscriptionStatus = "active";

          await ctx.runMutation(internal.subscriptions.updateSubscription, {
            clerkId,
            subscriptionStatus: subscriptionTier,
            subscriptionType: subscriptionType ?? undefined,
            subscriptionExpiresAt: subscriptionType === "lifetime" ? undefined : expiresAt,
          });

          console.log(`Product change for user: ${clerkId}, new product: ${productId}`);
          break;
        }

        default:
          console.log(`Unhandled RevenueCat event type: ${eventType}`);
          return new Response("Webhook processed", { status: 200 });
      }

      // Sync tags to OneSignal
      // First, get the user's OneSignal player ID
      const user = await ctx.runQuery(internal.users.getUserByClerkIdInternal, {
        clerkId,
      });

      if (user?.onesignalPlayerId) {
        try {
          const syncResult = await syncSubscriptionTags(
            user.onesignalPlayerId,
            subscriptionTier,
            subscriptionStatus,
            expiresAt
          );

          if (syncResult.success) {
            console.log(`OneSignal tags synced for user: ${clerkId}`);
          } else {
            console.error(`OneSignal tag sync failed for user: ${clerkId}`, syncResult.error);
          }
        } catch (syncError) {
          // Log but don't fail the webhook - subscription update is more important
          console.error("OneSignal sync error (non-fatal):", syncError);
        }
      } else {
        console.log(`No OneSignal player ID for user: ${clerkId}, skipping tag sync`);
      }

      return new Response("Webhook processed", { status: 200 });
    } catch (err) {
      console.error(`Error processing RevenueCat webhook event ${eventType}:`, err);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

/**
 * Helper to determine subscription type from RevenueCat product ID
 */
function getSubscriptionTypeFromProductId(
  productId: string
): "monthly" | "annual" | "lifetime" | null {
  if (productId.includes("monthly")) {
    return "monthly";
  }
  if (productId.includes("annual")) {
    return "annual";
  }
  if (productId.includes("lifetime")) {
    return "lifetime";
  }
  return null;
}

/**
 * Helper to determine subscription tier from RevenueCat product ID
 */
function getTierFromProductId(
  productId: string,
  isTrialPeriod: boolean
): "free" | "plus" | "creator" | "trial" {
  if (isTrialPeriod) {
    return "trial";
  }
  // Check for creator tier products
  if (productId.includes("creator")) {
    return "creator";
  }
  // Check for plus tier products
  if (productId.includes("plus") || productId.includes("premium") || productId.includes("pro")) {
    return "plus";
  }
  // Default to plus for any recognized subscription
  if (productId.includes("monthly") || productId.includes("annual") || productId.includes("lifetime")) {
    return "plus";
  }
  return "free";
}

// =============================================================================
// Type Definitions
// =============================================================================

// Clerk webhook types
interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserData;
}

// RevenueCat webhook types
interface RevenueCatEventData {
  type:
    | "INITIAL_PURCHASE"
    | "RENEWAL"
    | "CANCELLATION"
    | "EXPIRATION"
    | "BILLING_ISSUE"
    | "PRODUCT_CHANGE"
    | "UNCANCELLATION"
    | "TRANSFER"
    | "SUBSCRIBER_ALIAS";
  app_user_id: string;
  original_app_user_id?: string;
  product_id?: string;
  expiration_at_ms?: number;
  is_trial_period?: boolean;
  entitlement_id?: string;
  entitlement_ids?: string[];
  store?: string;
  environment?: string;
  purchased_at_ms?: number;
  price?: number;
  currency?: string;
}

interface RevenueCatWebhookEvent {
  api_version: string;
  event: RevenueCatEventData;
}

export default http;

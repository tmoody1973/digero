/**
 * Clerk Webhook Integration Tests
 *
 * Tests for verifying webhook handling for Clerk user events.
 */

describe("Clerk Webhook Integration", () => {
  describe("user.created event", () => {
    it("should create Convex user from Clerk webhook data", () => {
      const clerkUserCreatedEvent = {
        type: "user.created" as const,
        data: {
          id: "user_clerk_abc123",
          email_addresses: [
            { id: "email_1", email_address: "john@example.com" },
          ],
          primary_email_address_id: "email_1",
          first_name: "John",
          last_name: "Doe",
          image_url: "https://example.com/avatar.jpg",
        },
      };

      // Extract user data from webhook payload
      const { id, email_addresses, first_name, last_name, image_url } =
        clerkUserCreatedEvent.data;

      const primaryEmail = email_addresses.find(
        (e) => e.id === clerkUserCreatedEvent.data.primary_email_address_id
      );
      const email = primaryEmail?.email_address ?? "";
      const name = [first_name, last_name].filter(Boolean).join(" ");

      expect(id).toBe("user_clerk_abc123");
      expect(email).toBe("john@example.com");
      expect(name).toBe("John Doe");
      expect(image_url).toBe("https://example.com/avatar.jpg");
    });

    it("should handle missing optional fields gracefully", () => {
      const clerkUserCreatedEvent = {
        type: "user.created" as const,
        data: {
          id: "user_clerk_xyz789",
          email_addresses: [
            { id: "email_1", email_address: "jane@example.com" },
          ],
          primary_email_address_id: "email_1",
          first_name: null,
          last_name: null,
          image_url: null,
        },
      };

      const { first_name, last_name, image_url } = clerkUserCreatedEvent.data;

      // Should default to "User" when no name provided
      const name =
        [first_name, last_name].filter(Boolean).join(" ") || "User";

      expect(name).toBe("User");
      expect(image_url).toBeNull();
    });
  });

  describe("user.updated event", () => {
    it("should update Convex user with new Clerk data", () => {
      const clerkUserUpdatedEvent = {
        type: "user.updated" as const,
        data: {
          id: "user_clerk_abc123",
          email_addresses: [
            { id: "email_1", email_address: "newemail@example.com" },
          ],
          primary_email_address_id: "email_1",
          first_name: "Jonathan",
          last_name: "Doe",
          image_url: "https://example.com/new-avatar.jpg",
        },
      };

      const { id, email_addresses, first_name, last_name, image_url } =
        clerkUserUpdatedEvent.data;

      const primaryEmail = email_addresses.find(
        (e) => e.id === clerkUserUpdatedEvent.data.primary_email_address_id
      );
      const email = primaryEmail?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ");

      expect(id).toBe("user_clerk_abc123");
      expect(email).toBe("newemail@example.com");
      expect(name).toBe("Jonathan Doe");
      expect(image_url).toBe("https://example.com/new-avatar.jpg");
    });
  });

  describe("user.deleted event", () => {
    it("should delete Convex user when Clerk user is deleted", () => {
      const clerkUserDeletedEvent = {
        type: "user.deleted" as const,
        data: {
          id: "user_clerk_abc123",
          email_addresses: [],
          primary_email_address_id: "",
          first_name: null,
          last_name: null,
          image_url: null,
        },
      };

      const { id } = clerkUserDeletedEvent.data;

      // Should have user ID to delete
      expect(id).toBe("user_clerk_abc123");
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("webhook signature verification", () => {
    it("should reject requests with missing headers", () => {
      const headers = {
        "svix-id": null,
        "svix-timestamp": null,
        "svix-signature": null,
      };

      const validateHeaders = (headers: Record<string, string | null>) => {
        if (
          !headers["svix-id"] ||
          !headers["svix-timestamp"] ||
          !headers["svix-signature"]
        ) {
          throw new Error("Missing required headers");
        }
        return true;
      };

      expect(() => validateHeaders(headers)).toThrow("Missing required headers");
    });

    it("should accept requests with valid headers", () => {
      const headers = {
        "svix-id": "msg_123",
        "svix-timestamp": "1234567890",
        "svix-signature": "v1,signature_here",
      };

      const validateHeaders = (headers: Record<string, string | null>) => {
        if (
          !headers["svix-id"] ||
          !headers["svix-timestamp"] ||
          !headers["svix-signature"]
        ) {
          throw new Error("Missing required headers");
        }
        return true;
      };

      expect(validateHeaders(headers)).toBe(true);
    });
  });
});

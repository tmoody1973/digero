/**
 * Convex Auth Configuration
 *
 * Configures Clerk as the authentication provider for Convex.
 * The domain is derived from your Clerk publishable key.
 */

export default {
  providers: [
    {
      domain: "https://neutral-sailfish-0.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

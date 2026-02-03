/**
 * Token Cache for Clerk
 *
 * Uses expo-secure-store for secure token storage.
 * Enables persistent authentication sessions across app restarts.
 */

import * as SecureStore from "expo-secure-store";
import { TokenCache } from "@clerk/clerk-expo";

/**
 * Creates a token cache compatible with Clerk that uses SecureStore
 * for secure, persistent storage of authentication tokens.
 */
export const tokenCache: TokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(key);
      return token;
    } catch (error) {
      console.error("SecureStore getToken error:", error);
      return null;
    }
  },

  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore saveToken error:", error);
    }
  },

  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore clearToken error:", error);
    }
  },
};

/**
 * Recipe Cache Service
 *
 * LRU cache for storing viewed recipes locally for offline access.
 * Uses AsyncStorage with a configurable size limit.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "@digero/recipe-cache";
const CACHE_INDEX_KEY = "@digero/recipe-cache-index";
const DEFAULT_MAX_RECIPES = 50;

interface CachedRecipe {
  id: string;
  data: unknown;
  cachedAt: number;
  lastAccessedAt: number;
}

interface CacheIndex {
  recipeIds: string[];
  maxRecipes: number;
}

/**
 * Get the cache index
 */
async function getCacheIndex(): Promise<CacheIndex> {
  try {
    const indexData = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    if (indexData) {
      return JSON.parse(indexData);
    }
  } catch (error) {
    console.error("Failed to get cache index:", error);
  }
  return { recipeIds: [], maxRecipes: DEFAULT_MAX_RECIPES };
}

/**
 * Save the cache index
 */
async function saveCacheIndex(index: CacheIndex): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error("Failed to save cache index:", error);
  }
}

/**
 * Get the storage key for a recipe
 */
function getRecipeKey(recipeId: string): string {
  return `${CACHE_KEY}:${recipeId}`;
}

/**
 * Cache a recipe for offline access
 * @param recipeId The recipe ID
 * @param recipeData The full recipe data
 */
export async function cacheRecipe(
  recipeId: string,
  recipeData: unknown
): Promise<void> {
  try {
    const index = await getCacheIndex();
    const now = Date.now();

    // Create cached recipe entry
    const cachedRecipe: CachedRecipe = {
      id: recipeId,
      data: recipeData,
      cachedAt: now,
      lastAccessedAt: now,
    };

    // Save the recipe data
    await AsyncStorage.setItem(
      getRecipeKey(recipeId),
      JSON.stringify(cachedRecipe)
    );

    // Update index - move to front (most recently used)
    const existingIndex = index.recipeIds.indexOf(recipeId);
    if (existingIndex > -1) {
      index.recipeIds.splice(existingIndex, 1);
    }
    index.recipeIds.unshift(recipeId);

    // Evict oldest recipes if over limit
    while (index.recipeIds.length > index.maxRecipes) {
      const oldestId = index.recipeIds.pop();
      if (oldestId) {
        await AsyncStorage.removeItem(getRecipeKey(oldestId));
      }
    }

    await saveCacheIndex(index);
  } catch (error) {
    console.error("Failed to cache recipe:", error);
  }
}

/**
 * Get a cached recipe
 * @param recipeId The recipe ID
 * @returns The cached recipe data or null if not cached
 */
export async function getCachedRecipe(recipeId: string): Promise<unknown | null> {
  try {
    const cachedData = await AsyncStorage.getItem(getRecipeKey(recipeId));
    if (!cachedData) {
      return null;
    }

    const cachedRecipe: CachedRecipe = JSON.parse(cachedData);

    // Update last accessed time
    cachedRecipe.lastAccessedAt = Date.now();
    await AsyncStorage.setItem(
      getRecipeKey(recipeId),
      JSON.stringify(cachedRecipe)
    );

    // Move to front of index (most recently used)
    const index = await getCacheIndex();
    const existingIndex = index.recipeIds.indexOf(recipeId);
    if (existingIndex > 0) {
      index.recipeIds.splice(existingIndex, 1);
      index.recipeIds.unshift(recipeId);
      await saveCacheIndex(index);
    }

    return cachedRecipe.data;
  } catch (error) {
    console.error("Failed to get cached recipe:", error);
    return null;
  }
}

/**
 * Check if a recipe is cached
 * @param recipeId The recipe ID
 * @returns True if the recipe is cached
 */
export async function isRecipeCached(recipeId: string): Promise<boolean> {
  try {
    const index = await getCacheIndex();
    return index.recipeIds.includes(recipeId);
  } catch (error) {
    return false;
  }
}

/**
 * Remove a recipe from the cache
 * @param recipeId The recipe ID
 */
export async function removeCachedRecipe(recipeId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getRecipeKey(recipeId));

    const index = await getCacheIndex();
    const existingIndex = index.recipeIds.indexOf(recipeId);
    if (existingIndex > -1) {
      index.recipeIds.splice(existingIndex, 1);
      await saveCacheIndex(index);
    }
  } catch (error) {
    console.error("Failed to remove cached recipe:", error);
  }
}

/**
 * Clear all cached recipes
 */
export async function clearCache(): Promise<void> {
  try {
    const index = await getCacheIndex();

    // Remove all cached recipes
    for (const recipeId of index.recipeIds) {
      await AsyncStorage.removeItem(getRecipeKey(recipeId));
    }

    // Clear the index
    await saveCacheIndex({ recipeIds: [], maxRecipes: index.maxRecipes });
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

/**
 * Get the current cache size
 * @returns The number of cached recipes
 */
export async function getCacheSize(): Promise<number> {
  try {
    const index = await getCacheIndex();
    return index.recipeIds.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Get all cached recipe IDs
 * @returns Array of cached recipe IDs
 */
export async function getCachedRecipeIds(): Promise<string[]> {
  try {
    const index = await getCacheIndex();
    return index.recipeIds;
  } catch (error) {
    return [];
  }
}

/**
 * Set the maximum cache size
 * @param maxRecipes Maximum number of recipes to cache
 */
export async function setMaxCacheSize(maxRecipes: number): Promise<void> {
  try {
    const index = await getCacheIndex();
    index.maxRecipes = maxRecipes;

    // Evict if over new limit
    while (index.recipeIds.length > maxRecipes) {
      const oldestId = index.recipeIds.pop();
      if (oldestId) {
        await AsyncStorage.removeItem(getRecipeKey(oldestId));
      }
    }

    await saveCacheIndex(index);
  } catch (error) {
    console.error("Failed to set max cache size:", error);
  }
}

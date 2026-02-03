/**
 * Offline Sync Queue Service
 *
 * Queues mutations when offline and processes them when back online.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "@digero/offline-sync-queue";

type MutationType = "toggleFavorite" | "deleteRecipe";

interface QueuedMutation {
  id: string;
  type: MutationType;
  payload: {
    recipeId: string;
    [key: string]: unknown;
  };
  createdAt: number;
  retryCount: number;
}

interface SyncQueue {
  mutations: QueuedMutation[];
}

/**
 * Generate a unique ID for queued mutations
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the sync queue
 */
async function getQueue(): Promise<SyncQueue> {
  try {
    const queueData = await AsyncStorage.getItem(QUEUE_KEY);
    if (queueData) {
      return JSON.parse(queueData);
    }
  } catch (error) {
    console.error("Failed to get sync queue:", error);
  }
  return { mutations: [] };
}

/**
 * Save the sync queue
 */
async function saveQueue(queue: SyncQueue): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save sync queue:", error);
  }
}

/**
 * Add a mutation to the offline queue
 * @param type The mutation type
 * @param payload The mutation payload
 */
export async function queueMutation(
  type: MutationType,
  payload: { recipeId: string; [key: string]: unknown }
): Promise<string> {
  const queue = await getQueue();

  const mutation: QueuedMutation = {
    id: generateId(),
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  };

  queue.mutations.push(mutation);
  await saveQueue(queue);

  return mutation.id;
}

/**
 * Remove a mutation from the queue
 * @param mutationId The mutation ID
 */
export async function removeMutation(mutationId: string): Promise<void> {
  const queue = await getQueue();
  queue.mutations = queue.mutations.filter((m) => m.id !== mutationId);
  await saveQueue(queue);
}

/**
 * Get all pending mutations
 * @returns Array of pending mutations
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const queue = await getQueue();
  return queue.mutations;
}

/**
 * Get the count of pending mutations
 * @returns Number of pending mutations
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.mutations.length;
}

/**
 * Clear all pending mutations
 */
export async function clearQueue(): Promise<void> {
  await saveQueue({ mutations: [] });
}

/**
 * Process a single mutation
 * @param mutation The mutation to process
 * @param executor Function to execute the mutation
 * @returns True if successful, false otherwise
 */
export async function processMutation(
  mutation: QueuedMutation,
  executor: (type: MutationType, payload: unknown) => Promise<void>
): Promise<boolean> {
  try {
    await executor(mutation.type, mutation.payload);
    await removeMutation(mutation.id);
    return true;
  } catch (error) {
    console.error(`Failed to process mutation ${mutation.id}:`, error);

    // Increment retry count
    const queue = await getQueue();
    const mutationIndex = queue.mutations.findIndex((m) => m.id === mutation.id);
    if (mutationIndex > -1) {
      queue.mutations[mutationIndex].retryCount++;

      // Remove after 3 failed attempts
      if (queue.mutations[mutationIndex].retryCount >= 3) {
        queue.mutations.splice(mutationIndex, 1);
        console.warn(`Mutation ${mutation.id} removed after 3 failed attempts`);
      }

      await saveQueue(queue);
    }

    return false;
  }
}

/**
 * Process all pending mutations
 * @param executor Function to execute each mutation
 * @returns Object with success and failure counts
 */
export async function processQueue(
  executor: (type: MutationType, payload: unknown) => Promise<void>
): Promise<{ success: number; failed: number }> {
  const queue = await getQueue();
  let success = 0;
  let failed = 0;

  for (const mutation of queue.mutations) {
    const result = await processMutation(mutation, executor);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Check if a recipe has pending mutations
 * @param recipeId The recipe ID
 * @returns True if there are pending mutations for this recipe
 */
export async function hasPendingMutations(recipeId: string): Promise<boolean> {
  const queue = await getQueue();
  return queue.mutations.some((m) => m.payload.recipeId === recipeId);
}

/**
 * Get pending mutations for a specific recipe
 * @param recipeId The recipe ID
 * @returns Array of pending mutations for the recipe
 */
export async function getPendingMutationsForRecipe(
  recipeId: string
): Promise<QueuedMutation[]> {
  const queue = await getQueue();
  return queue.mutations.filter((m) => m.payload.recipeId === recipeId);
}

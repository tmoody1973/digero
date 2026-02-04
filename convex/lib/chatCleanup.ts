/**
 * AI Chat Cleanup Utilities
 *
 * Helper functions for cleaning up old AI chat messages.
 * Used by the cron job to identify and delete messages older than 30 days.
 */

/**
 * 30 days in milliseconds
 */
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Maximum number of messages to delete in a single batch
 * Prevents timeout issues when cleaning up large numbers of messages
 */
export const BATCH_SIZE = 100;

/**
 * Check if a timestamp is older than 30 days
 *
 * @param timestamp - The timestamp to check (milliseconds since epoch)
 * @param now - Current timestamp for comparison (defaults to Date.now())
 * @returns True if the timestamp is more than 30 days old
 */
export function isOlderThanThirtyDays(
  timestamp: number,
  now: number = Date.now()
): boolean {
  const age = now - timestamp;
  return age > THIRTY_DAYS_MS;
}

/**
 * Filter messages to find those older than a cutoff timestamp
 *
 * @param messages - Array of messages with createdAt timestamps
 * @param cutoffTimestamp - Timestamp to compare against
 * @returns Array of messages with createdAt before the cutoff
 */
export function getMessagesOlderThan<T extends { createdAt: number }>(
  messages: T[],
  cutoffTimestamp: number
): T[] {
  return messages.filter((message) => message.createdAt < cutoffTimestamp);
}

/**
 * Calculate the cutoff timestamp for 30-day retention
 *
 * @param now - Current timestamp (defaults to Date.now())
 * @returns Timestamp representing 30 days ago
 */
export function getCutoffTimestamp(now: number = Date.now()): number {
  return now - THIRTY_DAYS_MS;
}

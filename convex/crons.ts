/**
 * Convex Cron Jobs
 *
 * Scheduled tasks that run automatically at specified intervals.
 * Currently includes AI chat message cleanup.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Clean up old AI chat messages
 *
 * Runs daily at 3:00 AM UTC.
 * Deletes AI chat messages older than 30 days to manage database size.
 * Uses batch deletion to prevent timeout issues.
 */
crons.daily(
  "cleanup old AI chat messages",
  { hourUTC: 3, minuteUTC: 0 },
  internal.aiChatCleanup.cleanupOldMessages
);

export default crons;

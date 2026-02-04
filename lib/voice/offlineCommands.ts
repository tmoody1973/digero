/**
 * Offline Command Parser
 *
 * Parse text input for basic commands when voice assistant is offline.
 * Supports navigation and timer commands only - no AI queries.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Offline command types
 */
export type OfflineCommandType = "navigation" | "timer" | "unknown";

/**
 * Navigation command result
 */
export interface NavigationCommand {
  type: "navigation";
  action: "next" | "previous";
}

/**
 * Timer command result
 */
export interface TimerCommand {
  type: "timer";
  action: "start" | "stop";
  /** Duration in seconds (for start action) */
  durationSeconds?: number;
}

/**
 * Unknown command result
 */
export interface UnknownCommand {
  type: "unknown";
  rawText: string;
}

/**
 * Union of all command results
 */
export type OfflineCommandResult = NavigationCommand | TimerCommand | UnknownCommand;

// =============================================================================
// Parsing Patterns
// =============================================================================

/**
 * Navigation command patterns
 */
const NAVIGATION_PATTERNS = {
  next: /^(next|forward|go\s+forward|next\s+step)$/i,
  previous: /^(previous|prev|back|go\s+back|last\s+step|previous\s+step)$/i,
};

/**
 * Timer command patterns
 */
const TIMER_PATTERNS = {
  start: /^(start|set|begin)\s+(a\s+)?timer\s+(for\s+)?(.+)$/i,
  stop: /^(stop|cancel|clear|dismiss)\s+(the\s+)?timer$/i,
};

/**
 * Time parsing patterns
 */
const TIME_PATTERNS = [
  // "X hours" or "X hour" or "X h"
  { pattern: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i, multiplier: 3600 },
  // "X minutes" or "X minute" or "X min" or "X m"
  { pattern: /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/i, multiplier: 60 },
  // "X seconds" or "X second" or "X sec" or "X s"
  { pattern: /(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)\b/i, multiplier: 1 },
];

// =============================================================================
// Parsing Functions
// =============================================================================

/**
 * Parse a time string into total seconds
 *
 * @param timeStr - Time string like "5 minutes", "1 hour 30 min", etc.
 * @returns Total seconds, or null if parsing fails
 */
export function parseTimeString(timeStr: string): number | null {
  let totalSeconds = 0;
  let foundMatch = false;

  for (const { pattern, multiplier } of TIME_PATTERNS) {
    const match = timeStr.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        totalSeconds += Math.round(value * multiplier);
        foundMatch = true;
      }
    }
  }

  // If no pattern matched, try parsing as just a number (assume minutes)
  if (!foundMatch) {
    const numberMatch = timeStr.match(/^(\d+(?:\.\d+)?)\s*$/);
    if (numberMatch) {
      const value = parseFloat(numberMatch[1]);
      if (!isNaN(value)) {
        totalSeconds = Math.round(value * 60); // Assume minutes
        foundMatch = true;
      }
    }
  }

  return foundMatch && totalSeconds > 0 ? totalSeconds : null;
}

/**
 * Parse an offline text command
 *
 * @param text - Raw text input from user
 * @returns Parsed command result
 *
 * @example
 * ```typescript
 * parseOfflineCommand("next");
 * // { type: "navigation", action: "next" }
 *
 * parseOfflineCommand("start timer for 5 minutes");
 * // { type: "timer", action: "start", durationSeconds: 300 }
 *
 * parseOfflineCommand("what is the temperature?");
 * // { type: "unknown", rawText: "what is the temperature?" }
 * ```
 */
export function parseOfflineCommand(text: string): OfflineCommandResult {
  const trimmed = text.trim().toLowerCase();

  // Check navigation commands
  if (NAVIGATION_PATTERNS.next.test(trimmed)) {
    return { type: "navigation", action: "next" };
  }

  if (NAVIGATION_PATTERNS.previous.test(trimmed)) {
    return { type: "navigation", action: "previous" };
  }

  // Check timer stop command
  if (TIMER_PATTERNS.stop.test(trimmed)) {
    return { type: "timer", action: "stop" };
  }

  // Check timer start command
  const startMatch = trimmed.match(TIMER_PATTERNS.start);
  if (startMatch) {
    const timeStr = startMatch[4];
    const durationSeconds = parseTimeString(timeStr);

    if (durationSeconds !== null) {
      return {
        type: "timer",
        action: "start",
        durationSeconds,
      };
    }
  }

  // Unknown command
  return { type: "unknown", rawText: text };
}

/**
 * Get a human-readable description of a command result
 *
 * @param result - Parsed command result
 * @returns Human-readable description
 */
export function getCommandDescription(result: OfflineCommandResult): string {
  switch (result.type) {
    case "navigation":
      return result.action === "next"
        ? "Go to next step"
        : "Go to previous step";

    case "timer":
      if (result.action === "stop") {
        return "Stop timer";
      }
      if (result.durationSeconds) {
        return `Start timer for ${formatDuration(result.durationSeconds)}`;
      }
      return "Start timer";

    case "unknown":
      return "Unknown command";
  }
}

/**
 * Format seconds as human-readable duration
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string like "5 minutes" or "1 hour 30 minutes"
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }

  if (secs > 0 && hours === 0) {
    parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);
  }

  return parts.join(" ");
}

/**
 * Check if a command is supported offline
 *
 * @param result - Parsed command result
 * @returns True if command can be executed offline
 */
export function isOfflineSupported(result: OfflineCommandResult): boolean {
  return result.type !== "unknown";
}

/**
 * Get list of supported offline commands
 *
 * @returns Array of example commands
 */
export function getSupportedCommands(): string[] {
  return [
    "next",
    "previous",
    "back",
    "start timer 5 min",
    "set timer for 10 minutes",
    "start timer 1 hour",
    "stop timer",
    "cancel timer",
  ];
}

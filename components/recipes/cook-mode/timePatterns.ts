/**
 * Time Pattern Detection Utility
 *
 * Detects time patterns in cooking instruction text and extracts duration in seconds.
 */

interface TimeMatch {
  text: string;
  seconds: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Regex patterns for detecting time references in text
 */
const TIME_PATTERNS = [
  // "X hours" or "X hour"
  /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/gi,
  // "X minutes" or "X minute" or "X mins" or "X min"
  /(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/gi,
  // "X seconds" or "X second" or "X secs" or "X sec"
  /(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)\b/gi,
  // "X-Y minutes" range (use the higher value)
  /(\d+)-(\d+)\s*(?:minutes?|mins?)\b/gi,
];

/**
 * Combined pattern for all time formats
 */
const COMBINED_PATTERN = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/gi;

/**
 * Parse a time string and return total seconds
 */
function parseTimeToSeconds(match: string): number {
  const hourMatch = match.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i);
  const minMatch = match.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)(?![a-z])/i);
  const secMatch = match.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)/i);

  let totalSeconds = 0;

  if (hourMatch) {
    totalSeconds += parseFloat(hourMatch[1]) * 3600;
  }
  if (minMatch) {
    totalSeconds += parseFloat(minMatch[1]) * 60;
  }
  if (secMatch) {
    totalSeconds += parseFloat(secMatch[1]);
  }

  return Math.round(totalSeconds);
}

/**
 * Detect all time patterns in a text string
 * @param text The instruction text to analyze
 * @returns Array of detected time matches
 */
export function detectTimePatterns(text: string): TimeMatch[] {
  const matches: TimeMatch[] = [];
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  COMBINED_PATTERN.lastIndex = 0;

  while ((match = COMBINED_PATTERN.exec(text)) !== null) {
    const matchText = match[0];
    const seconds = parseTimeToSeconds(matchText);

    if (seconds > 0) {
      matches.push({
        text: matchText,
        seconds,
        startIndex: match.index,
        endIndex: match.index + matchText.length,
      });
    }
  }

  // Handle range patterns like "10-15 minutes"
  const rangePattern = /(\d+)-(\d+)\s*(?:minutes?|mins?)\b/gi;
  let rangeMatch: RegExpExecArray | null;

  while ((rangeMatch = rangePattern.exec(text)) !== null) {
    const minValue = parseInt(rangeMatch[1], 10);
    const maxValue = parseInt(rangeMatch[2], 10);
    const avgSeconds = Math.round((minValue + maxValue) / 2) * 60;

    // Check if this overlaps with existing matches
    const overlaps = matches.some(
      (m) =>
        (rangeMatch!.index >= m.startIndex && rangeMatch!.index < m.endIndex) ||
        (m.startIndex >= rangeMatch!.index &&
          m.startIndex < rangeMatch!.index + rangeMatch![0].length)
    );

    if (!overlaps && avgSeconds > 0) {
      matches.push({
        text: rangeMatch[0],
        seconds: avgSeconds,
        startIndex: rangeMatch.index,
        endIndex: rangeMatch.index + rangeMatch[0].length,
      });
    }
  }

  // Sort by position in text
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Get the primary (longest) time from an instruction step
 * @param text The instruction text
 * @returns The longest detected time in seconds, or null if none found
 */
export function getPrimaryTime(text: string): number | null {
  const matches = detectTimePatterns(text);

  if (matches.length === 0) {
    return null;
  }

  // Return the longest time (most likely the main cooking time)
  return Math.max(...matches.map((m) => m.seconds));
}

/**
 * Format seconds into a human-readable string
 * @param seconds Total seconds
 * @returns Formatted time string (e.g., "5 min", "1h 30m")
 */
export function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }

  if (secs > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${minutes} min`;
}

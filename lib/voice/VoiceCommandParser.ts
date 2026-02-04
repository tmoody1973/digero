/**
 * Voice Command Parser
 *
 * Parses voice text to identify command intent and extract parameters.
 * Supports timer, navigation, scaling, and query commands.
 */

import {
  VoiceCommandType,
  ParsedVoiceCommand,
  TimerCommandParams,
  NavigationCommandParams,
  ScalingCommandParams,
  QueryCommandParams,
} from "@/types/voice";

// =============================================================================
// Types
// =============================================================================

/**
 * Command pattern definition
 */
interface CommandPattern {
  type: VoiceCommandType;
  patterns: RegExp[];
  parser: (match: RegExpMatchArray, text: string) => ParsedVoiceCommand | null;
}

// =============================================================================
// Time Parsing Utilities
// =============================================================================

/**
 * Parse time duration from text and return seconds
 * Reuses patterns from timePatterns.ts
 */
function parseTimeToSeconds(text: string): number | null {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  const minMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)(?![a-z])/i);
  const secMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)\b/i);

  let totalSeconds = 0;
  let foundAny = false;

  if (hourMatch) {
    totalSeconds += parseFloat(hourMatch[1]) * 3600;
    foundAny = true;
  }
  if (minMatch) {
    totalSeconds += parseFloat(minMatch[1]) * 60;
    foundAny = true;
  }
  if (secMatch) {
    totalSeconds += parseFloat(secMatch[1]);
    foundAny = true;
  }

  return foundAny ? Math.round(totalSeconds) : null;
}

/**
 * Extract time duration from voice command text
 */
function extractTimeDuration(text: string): number | null {
  // Look for "for X minutes" or "X minute timer" patterns
  const forPattern = /(?:for|of)\s+(.+?)(?:\s+timer)?$/i;
  const timerPattern = /(\d+[^,]+?)(?:\s+timer)/i;
  const plainPattern = /(\d+\s*(?:hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)[\d\s]*(?:hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)?)/i;

  let timeText: string | null = null;

  const forMatch = text.match(forPattern);
  if (forMatch) {
    timeText = forMatch[1];
  }

  const timerMatch = text.match(timerPattern);
  if (!timeText && timerMatch) {
    timeText = timerMatch[1];
  }

  if (!timeText) {
    const plainMatch = text.match(plainPattern);
    if (plainMatch) {
      timeText = plainMatch[1];
    }
  }

  if (timeText) {
    return parseTimeToSeconds(timeText);
  }

  return null;
}

// =============================================================================
// Timer Command Patterns
// =============================================================================

const TIMER_PATTERNS: CommandPattern = {
  type: "timer",
  patterns: [
    // Start timer patterns
    /set\s+(?:a\s+)?timer/i,
    /start\s+(?:a\s+)?(?:\d+.+)?timer/i,
    /timer\s+for/i,
    /(?:\d+)\s*(?:minute|min|hour|second|sec)s?\s+timer/i,
    // Pause/resume patterns
    /pause\s+(?:the\s+)?timer/i,
    /resume\s+(?:the\s+)?timer/i,
    /unpause\s+(?:the\s+)?timer/i,
    // Cancel patterns
    /cancel\s+(?:the\s+)?timer/i,
    /stop\s+(?:the\s+)?timer/i,
    /dismiss\s+(?:the\s+)?timer/i,
    /clear\s+(?:the\s+)?timer/i,
    // Status patterns
    /how\s+much\s+time\s+(?:is\s+)?(?:left|remaining)/i,
    /time\s+(?:left|remaining)/i,
    /timer\s+status/i,
    /what'?s?\s+(?:the\s+)?(?:timer|time\s+left)/i,
  ],
  parser: (match: RegExpMatchArray, text: string): ParsedVoiceCommand | null => {
    const lowerText = text.toLowerCase();

    // Determine action
    let action: TimerCommandParams["action"];
    let durationSeconds: number | undefined;

    if (/pause/i.test(lowerText)) {
      action = "pause";
    } else if (/resume|unpause/i.test(lowerText)) {
      action = "resume";
    } else if (/cancel|stop|dismiss|clear/i.test(lowerText) && /timer/i.test(lowerText)) {
      action = "cancel";
    } else if (/how\s+much\s+time|time\s+(?:left|remaining)|timer\s+status|what'?s?\s+(?:the\s+)?(?:timer|time)/i.test(lowerText)) {
      action = "status";
    } else {
      // Start timer - extract duration
      action = "start";
      durationSeconds = extractTimeDuration(text) ?? undefined;

      // If no duration found but this is clearly a timer command, default to null duration
      if (!durationSeconds) {
        return null; // Cannot start timer without duration
      }
    }

    const params: TimerCommandParams = {
      type: "timer",
      action,
      durationSeconds,
    };

    return {
      type: "timer",
      rawText: text,
      params,
      confidence: 0.9,
    };
  },
};

// =============================================================================
// Navigation Command Patterns
// =============================================================================

const NAVIGATION_PATTERNS: CommandPattern = {
  type: "navigation",
  patterns: [
    // Next/previous
    /next\s+step/i,
    /previous\s+step/i,
    /go\s+(?:to\s+)?(?:the\s+)?next/i,
    /go\s+(?:to\s+)?(?:the\s+)?previous/i,
    /go\s+back/i,
    /move\s+(?:to\s+)?(?:the\s+)?(?:next|previous)/i,
    // Go to specific step
    /go\s+to\s+step\s+(\d+)/i,
    /jump\s+to\s+step\s+(\d+)/i,
    /skip\s+to\s+step\s+(\d+)/i,
    /step\s+(\d+)/i,
    // Status queries
    /what\s+step\s+(?:am\s+I\s+on|is\s+this)/i,
    /which\s+step/i,
    /current\s+step/i,
    /how\s+many\s+steps?\s+(?:left|remaining|are\s+there)/i,
    /steps?\s+(?:left|remaining)/i,
    /read\s+(?:the\s+)?(?:current\s+)?step/i,
    /repeat\s+(?:the\s+)?(?:current\s+)?step/i,
  ],
  parser: (match: RegExpMatchArray, text: string): ParsedVoiceCommand | null => {
    const lowerText = text.toLowerCase();

    let action: NavigationCommandParams["action"];
    let stepNumber: number | undefined;

    // Check for specific step number
    const stepMatch = text.match(/(?:go\s+to|jump\s+to|skip\s+to|step)\s+(?:step\s+)?(\d+)/i);
    if (stepMatch) {
      action = "goto";
      stepNumber = parseInt(stepMatch[1], 10);
    } else if (/next/i.test(lowerText)) {
      action = "next";
    } else if (/previous|back/i.test(lowerText)) {
      action = "previous";
    } else if (
      /what\s+step|which\s+step|current\s+step|how\s+many\s+steps|steps?\s+(?:left|remaining)|read|repeat/i.test(
        lowerText
      )
    ) {
      action = "status";
    } else {
      return null;
    }

    const params: NavigationCommandParams = {
      type: "navigation",
      action,
      stepNumber,
    };

    return {
      type: "navigation",
      rawText: text,
      params,
      confidence: 0.9,
    };
  },
};

// =============================================================================
// Scaling Command Patterns
// =============================================================================

const SCALING_PATTERNS: CommandPattern = {
  type: "scaling",
  patterns: [
    // Double/triple/halve patterns
    /double\s+(?:the\s+)?recipe/i,
    /triple\s+(?:the\s+)?recipe/i,
    /halve\s+(?:the\s+)?recipe/i,
    /half\s+(?:the\s+)?recipe/i,
    // Scale by multiplier
    /(?:scale|multiply)\s+(?:the\s+)?recipe\s+(?:by\s+)?(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*x\s+(?:the\s+)?recipe/i,
    // Make for X people/servings
    /make\s+(?:this\s+)?(?:recipe\s+)?for\s+(\d+)\s*(?:people|servings?|portions?)/i,
    /(?:scale|adjust)\s+(?:to|for)\s+(\d+)\s*(?:people|servings?|portions?)/i,
    /(\d+)\s*(?:servings?|portions?)/i,
    // Reset
    /reset\s+(?:the\s+)?(?:recipe\s+)?(?:to\s+)?(?:original|default)/i,
    /original\s+(?:recipe|quantities|amounts)/i,
    // Query scaled amounts
    /how\s+much\s+(.+?)\s+(?:for|do\s+I\s+need)/i,
    /(?:what'?s?\s+(?:the\s+)?)?scaled\s+(?:amount|quantity)\s+(?:of|for)\s+(.+)/i,
  ],
  parser: (match: RegExpMatchArray, text: string): ParsedVoiceCommand | null => {
    const lowerText = text.toLowerCase();

    let action: ScalingCommandParams["action"];
    let multiplier: number | undefined;
    let targetServings: number | undefined;
    let ingredientQuery: string | undefined;

    // Check for reset
    if (/reset|original/i.test(lowerText)) {
      action = "reset";
    }
    // Check for specific multipliers
    else if (/double/i.test(lowerText)) {
      action = "scale";
      multiplier = 2;
    } else if (/triple/i.test(lowerText)) {
      action = "scale";
      multiplier = 3;
    } else if (/halve|half/i.test(lowerText)) {
      action = "scale";
      multiplier = 0.5;
    }
    // Check for explicit multiplier
    else {
      const multiplierMatch = text.match(
        /(?:scale|multiply)\s+(?:the\s+)?recipe\s+(?:by\s+)?(\d+(?:\.\d+)?)/i
      );
      const xMatch = text.match(/(\d+(?:\.\d+)?)\s*x\s+(?:the\s+)?recipe/i);

      if (multiplierMatch) {
        action = "scale";
        multiplier = parseFloat(multiplierMatch[1]);
      } else if (xMatch) {
        action = "scale";
        multiplier = parseFloat(xMatch[1]);
      }
      // Check for servings target
      else {
        const servingsMatch = text.match(
          /(?:make\s+(?:this\s+)?(?:recipe\s+)?for|(?:scale|adjust)\s+(?:to|for)|^)\s*(\d+)\s*(?:people|servings?|portions?)/i
        );

        if (servingsMatch) {
          action = "scale";
          targetServings = parseInt(servingsMatch[1], 10);
        }
        // Check for ingredient query
        else {
          const queryMatch = text.match(
            /how\s+much\s+(.+?)\s+(?:for|do\s+I\s+need)/i
          );
          const scaledMatch = text.match(
            /(?:what'?s?\s+(?:the\s+)?)?scaled\s+(?:amount|quantity)\s+(?:of|for)\s+(.+)/i
          );

          if (queryMatch || scaledMatch) {
            action = "query";
            ingredientQuery = (queryMatch?.[1] || scaledMatch?.[1])?.trim();
          } else {
            return null;
          }
        }
      }
    }

    const params: ScalingCommandParams = {
      type: "scaling",
      action,
      multiplier,
      targetServings,
      ingredientQuery,
    };

    return {
      type: "scaling",
      rawText: text,
      params,
      confidence: 0.85,
    };
  },
};

// =============================================================================
// All Command Patterns
// =============================================================================

const COMMAND_PATTERNS: CommandPattern[] = [
  TIMER_PATTERNS,
  NAVIGATION_PATTERNS,
  SCALING_PATTERNS,
];

// =============================================================================
// Main Parser Function
// =============================================================================

/**
 * Parse voice text to identify command intent
 *
 * Attempts to match the input text against known command patterns.
 * If no pattern matches, returns a query command to be sent to Gemini.
 *
 * @param text - Voice input text to parse
 * @returns Parsed command with type and parameters
 *
 * @example
 * ```typescript
 * const command = parseVoiceCommand("set timer for 5 minutes");
 * // { type: 'timer', params: { action: 'start', durationSeconds: 300 } }
 *
 * const command = parseVoiceCommand("next step");
 * // { type: 'navigation', params: { action: 'next' } }
 *
 * const command = parseVoiceCommand("how do I know when it's done?");
 * // { type: 'query', params: { question: "how do I know when it's done?" } }
 * ```
 */
export function parseVoiceCommand(text: string): ParsedVoiceCommand {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return createQueryCommand("");
  }

  // Try each command pattern
  for (const commandPattern of COMMAND_PATTERNS) {
    for (const pattern of commandPattern.patterns) {
      const match = trimmedText.match(pattern);
      if (match) {
        const parsed = commandPattern.parser(match, trimmedText);
        if (parsed) {
          return parsed;
        }
      }
    }
  }

  // No pattern matched - treat as a query for Gemini
  return createQueryCommand(trimmedText);
}

/**
 * Create a query command for Gemini
 */
function createQueryCommand(text: string): ParsedVoiceCommand {
  const params: QueryCommandParams = {
    type: "query",
    question: text,
  };

  return {
    type: "query",
    rawText: text,
    params,
    confidence: 1.0, // Queries always have full confidence (fallback)
  };
}

/**
 * Check if the parsed command is a timer command
 */
export function isTimerCommand(
  command: ParsedVoiceCommand
): command is ParsedVoiceCommand & { params: TimerCommandParams } {
  return command.type === "timer";
}

/**
 * Check if the parsed command is a navigation command
 */
export function isNavigationCommand(
  command: ParsedVoiceCommand
): command is ParsedVoiceCommand & { params: NavigationCommandParams } {
  return command.type === "navigation";
}

/**
 * Check if the parsed command is a scaling command
 */
export function isScalingCommand(
  command: ParsedVoiceCommand
): command is ParsedVoiceCommand & { params: ScalingCommandParams } {
  return command.type === "scaling";
}

/**
 * Check if the parsed command is a query command
 */
export function isQueryCommand(
  command: ParsedVoiceCommand
): command is ParsedVoiceCommand & { params: QueryCommandParams } {
  return command.type === "query";
}

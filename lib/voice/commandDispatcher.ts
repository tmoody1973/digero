/**
 * Command Dispatcher
 *
 * Routes parsed voice commands to appropriate handlers and
 * generates voice responses for completed actions.
 */

import {
  ParsedVoiceCommand,
  TimerCommandParams,
  NavigationCommandParams,
  ScalingCommandParams,
  QueryCommandParams,
} from "@/types/voice";
import {
  parseVoiceCommand,
  isTimerCommand,
  isNavigationCommand,
  isScalingCommand,
  isQueryCommand,
} from "./VoiceCommandParser";

// =============================================================================
// Types
// =============================================================================

/**
 * Timer control callbacks from cook-mode
 */
export interface TimerCallbacks {
  /** Start a new timer with duration in seconds */
  handleStartTimer: (seconds: number) => void;
  /** Dismiss/cancel the active timer */
  handleDismissTimer: () => void;
  /** Pause the active timer (if supported) */
  handlePauseTimer?: () => void;
  /** Resume the paused timer (if supported) */
  handleResumeTimer?: () => void;
  /** Get remaining seconds on active timer */
  getRemainingSeconds?: () => number | null;
  /** Check if timer is running */
  isTimerRunning?: () => boolean;
}

/**
 * Navigation control callbacks from cook-mode
 */
export interface NavigationCallbacks {
  /** Go to a specific step (0-indexed) */
  goToStep: (step: number) => void;
  /** Go to previous step */
  goToPrevious: () => void;
  /** Go to next step */
  goToNext: () => void;
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Get instruction text for a step */
  getStepText?: (step: number) => string | null;
}

/**
 * Scaling control callbacks
 */
export interface ScalingCallbacks {
  /** Scale recipe by multiplier */
  scaleRecipe: (multiplier: number) => void;
  /** Scale recipe to target servings */
  scaleToServings: (servings: number) => void;
  /** Reset to original scale */
  resetScaling: () => void;
  /** Get scaled ingredient info */
  getIngredient: (query: string) => { formatted: string } | null;
  /** Current scale multiplier */
  scaledMultiplier: number;
  /** Base servings */
  baseServings: number;
  /** Current scaled servings */
  currentServings: number;
}

/**
 * Query handler for Gemini AI
 */
export interface QueryHandler {
  /** Send a question to Gemini and get a response */
  sendQuery: (question: string) => Promise<void>;
}

/**
 * All callbacks combined for the dispatcher
 */
export interface CommandDispatcherCallbacks {
  timer?: TimerCallbacks;
  navigation?: NavigationCallbacks;
  scaling?: ScalingCallbacks;
  query?: QueryHandler;
}

/**
 * Result of command dispatch
 */
export interface CommandDispatchResult {
  /** Whether the command was handled */
  handled: boolean;
  /** Voice response to speak to user */
  voiceResponse: string | null;
  /** Whether to send to Gemini for AI response */
  sendToGemini: boolean;
  /** The original parsed command */
  command: ParsedVoiceCommand;
}

// =============================================================================
// Timer Command Handler
// =============================================================================

function handleTimerCommand(
  params: TimerCommandParams,
  callbacks: TimerCallbacks
): { handled: boolean; voiceResponse: string | null } {
  switch (params.action) {
    case "start": {
      if (params.durationSeconds && params.durationSeconds > 0) {
        callbacks.handleStartTimer(params.durationSeconds);
        const formatted = formatDuration(params.durationSeconds);
        return {
          handled: true,
          voiceResponse: `Timer set for ${formatted}`,
        };
      }
      return {
        handled: false,
        voiceResponse: "I didn't catch the timer duration. Please try again.",
      };
    }

    case "pause": {
      if (callbacks.handlePauseTimer) {
        callbacks.handlePauseTimer();
        return {
          handled: true,
          voiceResponse: "Timer paused",
        };
      }
      return {
        handled: false,
        voiceResponse: "Timer pause is not available",
      };
    }

    case "resume": {
      if (callbacks.handleResumeTimer) {
        callbacks.handleResumeTimer();
        return {
          handled: true,
          voiceResponse: "Timer resumed",
        };
      }
      return {
        handled: false,
        voiceResponse: "Timer resume is not available",
      };
    }

    case "cancel": {
      callbacks.handleDismissTimer();
      return {
        handled: true,
        voiceResponse: "Timer cancelled",
      };
    }

    case "status": {
      if (callbacks.getRemainingSeconds) {
        const remaining = callbacks.getRemainingSeconds();
        if (remaining !== null && remaining > 0) {
          const formatted = formatDuration(remaining);
          const running = callbacks.isTimerRunning?.() ?? true;
          const status = running ? "remaining" : "remaining, paused";
          return {
            handled: true,
            voiceResponse: `${formatted} ${status}`,
          };
        }
      }
      return {
        handled: true,
        voiceResponse: "No active timer",
      };
    }

    default:
      return {
        handled: false,
        voiceResponse: null,
      };
  }
}

// =============================================================================
// Navigation Command Handler
// =============================================================================

function handleNavigationCommand(
  params: NavigationCommandParams,
  callbacks: NavigationCallbacks
): { handled: boolean; voiceResponse: string | null } {
  const { currentStep, totalSteps, goToStep, goToPrevious, goToNext, getStepText } = callbacks;

  switch (params.action) {
    case "next": {
      if (currentStep >= totalSteps - 1) {
        return {
          handled: true,
          voiceResponse: "You're on the final step",
        };
      }
      goToNext();
      const nextStep = currentStep + 1;
      const preview = getStepText?.(nextStep);
      const response = preview
        ? `Step ${nextStep + 1}: ${truncateText(preview, 100)}`
        : `Moving to step ${nextStep + 1}`;
      return {
        handled: true,
        voiceResponse: response,
      };
    }

    case "previous": {
      if (currentStep <= 0) {
        return {
          handled: true,
          voiceResponse: "You're on the first step",
        };
      }
      goToPrevious();
      const prevStep = currentStep - 1;
      const preview = getStepText?.(prevStep);
      const response = preview
        ? `Step ${prevStep + 1}: ${truncateText(preview, 100)}`
        : `Moving to step ${prevStep + 1}`;
      return {
        handled: true,
        voiceResponse: response,
      };
    }

    case "goto": {
      if (!params.stepNumber) {
        return {
          handled: false,
          voiceResponse: "I didn't catch the step number",
        };
      }

      const targetStep = params.stepNumber - 1; // Convert to 0-indexed
      if (targetStep < 0 || targetStep >= totalSteps) {
        return {
          handled: true,
          voiceResponse: `Recipe only has ${totalSteps} steps`,
        };
      }

      goToStep(targetStep);
      const preview = getStepText?.(targetStep);
      const response = preview
        ? `Step ${params.stepNumber}: ${truncateText(preview, 100)}`
        : `Moving to step ${params.stepNumber}`;
      return {
        handled: true,
        voiceResponse: response,
      };
    }

    case "status": {
      const stepsRemaining = totalSteps - currentStep - 1;
      let response = `You're on step ${currentStep + 1} of ${totalSteps}`;
      if (stepsRemaining > 0) {
        response += `. ${stepsRemaining} step${stepsRemaining === 1 ? "" : "s"} remaining`;
      } else {
        response += ". This is the final step";
      }
      return {
        handled: true,
        voiceResponse: response,
      };
    }

    default:
      return {
        handled: false,
        voiceResponse: null,
      };
  }
}

// =============================================================================
// Scaling Command Handler
// =============================================================================

function handleScalingCommand(
  params: ScalingCommandParams,
  callbacks: ScalingCallbacks
): { handled: boolean; voiceResponse: string | null } {
  const {
    scaleRecipe,
    scaleToServings,
    resetScaling,
    getIngredient,
    scaledMultiplier,
    baseServings,
    currentServings,
  } = callbacks;

  switch (params.action) {
    case "scale": {
      if (params.multiplier) {
        scaleRecipe(params.multiplier);
        const description = getMultiplierDescription(params.multiplier);
        const newServings = Math.round(baseServings * params.multiplier);
        return {
          handled: true,
          voiceResponse: `Recipe ${description}. Now makes ${newServings} servings. All quantities have been adjusted.`,
        };
      }

      if (params.targetServings) {
        scaleToServings(params.targetServings);
        return {
          handled: true,
          voiceResponse: `Recipe scaled to ${params.targetServings} servings. All quantities have been adjusted.`,
        };
      }

      return {
        handled: false,
        voiceResponse: "I couldn't determine how to scale the recipe",
      };
    }

    case "reset": {
      resetScaling();
      return {
        handled: true,
        voiceResponse: `Recipe reset to original ${baseServings} servings`,
      };
    }

    case "query": {
      if (!params.ingredientQuery) {
        return {
          handled: false,
          voiceResponse: "I didn't catch which ingredient you're asking about",
        };
      }

      const ingredient = getIngredient(params.ingredientQuery);
      if (ingredient) {
        let response = `You need ${ingredient.formatted}`;
        if (scaledMultiplier !== 1) {
          response += ` for the scaled recipe`;
        }
        return {
          handled: true,
          voiceResponse: response,
        };
      }

      return {
        handled: true,
        voiceResponse: `I couldn't find ${params.ingredientQuery} in the recipe`,
      };
    }

    default:
      return {
        handled: false,
        voiceResponse: null,
      };
  }
}

// =============================================================================
// Main Dispatcher
// =============================================================================

/**
 * Dispatch a voice command to the appropriate handler
 *
 * Routes parsed commands to timer, navigation, scaling, or query handlers
 * and returns a result with voice response.
 *
 * @param text - Raw voice input text
 * @param callbacks - Handler callbacks for each command type
 * @returns Dispatch result with handled status and voice response
 *
 * @example
 * ```typescript
 * const result = await dispatchCommand("next step", {
 *   navigation: {
 *     goToStep, goToPrevious, goToNext,
 *     currentStep: 2, totalSteps: 8,
 *   },
 * });
 *
 * if (result.handled) {
 *   speakResponse(result.voiceResponse);
 * }
 * ```
 */
export async function dispatchCommand(
  text: string,
  callbacks: CommandDispatcherCallbacks
): Promise<CommandDispatchResult> {
  const command = parseVoiceCommand(text);

  // Timer commands
  if (isTimerCommand(command) && callbacks.timer) {
    const result = handleTimerCommand(command.params, callbacks.timer);
    return {
      ...result,
      sendToGemini: false,
      command,
    };
  }

  // Navigation commands
  if (isNavigationCommand(command) && callbacks.navigation) {
    const result = handleNavigationCommand(command.params, callbacks.navigation);
    return {
      ...result,
      sendToGemini: false,
      command,
    };
  }

  // Scaling commands
  if (isScalingCommand(command) && callbacks.scaling) {
    const result = handleScalingCommand(command.params, callbacks.scaling);
    return {
      ...result,
      sendToGemini: false,
      command,
    };
  }

  // Query commands - send to Gemini
  if (isQueryCommand(command)) {
    if (callbacks.query && command.params.question) {
      await callbacks.query.sendQuery(command.params.question);
    }
    return {
      handled: true,
      voiceResponse: null, // Gemini will provide the response
      sendToGemini: true,
      command,
    };
  }

  // Unhandled command
  return {
    handled: false,
    voiceResponse: "I'm not sure how to help with that. Try asking about the recipe or using a command like 'next step' or 'set timer'.",
    sendToGemini: false,
    command,
  };
}

/**
 * Dispatch a pre-parsed command
 */
export async function dispatchParsedCommand(
  command: ParsedVoiceCommand,
  callbacks: CommandDispatcherCallbacks
): Promise<CommandDispatchResult> {
  // Timer commands
  if (isTimerCommand(command) && callbacks.timer) {
    const result = handleTimerCommand(command.params, callbacks.timer);
    return {
      ...result,
      sendToGemini: false,
      command,
    };
  }

  // Navigation commands
  if (isNavigationCommand(command) && callbacks.navigation) {
    const result = handleNavigationCommand(command.params, callbacks.navigation);
    return {
      ...result,
      sendToGemini: false,
      command,
    };
  }

  // Scaling commands
  if (isScalingCommand(command) && callbacks.scaling) {
    const result = handleScalingCommand(command.params, callbacks.scaling);
    return {
      ...result,
      sendToGemini: false,
      command,
    };
  }

  // Query commands
  if (isQueryCommand(command)) {
    if (callbacks.query && command.params.question) {
      await callbacks.query.sendQuery(command.params.question);
    }
    return {
      handled: true,
      voiceResponse: null,
      sendToGemini: true,
      command,
    };
  }

  return {
    handled: false,
    voiceResponse: null,
    sendToGemini: false,
    command,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format duration in seconds to human-readable string
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

  return parts.join(" and ");
}

/**
 * Get description of a scale multiplier
 */
function getMultiplierDescription(multiplier: number): string {
  if (multiplier === 2) return "doubled";
  if (multiplier === 3) return "tripled";
  if (multiplier === 0.5) return "halved";
  if (multiplier === 0.25) return "quartered";
  return `scaled to ${multiplier}x`;
}

/**
 * Truncate text to max length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

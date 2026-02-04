/**
 * useTimerVoiceControl Hook
 *
 * Provides voice control interface for timer functionality in cook-mode.
 * Accepts timer callbacks from parent component and executes voice commands.
 */

import { useCallback, useMemo, useRef } from "react";
import {
  parseVoiceCommand,
  isTimerCommand,
} from "@/lib/voice/VoiceCommandParser";
import { TimerCommandParams } from "@/types/voice";
import { formatSeconds } from "@/components/recipes/cook-mode/timePatterns";

// =============================================================================
// Types
// =============================================================================

/**
 * Timer state from cook-mode
 */
export interface TimerState {
  /** Whether a timer is currently active */
  hasActiveTimer: boolean;
  /** Whether the timer is running (not paused) */
  isRunning: boolean;
  /** Remaining seconds on the timer */
  remainingSeconds: number | null;
  /** Initial duration when timer was started */
  initialSeconds: number | null;
}

/**
 * Timer callbacks from cook-mode
 */
export interface TimerVoiceCallbacks {
  /** Start a new timer with duration in seconds */
  handleStartTimer: (seconds: number) => void;
  /** Dismiss/cancel the active timer */
  handleDismissTimer: () => void;
  /** Pause the timer (optional - may not be supported) */
  handlePauseTimer?: () => void;
  /** Resume the timer (optional - may not be supported) */
  handleResumeTimer?: () => void;
}

/**
 * Result of executing a timer voice command
 */
export interface TimerCommandResult {
  /** Whether the command was successfully handled */
  success: boolean;
  /** Voice response to speak to user */
  voiceResponse: string;
  /** Action that was performed */
  action: TimerCommandParams["action"] | null;
}

/**
 * Return type for useTimerVoiceControl hook
 */
export interface UseTimerVoiceControlReturn {
  /** Execute a timer voice command */
  executeTimerCommand: (text: string) => TimerCommandResult;
  /** Execute a pre-parsed timer command */
  executeParsedCommand: (params: TimerCommandParams) => TimerCommandResult;
  /** Get current timer status as voice response */
  getTimerStatus: () => string;
  /** Check if text is a timer command */
  isTimerCommand: (text: string) => boolean;
}

/**
 * Options for the useTimerVoiceControl hook
 */
export interface UseTimerVoiceControlOptions {
  /** Current timer state */
  timerState: TimerState;
  /** Timer callbacks */
  callbacks: TimerVoiceCallbacks;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for voice control of timers in cook-mode
 *
 * Parses voice commands related to timers and executes them
 * through the provided callbacks.
 *
 * @param options - Timer state and callbacks
 * @returns Timer voice control interface
 *
 * @example
 * ```tsx
 * const { executeTimerCommand, getTimerStatus } = useTimerVoiceControl({
 *   timerState: {
 *     hasActiveTimer: !!activeTimer,
 *     isRunning: timerRunning,
 *     remainingSeconds: timerRemaining,
 *     initialSeconds: activeTimer?.seconds,
 *   },
 *   callbacks: {
 *     handleStartTimer,
 *     handleDismissTimer,
 *   },
 * });
 *
 * // Execute voice command
 * const result = executeTimerCommand("set timer for 5 minutes");
 * if (result.success) {
 *   speakResponse(result.voiceResponse);
 * }
 * ```
 */
export function useTimerVoiceControl(
  options: UseTimerVoiceControlOptions
): UseTimerVoiceControlReturn {
  const { timerState, callbacks } = options;

  // Keep callbacks stable reference
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const timerStateRef = useRef(timerState);
  timerStateRef.current = timerState;

  /**
   * Execute a pre-parsed timer command
   */
  const executeParsedCommand = useCallback(
    (params: TimerCommandParams): TimerCommandResult => {
      const state = timerStateRef.current;
      const cbs = callbacksRef.current;

      switch (params.action) {
        case "start": {
          if (!params.durationSeconds || params.durationSeconds <= 0) {
            return {
              success: false,
              voiceResponse: "I didn't catch the timer duration. Please say something like 'set timer for 5 minutes'.",
              action: "start",
            };
          }

          cbs.handleStartTimer(params.durationSeconds);
          const formatted = formatDurationForSpeech(params.durationSeconds);
          return {
            success: true,
            voiceResponse: `Timer set for ${formatted}`,
            action: "start",
          };
        }

        case "pause": {
          if (!state.hasActiveTimer) {
            return {
              success: false,
              voiceResponse: "There's no active timer to pause",
              action: "pause",
            };
          }

          if (!cbs.handlePauseTimer) {
            return {
              success: false,
              voiceResponse: "Timer pause is not available. You can cancel the timer instead.",
              action: "pause",
            };
          }

          if (!state.isRunning) {
            return {
              success: false,
              voiceResponse: "The timer is already paused",
              action: "pause",
            };
          }

          cbs.handlePauseTimer();
          return {
            success: true,
            voiceResponse: "Timer paused",
            action: "pause",
          };
        }

        case "resume": {
          if (!state.hasActiveTimer) {
            return {
              success: false,
              voiceResponse: "There's no timer to resume",
              action: "resume",
            };
          }

          if (!cbs.handleResumeTimer) {
            return {
              success: false,
              voiceResponse: "Timer resume is not available",
              action: "resume",
            };
          }

          if (state.isRunning) {
            return {
              success: false,
              voiceResponse: "The timer is already running",
              action: "resume",
            };
          }

          cbs.handleResumeTimer();
          return {
            success: true,
            voiceResponse: "Timer resumed",
            action: "resume",
          };
        }

        case "cancel": {
          if (!state.hasActiveTimer) {
            return {
              success: false,
              voiceResponse: "There's no active timer to cancel",
              action: "cancel",
            };
          }

          cbs.handleDismissTimer();
          return {
            success: true,
            voiceResponse: "Timer cancelled",
            action: "cancel",
          };
        }

        case "status": {
          return {
            success: true,
            voiceResponse: getTimerStatusFromState(state),
            action: "status",
          };
        }

        default:
          return {
            success: false,
            voiceResponse: "I didn't understand that timer command",
            action: null,
          };
      }
    },
    []
  );

  /**
   * Execute a timer voice command from raw text
   */
  const executeTimerCommand = useCallback(
    (text: string): TimerCommandResult => {
      const command = parseVoiceCommand(text);

      if (!isTimerCommand(command)) {
        return {
          success: false,
          voiceResponse: "That doesn't seem to be a timer command",
          action: null,
        };
      }

      return executeParsedCommand(command.params);
    },
    [executeParsedCommand]
  );

  /**
   * Get current timer status as voice response
   */
  const getTimerStatus = useCallback((): string => {
    return getTimerStatusFromState(timerStateRef.current);
  }, []);

  /**
   * Check if text is a timer command
   */
  const checkIsTimerCommand = useCallback((text: string): boolean => {
    const command = parseVoiceCommand(text);
    return isTimerCommand(command);
  }, []);

  return useMemo(
    () => ({
      executeTimerCommand,
      executeParsedCommand,
      getTimerStatus,
      isTimerCommand: checkIsTimerCommand,
    }),
    [executeTimerCommand, executeParsedCommand, getTimerStatus, checkIsTimerCommand]
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get timer status message from state
 */
function getTimerStatusFromState(state: TimerState): string {
  if (!state.hasActiveTimer || state.remainingSeconds === null) {
    return "No active timer";
  }

  if (state.remainingSeconds <= 0) {
    return "Timer complete";
  }

  const formatted = formatDurationForSpeech(state.remainingSeconds);
  const status = state.isRunning ? "remaining" : "remaining, paused";
  return `${formatted} ${status}`;
}

/**
 * Format duration for speech output
 */
function formatDurationForSpeech(seconds: number): string {
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

  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }
  return parts.join(", ");
}

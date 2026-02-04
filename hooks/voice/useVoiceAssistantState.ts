/**
 * useVoiceAssistantState Hook
 *
 * State machine for managing voice assistant states with validated transitions.
 * Uses useReducer for predictable state management.
 */

import { useReducer, useCallback, useMemo } from "react";
import type {
  VoiceAssistantState,
  VoiceAssistantAction,
  VoiceAssistantStateContext,
  UseVoiceAssistantStateReturn,
  VALID_TRANSITIONS,
} from "@/types/voice";

/**
 * Valid state transitions map
 * Defines which states can transition to which other states
 */
const TRANSITIONS: Record<VoiceAssistantState, VoiceAssistantState[]> = {
  idle: ["listening", "error"],
  listening: ["processing", "idle", "error"],
  processing: ["speaking", "idle", "error"],
  speaking: ["idle", "listening", "error"],
  error: ["idle"],
};

/**
 * Initial state for the voice assistant
 */
const initialState: VoiceAssistantStateContext = {
  state: "idle",
  error: null,
  lastTransition: Date.now(),
};

/**
 * Get the target state for a given action
 */
function getTargetState(action: VoiceAssistantAction): VoiceAssistantState {
  switch (action.type) {
    case "START_LISTENING":
      return "listening";
    case "STOP_LISTENING":
      return "idle";
    case "START_PROCESSING":
      return "processing";
    case "START_SPEAKING":
      return "speaking";
    case "FINISH_SPEAKING":
      return "idle";
    case "SET_ERROR":
      return "error";
    case "RESET":
      return "idle";
    default:
      return "idle";
  }
}

/**
 * Check if a transition is valid
 */
function isValidTransition(
  currentState: VoiceAssistantState,
  targetState: VoiceAssistantState
): boolean {
  // Reset is always valid
  if (targetState === "idle" && currentState === "error") {
    return true;
  }
  return TRANSITIONS[currentState].includes(targetState);
}

/**
 * Reducer function for the voice assistant state machine
 */
function voiceAssistantReducer(
  state: VoiceAssistantStateContext,
  action: VoiceAssistantAction
): VoiceAssistantStateContext {
  const targetState = getTargetState(action);

  // Handle reset action - always allowed
  if (action.type === "RESET") {
    return {
      state: "idle",
      error: null,
      lastTransition: Date.now(),
    };
  }

  // Validate transition
  if (!isValidTransition(state.state, targetState)) {
    console.warn(
      `Invalid state transition: ${state.state} -> ${targetState} (action: ${action.type})`
    );
    return state;
  }

  // Handle error state
  if (action.type === "SET_ERROR") {
    return {
      state: "error",
      error: action.error,
      lastTransition: Date.now(),
    };
  }

  // Standard transition
  return {
    state: targetState,
    error: null,
    lastTransition: Date.now(),
  };
}

/**
 * Hook for managing voice assistant state machine
 *
 * Provides a validated state machine with clear transitions between states.
 * Invalid transitions are logged and ignored.
 *
 * State Flow:
 * ```
 *              START_LISTENING                   START_PROCESSING
 * [idle] ────────────────────> [listening] ─────────────────────> [processing]
 *   ^                               │                                  │
 *   │                               │ STOP_LISTENING                   │
 *   │                               v                                  │
 *   │                            [idle]                                │
 *   │                                                                  │
 *   │                                                   START_SPEAKING │
 *   │                                                                  v
 *   │<──────────────────────────────────────────────────────── [speaking]
 *   │                          FINISH_SPEAKING
 *   │
 *   │                              SET_ERROR
 *   │<────────────────────────────────────────────────────────── [error]
 *              RESET
 * ```
 *
 * @returns State machine controls and current state
 *
 * @example
 * ```tsx
 * const { state, transition, reset, error } = useVoiceAssistantState();
 *
 * // Start listening
 * transition({ type: "START_LISTENING" });
 *
 * // Handle error
 * transition({ type: "SET_ERROR", error: "Connection failed" });
 *
 * // Reset to idle
 * reset();
 * ```
 */
export function useVoiceAssistantState(): UseVoiceAssistantStateReturn {
  const [context, dispatch] = useReducer(voiceAssistantReducer, initialState);

  /**
   * Transition to a new state via action
   * Returns true if transition was valid, false otherwise
   */
  const transition = useCallback(
    (action: VoiceAssistantAction): boolean => {
      const targetState = getTargetState(action);

      // Check if transition is valid before dispatching
      if (action.type !== "RESET" && !isValidTransition(context.state, targetState)) {
        console.warn(
          `Blocked invalid transition: ${context.state} -> ${targetState}`
        );
        return false;
      }

      dispatch(action);
      return true;
    },
    [context.state]
  );

  /**
   * Reset to idle state
   */
  const reset = useCallback((): void => {
    dispatch({ type: "RESET" });
  }, []);

  /**
   * Check if a transition to the target state is valid
   */
  const canTransition = useCallback(
    (targetState: VoiceAssistantState): boolean => {
      return isValidTransition(context.state, targetState);
    },
    [context.state]
  );

  return {
    state: context.state,
    error: context.error,
    transition,
    reset,
    canTransition,
  };
}

/**
 * Utility hook for checking specific states
 */
export function useVoiceAssistantStateChecks(state: VoiceAssistantState) {
  return useMemo(
    () => ({
      isIdle: state === "idle",
      isListening: state === "listening",
      isProcessing: state === "processing",
      isSpeaking: state === "speaking",
      isError: state === "error",
      isActive: state !== "idle" && state !== "error",
    }),
    [state]
  );
}

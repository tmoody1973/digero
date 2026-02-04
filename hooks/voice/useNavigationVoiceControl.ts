/**
 * useNavigationVoiceControl Hook
 *
 * Provides voice control interface for step navigation in cook-mode.
 * Accepts navigation callbacks from parent component and executes voice commands.
 */

import { useCallback, useMemo, useRef } from "react";
import {
  parseVoiceCommand,
  isNavigationCommand,
} from "@/lib/voice/VoiceCommandParser";
import { NavigationCommandParams } from "@/types/voice";

// =============================================================================
// Types
// =============================================================================

/**
 * Navigation state from cook-mode
 */
export interface NavigationState {
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Recipe instructions */
  instructions: string[];
}

/**
 * Navigation callbacks from cook-mode
 */
export interface NavigationVoiceCallbacks {
  /** Go to a specific step (0-indexed) */
  goToStep: (step: number) => void;
  /** Go to previous step */
  goToPrevious: () => void;
  /** Go to next step */
  goToNext: () => void;
}

/**
 * Result of executing a navigation voice command
 */
export interface NavigationCommandResult {
  /** Whether the command was successfully handled */
  success: boolean;
  /** Voice response to speak to user */
  voiceResponse: string;
  /** Action that was performed */
  action: NavigationCommandParams["action"] | null;
  /** New step number (1-indexed) after navigation */
  newStep: number | null;
}

/**
 * Return type for useNavigationVoiceControl hook
 */
export interface UseNavigationVoiceControlReturn {
  /** Execute a navigation voice command */
  executeNavigationCommand: (text: string) => NavigationCommandResult;
  /** Execute a pre-parsed navigation command */
  executeParsedCommand: (params: NavigationCommandParams) => NavigationCommandResult;
  /** Get current progress status as voice response */
  getProgressStatus: () => string;
  /** Check if text is a navigation command */
  isNavigationCommand: (text: string) => boolean;
  /** Get instruction text for a specific step */
  getStepText: (step: number) => string | null;
}

/**
 * Options for the useNavigationVoiceControl hook
 */
export interface UseNavigationVoiceControlOptions {
  /** Current navigation state */
  navigationState: NavigationState;
  /** Navigation callbacks */
  callbacks: NavigationVoiceCallbacks;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for voice control of step navigation in cook-mode
 *
 * Parses voice commands related to navigation and executes them
 * through the provided callbacks.
 *
 * @param options - Navigation state and callbacks
 * @returns Navigation voice control interface
 *
 * @example
 * ```tsx
 * const { executeNavigationCommand, getProgressStatus } = useNavigationVoiceControl({
 *   navigationState: {
 *     currentStep,
 *     totalSteps: instructions.length,
 *     instructions,
 *   },
 *   callbacks: {
 *     goToStep,
 *     goToPrevious,
 *     goToNext,
 *   },
 * });
 *
 * // Execute voice command
 * const result = executeNavigationCommand("next step");
 * if (result.success) {
 *   speakResponse(result.voiceResponse);
 * }
 * ```
 */
export function useNavigationVoiceControl(
  options: UseNavigationVoiceControlOptions
): UseNavigationVoiceControlReturn {
  const { navigationState, callbacks } = options;

  // Keep stable references
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const stateRef = useRef(navigationState);
  stateRef.current = navigationState;

  /**
   * Get instruction text for a specific step
   */
  const getStepText = useCallback((step: number): string | null => {
    const state = stateRef.current;
    if (step < 0 || step >= state.totalSteps) {
      return null;
    }
    return state.instructions[step] ?? null;
  }, []);

  /**
   * Execute a pre-parsed navigation command
   */
  const executeParsedCommand = useCallback(
    (params: NavigationCommandParams): NavigationCommandResult => {
      const state = stateRef.current;
      const cbs = callbacksRef.current;
      const { currentStep, totalSteps } = state;

      switch (params.action) {
        case "next": {
          // Check if already at last step
          if (currentStep >= totalSteps - 1) {
            return {
              success: false,
              voiceResponse: "You're on the final step",
              action: "next",
              newStep: currentStep + 1,
            };
          }

          cbs.goToNext();
          const nextStep = currentStep + 1;
          const preview = getStepText(nextStep);
          const response = preview
            ? `Step ${nextStep + 1}: ${truncateForSpeech(preview)}`
            : `Moving to step ${nextStep + 1}`;

          return {
            success: true,
            voiceResponse: response,
            action: "next",
            newStep: nextStep + 1,
          };
        }

        case "previous": {
          // Check if already at first step
          if (currentStep <= 0) {
            return {
              success: false,
              voiceResponse: "You're on the first step",
              action: "previous",
              newStep: 1,
            };
          }

          cbs.goToPrevious();
          const prevStep = currentStep - 1;
          const preview = getStepText(prevStep);
          const response = preview
            ? `Step ${prevStep + 1}: ${truncateForSpeech(preview)}`
            : `Moving to step ${prevStep + 1}`;

          return {
            success: true,
            voiceResponse: response,
            action: "previous",
            newStep: prevStep + 1,
          };
        }

        case "goto": {
          if (!params.stepNumber) {
            return {
              success: false,
              voiceResponse: "I didn't catch the step number. Please say something like 'go to step 3'.",
              action: "goto",
              newStep: null,
            };
          }

          const targetStep = params.stepNumber - 1; // Convert to 0-indexed

          // Validate step number
          if (targetStep < 0) {
            return {
              success: false,
              voiceResponse: "Step number must be at least 1",
              action: "goto",
              newStep: null,
            };
          }

          if (targetStep >= totalSteps) {
            return {
              success: false,
              voiceResponse: `Recipe only has ${totalSteps} step${totalSteps !== 1 ? "s" : ""}`,
              action: "goto",
              newStep: null,
            };
          }

          // Check if already on that step
          if (targetStep === currentStep) {
            return {
              success: true,
              voiceResponse: `You're already on step ${params.stepNumber}`,
              action: "goto",
              newStep: params.stepNumber,
            };
          }

          cbs.goToStep(targetStep);
          const preview = getStepText(targetStep);
          const response = preview
            ? `Step ${params.stepNumber}: ${truncateForSpeech(preview)}`
            : `Moving to step ${params.stepNumber}`;

          return {
            success: true,
            voiceResponse: response,
            action: "goto",
            newStep: params.stepNumber,
          };
        }

        case "status": {
          const stepsRemaining = totalSteps - currentStep - 1;
          const stepNum = currentStep + 1;

          let response = `You're on step ${stepNum} of ${totalSteps}`;

          if (stepsRemaining > 0) {
            response += `. ${stepsRemaining} step${stepsRemaining === 1 ? "" : "s"} remaining`;
          } else {
            response += ". This is the final step";
          }

          // Include current step text if short enough
          const stepText = getStepText(currentStep);
          if (stepText && stepText.length <= 100) {
            response += `. Current step: ${stepText}`;
          }

          return {
            success: true,
            voiceResponse: response,
            action: "status",
            newStep: stepNum,
          };
        }

        default:
          return {
            success: false,
            voiceResponse: "I didn't understand that navigation command",
            action: null,
            newStep: null,
          };
      }
    },
    [getStepText]
  );

  /**
   * Execute a navigation voice command from raw text
   */
  const executeNavigationCommand = useCallback(
    (text: string): NavigationCommandResult => {
      const command = parseVoiceCommand(text);

      if (!isNavigationCommand(command)) {
        return {
          success: false,
          voiceResponse: "That doesn't seem to be a navigation command",
          action: null,
          newStep: null,
        };
      }

      return executeParsedCommand(command.params);
    },
    [executeParsedCommand]
  );

  /**
   * Get current progress status as voice response
   */
  const getProgressStatus = useCallback((): string => {
    const state = stateRef.current;
    const { currentStep, totalSteps } = state;
    const stepsRemaining = totalSteps - currentStep - 1;
    const stepNum = currentStep + 1;

    let response = `You're on step ${stepNum} of ${totalSteps}`;

    if (stepsRemaining > 0) {
      response += `. ${stepsRemaining} step${stepsRemaining === 1 ? "" : "s"} remaining`;
    } else {
      response += ". This is the final step";
    }

    return response;
  }, []);

  /**
   * Check if text is a navigation command
   */
  const checkIsNavigationCommand = useCallback((text: string): boolean => {
    const command = parseVoiceCommand(text);
    return isNavigationCommand(command);
  }, []);

  return useMemo(
    () => ({
      executeNavigationCommand,
      executeParsedCommand,
      getProgressStatus,
      isNavigationCommand: checkIsNavigationCommand,
      getStepText,
    }),
    [
      executeNavigationCommand,
      executeParsedCommand,
      getProgressStatus,
      checkIsNavigationCommand,
      getStepText,
    ]
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Truncate text for speech output
 * Keeps text concise for voice responses
 */
function truncateForSpeech(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to break at a sentence or phrase boundary
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastComma = truncated.lastIndexOf(",");
  const lastSpace = truncated.lastIndexOf(" ");

  // Prefer breaking at period, then comma, then space
  let breakPoint = maxLength;
  if (lastPeriod > maxLength * 0.5) {
    breakPoint = lastPeriod + 1;
  } else if (lastComma > maxLength * 0.5) {
    breakPoint = lastComma;
  } else if (lastSpace > maxLength * 0.5) {
    breakPoint = lastSpace;
  }

  return text.slice(0, breakPoint).trim() + "...";
}

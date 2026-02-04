/**
 * useScalingVoiceControl Hook
 *
 * Provides voice control interface for recipe scaling in cook-mode.
 * Tracks scale multiplier and executes scaling voice commands.
 */

import { useCallback, useMemo, useRef } from "react";
import {
  parseVoiceCommand,
  isScalingCommand,
} from "@/lib/voice/VoiceCommandParser";
import { ScalingCommandParams } from "@/types/voice";
import {
  getScaledIngredient,
  RecipeData,
  ScaledIngredient,
} from "@/lib/voice/recipeContext";

// =============================================================================
// Types
// =============================================================================

/**
 * Scaling state
 */
export interface ScalingState {
  /** Current scale multiplier (1 = original) */
  scaledMultiplier: number;
  /** Base servings from recipe */
  baseServings: number;
  /** Current scaled servings */
  currentServings: number;
}

/**
 * Scaling callbacks
 */
export interface ScalingVoiceCallbacks {
  /** Scale recipe by multiplier */
  scaleRecipe: (multiplier: number) => void;
  /** Scale recipe to target servings */
  scaleToServings: (servings: number) => void;
  /** Reset to original scale */
  resetScaling: () => void;
}

/**
 * Result of executing a scaling voice command
 */
export interface ScalingCommandResult {
  /** Whether the command was successfully handled */
  success: boolean;
  /** Voice response to speak to user */
  voiceResponse: string;
  /** Action that was performed */
  action: ScalingCommandParams["action"] | null;
  /** New scale multiplier after the action */
  newMultiplier: number | null;
}

/**
 * Return type for useScalingVoiceControl hook
 */
export interface UseScalingVoiceControlReturn {
  /** Execute a scaling voice command */
  executeScalingCommand: (text: string) => ScalingCommandResult;
  /** Execute a pre-parsed scaling command */
  executeParsedCommand: (params: ScalingCommandParams) => ScalingCommandResult;
  /** Get a scaled ingredient by name */
  getScaledIngredient: (query: string) => ScaledIngredient | null;
  /** Get current scaling status as voice response */
  getScalingStatus: () => string;
  /** Check if text is a scaling command */
  isScalingCommand: (text: string) => boolean;
  /** Current scale multiplier */
  scaledMultiplier: number;
  /** Current scaled servings */
  currentServings: number;
}

/**
 * Options for the useScalingVoiceControl hook
 */
export interface UseScalingVoiceControlOptions {
  /** Recipe data for ingredient lookups */
  recipe: RecipeData | null;
  /** Current scaling state */
  scalingState: ScalingState;
  /** Scaling callbacks */
  callbacks: ScalingVoiceCallbacks;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for voice control of recipe scaling in cook-mode
 *
 * Parses voice commands related to scaling and executes them
 * through the provided callbacks.
 *
 * @param options - Recipe data, scaling state and callbacks
 * @returns Scaling voice control interface
 *
 * @example
 * ```tsx
 * const {
 *   executeScalingCommand,
 *   getScaledIngredient,
 *   scaledMultiplier,
 * } = useScalingVoiceControl({
 *   recipe,
 *   scalingState: {
 *     scaledMultiplier,
 *     baseServings: recipe.servings,
 *     currentServings,
 *   },
 *   callbacks: {
 *     scaleRecipe,
 *     scaleToServings,
 *     resetScaling,
 *   },
 * });
 *
 * // Execute voice command
 * const result = executeScalingCommand("double the recipe");
 * if (result.success) {
 *   speakResponse(result.voiceResponse);
 * }
 * ```
 */
export function useScalingVoiceControl(
  options: UseScalingVoiceControlOptions
): UseScalingVoiceControlReturn {
  const { recipe, scalingState, callbacks } = options;

  // Keep stable references
  const recipeRef = useRef(recipe);
  recipeRef.current = recipe;

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const stateRef = useRef(scalingState);
  stateRef.current = scalingState;

  /**
   * Get a scaled ingredient by name
   */
  const getIngredient = useCallback(
    (query: string): ScaledIngredient | null => {
      const currentRecipe = recipeRef.current;
      const state = stateRef.current;

      if (!currentRecipe) {
        return null;
      }

      return getScaledIngredient(currentRecipe, query, state.scaledMultiplier);
    },
    []
  );

  /**
   * Execute a pre-parsed scaling command
   */
  const executeParsedCommand = useCallback(
    (params: ScalingCommandParams): ScalingCommandResult => {
      const state = stateRef.current;
      const cbs = callbacksRef.current;
      const currentRecipe = recipeRef.current;

      switch (params.action) {
        case "scale": {
          // Scale by multiplier
          if (params.multiplier !== undefined) {
            const multiplier = params.multiplier;

            // Validate multiplier range
            if (multiplier <= 0) {
              return {
                success: false,
                voiceResponse: "Scale multiplier must be greater than zero",
                action: "scale",
                newMultiplier: null,
              };
            }

            if (multiplier > 10) {
              return {
                success: false,
                voiceResponse: "I can only scale recipes up to 10 times the original",
                action: "scale",
                newMultiplier: null,
              };
            }

            cbs.scaleRecipe(multiplier);
            const newServings = Math.round(state.baseServings * multiplier);
            const description = getMultiplierDescription(multiplier);

            return {
              success: true,
              voiceResponse: `Recipe ${description}. Now makes ${newServings} serving${newServings !== 1 ? "s" : ""}. All quantities have been adjusted.`,
              action: "scale",
              newMultiplier: multiplier,
            };
          }

          // Scale to target servings
          if (params.targetServings !== undefined) {
            const targetServings = params.targetServings;

            if (targetServings <= 0) {
              return {
                success: false,
                voiceResponse: "Servings must be at least 1",
                action: "scale",
                newMultiplier: null,
              };
            }

            if (state.baseServings <= 0) {
              return {
                success: false,
                voiceResponse: "Cannot scale recipe without base servings information",
                action: "scale",
                newMultiplier: null,
              };
            }

            const newMultiplier = targetServings / state.baseServings;

            if (newMultiplier > 10) {
              return {
                success: false,
                voiceResponse: `${targetServings} servings would require scaling more than 10 times. Please choose fewer servings.`,
                action: "scale",
                newMultiplier: null,
              };
            }

            cbs.scaleToServings(targetServings);

            return {
              success: true,
              voiceResponse: `Recipe scaled to ${targetServings} serving${targetServings !== 1 ? "s" : ""}. All quantities have been adjusted.`,
              action: "scale",
              newMultiplier,
            };
          }

          return {
            success: false,
            voiceResponse: "I couldn't determine how to scale the recipe. Try saying 'double the recipe' or 'make for 4 people'.",
            action: "scale",
            newMultiplier: null,
          };
        }

        case "reset": {
          if (state.scaledMultiplier === 1) {
            return {
              success: true,
              voiceResponse: "Recipe is already at original quantities",
              action: "reset",
              newMultiplier: 1,
            };
          }

          cbs.resetScaling();

          return {
            success: true,
            voiceResponse: `Recipe reset to original ${state.baseServings} serving${state.baseServings !== 1 ? "s" : ""}`,
            action: "reset",
            newMultiplier: 1,
          };
        }

        case "query": {
          if (!params.ingredientQuery) {
            return {
              success: false,
              voiceResponse: "I didn't catch which ingredient you're asking about",
              action: "query",
              newMultiplier: state.scaledMultiplier,
            };
          }

          if (!currentRecipe) {
            return {
              success: false,
              voiceResponse: "Recipe data is not available",
              action: "query",
              newMultiplier: state.scaledMultiplier,
            };
          }

          const ingredient = getIngredient(params.ingredientQuery);

          if (!ingredient) {
            return {
              success: true,
              voiceResponse: `I couldn't find ${params.ingredientQuery} in the recipe ingredients`,
              action: "query",
              newMultiplier: state.scaledMultiplier,
            };
          }

          let response = `You need ${ingredient.formatted}`;
          if (state.scaledMultiplier !== 1) {
            response += ` for the ${getMultiplierDescription(state.scaledMultiplier)} recipe`;
          }

          return {
            success: true,
            voiceResponse: response,
            action: "query",
            newMultiplier: state.scaledMultiplier,
          };
        }

        default:
          return {
            success: false,
            voiceResponse: "I didn't understand that scaling command",
            action: null,
            newMultiplier: null,
          };
      }
    },
    [getIngredient]
  );

  /**
   * Execute a scaling voice command from raw text
   */
  const executeScalingCommand = useCallback(
    (text: string): ScalingCommandResult => {
      const command = parseVoiceCommand(text);

      if (!isScalingCommand(command)) {
        return {
          success: false,
          voiceResponse: "That doesn't seem to be a scaling command",
          action: null,
          newMultiplier: null,
        };
      }

      return executeParsedCommand(command.params);
    },
    [executeParsedCommand]
  );

  /**
   * Get current scaling status as voice response
   */
  const getScalingStatus = useCallback((): string => {
    const state = stateRef.current;

    if (state.scaledMultiplier === 1) {
      return `Recipe is at original size, making ${state.baseServings} serving${state.baseServings !== 1 ? "s" : ""}`;
    }

    const description = getMultiplierDescription(state.scaledMultiplier);
    return `Recipe is ${description}, now making ${state.currentServings} serving${state.currentServings !== 1 ? "s" : ""} instead of the original ${state.baseServings}`;
  }, []);

  /**
   * Check if text is a scaling command
   */
  const checkIsScalingCommand = useCallback((text: string): boolean => {
    const command = parseVoiceCommand(text);
    return isScalingCommand(command);
  }, []);

  return useMemo(
    () => ({
      executeScalingCommand,
      executeParsedCommand,
      getScaledIngredient: getIngredient,
      getScalingStatus,
      isScalingCommand: checkIsScalingCommand,
      scaledMultiplier: scalingState.scaledMultiplier,
      currentServings: scalingState.currentServings,
    }),
    [
      executeScalingCommand,
      executeParsedCommand,
      getIngredient,
      getScalingStatus,
      checkIsScalingCommand,
      scalingState.scaledMultiplier,
      scalingState.currentServings,
    ]
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get human-readable description of a scale multiplier
 */
function getMultiplierDescription(multiplier: number): string {
  // Common multipliers
  if (multiplier === 2) return "doubled";
  if (multiplier === 3) return "tripled";
  if (multiplier === 4) return "quadrupled";
  if (multiplier === 0.5) return "halved";
  if (multiplier === 0.25) return "quartered";
  if (multiplier === 0.33 || multiplier === 1 / 3) return "reduced to one-third";
  if (multiplier === 1.5) return "scaled to one and a half times";

  // Generic description
  if (multiplier < 1) {
    const percentage = Math.round(multiplier * 100);
    return `reduced to ${percentage}%`;
  }

  return `scaled to ${multiplier}x`;
}

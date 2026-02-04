/**
 * useRecipeContext Hook
 *
 * Manages recipe context for the voice assistant, including
 * current step tracking and ingredient scaling.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  buildRecipeContext,
  getScaledIngredient,
  calculateScaleMultiplier,
  RecipeData,
  RecipeContext,
  ScaledIngredient,
} from "@/lib/voice/recipeContext";

// =============================================================================
// Types
// =============================================================================

/**
 * Return type for useRecipeContext hook
 */
export interface UseRecipeContextReturn {
  /** Built recipe context with system prompt */
  context: RecipeContext | null;
  /** Raw system prompt string for Gemini */
  systemPrompt: string | null;
  /** Update current step */
  updateStep: (step: number) => void;
  /** Scale the recipe by a multiplier */
  scaleRecipe: (multiplier: number) => void;
  /** Scale the recipe to target servings */
  scaleToServings: (servings: number) => void;
  /** Reset scaling to original */
  resetScaling: () => void;
  /** Get a scaled ingredient by name */
  getIngredient: (query: string) => ScaledIngredient | null;
  /** Current scale multiplier */
  scaledMultiplier: number;
  /** Current scaled servings */
  currentServings: number;
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether recipe data is loaded */
  isLoaded: boolean;
}

/**
 * Options for the useRecipeContext hook
 */
export interface UseRecipeContextOptions {
  /** Initial step (0-indexed) */
  initialStep?: number;
  /** Initial scale multiplier */
  initialMultiplier?: number;
  /** Callback when context changes */
  onContextChange?: (context: RecipeContext) => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing recipe context in the voice assistant
 *
 * Tracks current cooking step and handles ingredient scaling.
 * Rebuilds context when step or scale changes.
 *
 * @param recipe - Recipe data (or null/undefined while loading)
 * @param options - Hook options
 * @returns Recipe context controls and state
 *
 * @example
 * ```tsx
 * const {
 *   context,
 *   updateStep,
 *   scaleRecipe,
 *   scaledMultiplier,
 *   currentServings,
 * } = useRecipeContext(recipe, {
 *   initialStep: currentStep,
 *   onContextChange: (ctx) => gemini.updateSystemInstruction(ctx.systemPrompt),
 * });
 *
 * // Navigate steps
 * updateStep(nextStep);
 *
 * // Scale recipe
 * scaleRecipe(2); // Double
 * scaleToServings(4); // Scale to 4 servings
 * ```
 */
export function useRecipeContext(
  recipe: RecipeData | null | undefined,
  options: UseRecipeContextOptions = {}
): UseRecipeContextReturn {
  const { initialStep = 0, initialMultiplier = 1, onContextChange } = options;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [scaledMultiplier, setScaledMultiplier] = useState(initialMultiplier);

  // Track previous context for change detection
  const previousContextRef = useRef<RecipeContext | null>(null);
  const onContextChangeRef = useRef(onContextChange);

  // Keep callback ref updated
  useEffect(() => {
    onContextChangeRef.current = onContextChange;
  }, [onContextChange]);

  // Sync step with external changes (e.g., swipe navigation)
  useEffect(() => {
    if (initialStep !== currentStep) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  /**
   * Build the recipe context
   * Memoized to prevent unnecessary recalculation
   */
  const context = useMemo((): RecipeContext | null => {
    if (!recipe) {
      return null;
    }

    return buildRecipeContext(recipe, {
      currentStep,
      scaleMultiplier: scaledMultiplier,
    });
  }, [recipe, currentStep, scaledMultiplier]);

  // Notify when context changes
  useEffect(() => {
    if (context && context !== previousContextRef.current) {
      previousContextRef.current = context;
      onContextChangeRef.current?.(context);
    }
  }, [context]);

  /**
   * System prompt for direct use
   */
  const systemPrompt = context?.systemPrompt ?? null;

  /**
   * Current scaled servings
   */
  const currentServings = useMemo(() => {
    if (!recipe) return 0;
    return Math.round(recipe.servings * scaledMultiplier);
  }, [recipe, scaledMultiplier]);

  /**
   * Total number of steps
   */
  const totalSteps = recipe?.instructions.length ?? 0;

  /**
   * Update current step
   */
  const updateStep = useCallback(
    (step: number): void => {
      // Clamp to valid range
      const clampedStep = Math.max(0, Math.min(step, totalSteps - 1));
      setCurrentStep(clampedStep);
    },
    [totalSteps]
  );

  /**
   * Scale the recipe by a multiplier
   */
  const scaleRecipe = useCallback((multiplier: number): void => {
    // Clamp to reasonable range (0.25x to 10x)
    const clampedMultiplier = Math.max(0.25, Math.min(multiplier, 10));
    setScaledMultiplier(clampedMultiplier);
  }, []);

  /**
   * Scale the recipe to target servings
   */
  const scaleToServings = useCallback(
    (servings: number): void => {
      if (!recipe || recipe.servings <= 0) {
        return;
      }

      const multiplier = calculateScaleMultiplier(recipe.servings, servings);
      scaleRecipe(multiplier);
    },
    [recipe, scaleRecipe]
  );

  /**
   * Reset scaling to original
   */
  const resetScaling = useCallback((): void => {
    setScaledMultiplier(1);
  }, []);

  /**
   * Get a scaled ingredient by name
   */
  const getIngredient = useCallback(
    (query: string): ScaledIngredient | null => {
      if (!recipe) {
        return null;
      }

      return getScaledIngredient(recipe, query, scaledMultiplier);
    },
    [recipe, scaledMultiplier]
  );

  return {
    context,
    systemPrompt,
    updateStep,
    scaleRecipe,
    scaleToServings,
    resetScaling,
    getIngredient,
    scaledMultiplier,
    currentServings,
    currentStep,
    totalSteps,
    isLoaded: recipe !== null && recipe !== undefined,
  };
}

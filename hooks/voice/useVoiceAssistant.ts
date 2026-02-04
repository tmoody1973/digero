/**
 * useVoiceAssistant Hook
 *
 * Unified hook that composes all voice hooks for the cook-mode experience.
 * Handles the complete voice assistant lifecycle including connection,
 * state management, and command execution.
 */

import { useCallback, useEffect, useRef, useMemo } from "react";
import { useAudioConnection } from "./useAudioConnection";
import { useVoiceAssistantState } from "./useVoiceAssistantState";
import { useRecipeContext } from "./useRecipeContext";
import { useTimerVoiceControl, TimerState, TimerVoiceCallbacks } from "./useTimerVoiceControl";
import { useNavigationVoiceControl, NavigationState, NavigationVoiceCallbacks } from "./useNavigationVoiceControl";
import { useScalingVoiceControl, ScalingState, ScalingVoiceCallbacks } from "./useScalingVoiceControl";
import { useAudioPermissions } from "./useAudioPermissions";
import type { RecipeData } from "@/lib/voice/recipeContext";
import type { VoiceAssistantState, VoiceAssistantAction } from "@/types/voice";

// =============================================================================
// Types
// =============================================================================

/**
 * Ingredient format from Convex recipe
 */
export interface ConvexIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

/**
 * Recipe data from cook-mode (accepts Convex format)
 */
export interface VoiceAssistantRecipe {
  /** Recipe ID */
  id: string;
  /** Recipe title */
  title: string;
  /** Recipe ingredients array (can be string[] or ConvexIngredient[]) */
  ingredients: string[] | ConvexIngredient[];
  /** Recipe instructions array */
  instructions: string[];
  /** Base servings */
  servings: number;
  /** Prep time in minutes */
  prepTime?: number;
  /** Cook time in minutes */
  cookTime?: number;
}

/**
 * Timer callbacks and state from cook-mode
 */
export interface VoiceAssistantTimerConfig {
  /** Start a timer with duration in seconds */
  handleStartTimer: (seconds: number) => void;
  /** Dismiss the active timer */
  handleDismissTimer: () => void;
  /** Whether a timer is currently active */
  hasActiveTimer: boolean;
  /** Remaining seconds on the timer (if available) */
  remainingSeconds?: number | null;
  /** Whether the timer is running */
  isRunning?: boolean;
}

/**
 * Navigation callbacks and state from cook-mode
 */
export interface VoiceAssistantNavigationConfig {
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
}

/**
 * Options for the useVoiceAssistant hook
 */
export interface UseVoiceAssistantOptions {
  /** Recipe data for context */
  recipe: VoiceAssistantRecipe | null | undefined;
  /** Timer configuration */
  timer: VoiceAssistantTimerConfig;
  /** Navigation configuration */
  navigation: VoiceAssistantNavigationConfig;
  /** Whether to auto-connect on mount (default: false) */
  autoConnect?: boolean;
  /** Backend WebSocket URL (optional - uses default if not provided) */
  backendUrl?: string;
  /** Callback when connection status changes */
  onConnectionChange?: (isConnected: boolean) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

/**
 * Return type for useVoiceAssistant hook
 */
export interface UseVoiceAssistantReturn {
  // Connection
  /** Connect to the voice assistant */
  connect: () => Promise<void>;
  /** Disconnect from the voice assistant */
  disconnect: () => Promise<void>;
  /** Whether connected to the backend */
  isConnected: boolean;

  // State
  /** Current voice assistant state */
  state: VoiceAssistantState;
  /** Transition the voice state */
  transition: (action: VoiceAssistantAction) => boolean;
  /** Reset to idle state */
  resetState: () => void;
  /** Any error that occurred */
  error: string | null;

  // State checks
  /** Whether the assistant is listening */
  isListening: boolean;
  /** Whether the assistant is processing */
  isProcessing: boolean;
  /** Whether the assistant is speaking */
  isSpeaking: boolean;
  /** Whether the assistant is idle */
  isIdle: boolean;
  /** Whether the assistant is in an active state */
  isActive: boolean;

  // Push-to-talk handlers
  /** Handler for when push-to-talk button is pressed */
  onPressIn: () => void;
  /** Handler for when push-to-talk button is released */
  onPressOut: () => void;

  // Status
  /** Current status message */
  status: string;
  /** Audio input level (0-1) */
  audioLevel: number;

  // Permissions
  /** Whether microphone permission is granted */
  hasPermission: boolean;
  /** Whether permission is denied (needs settings) */
  isPermissionDenied: boolean;
  /** Request microphone permission */
  requestPermission: () => Promise<void>;

  // Recipe context
  /** Current scale multiplier */
  scaledMultiplier: number;
  /** Current scaled servings */
  currentServings: number;
  /** Scale the recipe */
  scaleRecipe: (multiplier: number) => void;
  /** Reset scaling to original */
  resetScaling: () => void;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert ConvexIngredient array to string array for RecipeData
 */
function formatIngredientsForContext(
  ingredients: string[] | ConvexIngredient[]
): string[] {
  return ingredients.map((ing) => {
    if (typeof ing === "string") {
      return ing;
    }
    // Format as "quantity unit name"
    const parts: string[] = [];
    if (ing.quantity && ing.quantity > 0) {
      parts.push(ing.quantity.toString());
    }
    if (ing.unit) {
      parts.push(ing.unit);
    }
    parts.push(ing.name);
    return parts.join(" ");
  });
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Unified hook for voice assistant functionality in cook-mode
 *
 * Composes all voice hooks and provides a single interface for:
 * - Audio connection and streaming
 * - Voice state management
 * - Timer, navigation, and scaling voice controls
 * - Push-to-talk interaction
 * - Permission handling
 *
 * @param options - Configuration including recipe, timer, and navigation
 * @returns Complete voice assistant interface
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   isConnected,
 *   connect,
 *   disconnect,
 *   onPressIn,
 *   onPressOut,
 * } = useVoiceAssistant({
 *   recipe: {
 *     id: recipe._id,
 *     title: recipe.title,
 *     ingredients: recipe.ingredients,
 *     instructions: recipe.instructions,
 *     servings: recipe.servings ?? 4,
 *   },
 *   timer: {
 *     handleStartTimer,
 *     handleDismissTimer,
 *     hasActiveTimer: !!activeTimer,
 *   },
 *   navigation: {
 *     goToStep,
 *     goToPrevious,
 *     goToNext,
 *     currentStep,
 *     totalSteps: recipe.instructions.length,
 *   },
 * });
 *
 * // Use with PushToTalkButton
 * <PushToTalkButton
 *   state={state}
 *   onPressIn={onPressIn}
 *   onPressOut={onPressOut}
 * />
 * ```
 */
export function useVoiceAssistant(
  options: UseVoiceAssistantOptions
): UseVoiceAssistantReturn {
  const {
    recipe,
    timer,
    navigation,
    autoConnect = false,
    backendUrl,
    onConnectionChange,
    onError,
  } = options;

  // Keep callback refs stable
  const onConnectionChangeRef = useRef(onConnectionChange);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onConnectionChangeRef.current = onConnectionChange;
    onErrorRef.current = onError;
  }, [onConnectionChange, onError]);

  // Audio permissions
  const {
    isGranted: hasPermission,
    isDenied: isPermissionDenied,
    requestPermission: requestAudioPermission,
  } = useAudioPermissions();

  // Voice assistant state machine
  const {
    state: voiceState,
    error: stateError,
    transition,
    reset: resetState,
  } = useVoiceAssistantState();

  // Convert recipe to RecipeData format for useRecipeContext
  const recipeData: RecipeData | null = useMemo(() => {
    if (!recipe) return null;
    return {
      id: recipe.id,
      title: recipe.title,
      ingredients: formatIngredientsForContext(recipe.ingredients),
      instructions: recipe.instructions,
      servings: recipe.servings,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
    };
  }, [recipe]);

  // Recipe context for AI
  const {
    systemPrompt,
    updateStep,
    scaleRecipe,
    scaleToServings,
    resetScaling,
    getIngredient,
    scaledMultiplier,
    currentServings,
  } = useRecipeContext(recipeData, {
    initialStep: navigation.currentStep,
  });

  // Update recipe context when step changes
  useEffect(() => {
    updateStep(navigation.currentStep);
  }, [navigation.currentStep, updateStep]);

  // Audio connection to backend
  const {
    connect: connectAudio,
    disconnect: disconnectAudio,
    isConnected,
    isSpeaking: audioIsSpeaking,
    isListening: audioIsListening,
    status,
    audioLevel,
    error: connectionError,
  } = useAudioConnection({
    backendUrl,
    systemInstruction: systemPrompt ?? undefined,
    transition,
    onTurnComplete: () => {
      transition({ type: "FINISH_SPEAKING" });
    },
    onInterrupted: () => {
      transition({ type: "FINISH_SPEAKING" });
    },
  });

  // Timer voice control
  const timerState: TimerState = useMemo(() => ({
    hasActiveTimer: timer.hasActiveTimer,
    isRunning: timer.isRunning ?? true,
    remainingSeconds: timer.remainingSeconds ?? null,
    initialSeconds: timer.remainingSeconds ?? null,
  }), [timer.hasActiveTimer, timer.isRunning, timer.remainingSeconds]);

  const timerCallbacks: TimerVoiceCallbacks = useMemo(() => ({
    handleStartTimer: timer.handleStartTimer,
    handleDismissTimer: timer.handleDismissTimer,
  }), [timer.handleStartTimer, timer.handleDismissTimer]);

  useTimerVoiceControl({
    timerState,
    callbacks: timerCallbacks,
  });

  // Navigation voice control
  const navigationState: NavigationState = useMemo(() => ({
    currentStep: navigation.currentStep,
    totalSteps: navigation.totalSteps,
    instructions: recipe?.instructions ?? [],
  }), [navigation.currentStep, navigation.totalSteps, recipe?.instructions]);

  const navigationCallbacks: NavigationVoiceCallbacks = useMemo(() => ({
    goToStep: navigation.goToStep,
    goToPrevious: navigation.goToPrevious,
    goToNext: navigation.goToNext,
  }), [navigation.goToStep, navigation.goToPrevious, navigation.goToNext]);

  useNavigationVoiceControl({
    navigationState,
    callbacks: navigationCallbacks,
  });

  // Scaling voice control
  const scalingState: ScalingState = useMemo(() => ({
    scaledMultiplier,
    baseServings: recipe?.servings ?? 0,
    currentServings,
  }), [scaledMultiplier, recipe?.servings, currentServings]);

  const scalingCallbacks: ScalingVoiceCallbacks = useMemo(() => ({
    scaleRecipe,
    scaleToServings,
    resetScaling,
  }), [scaleRecipe, scaleToServings, resetScaling]);

  useScalingVoiceControl({
    recipe: recipeData,
    scalingState,
    callbacks: scalingCallbacks,
  });

  // Track connection status changes
  useEffect(() => {
    onConnectionChangeRef.current?.(isConnected);
  }, [isConnected]);

  // Track errors
  const error = connectionError ?? stateError;
  useEffect(() => {
    if (error) {
      onErrorRef.current?.(error);
    }
  }, [error]);

  // Connect handler with permission check
  const connect = useCallback(async (): Promise<void> => {
    if (!hasPermission) {
      const status = await requestAudioPermission();
      if (status !== "granted") {
        transition({ type: "SET_ERROR", error: "Microphone permission required" });
        return;
      }
    }
    await connectAudio();
  }, [hasPermission, requestAudioPermission, connectAudio, transition]);

  // Disconnect handler
  const disconnect = useCallback(async (): Promise<void> => {
    await disconnectAudio();
    resetState();
  }, [disconnectAudio, resetState]);

  // Push-to-talk handlers
  const onPressIn = useCallback((): void => {
    if (voiceState === "idle" && isConnected) {
      transition({ type: "START_LISTENING" });
    }
  }, [voiceState, isConnected, transition]);

  const onPressOut = useCallback((): void => {
    if (voiceState === "listening") {
      transition({ type: "START_PROCESSING" });
    }
  }, [voiceState, transition]);

  // Request permission handler
  const requestPermission = useCallback(async (): Promise<void> => {
    await requestAudioPermission();
  }, [requestAudioPermission]);

  // Auto-connect on mount if requested
  useEffect(() => {
    if (autoConnect && hasPermission) {
      connect();
    }
  }, [autoConnect, hasPermission, connect]);

  // State checks
  const isIdle = voiceState === "idle";
  const isListening = voiceState === "listening";
  const isProcessing = voiceState === "processing";
  const isSpeaking = voiceState === "speaking";
  const isActive = !isIdle && voiceState !== "error";

  return {
    // Connection
    connect,
    disconnect,
    isConnected,

    // State
    state: voiceState,
    transition,
    resetState,
    error,

    // State checks
    isListening,
    isProcessing,
    isSpeaking,
    isIdle,
    isActive,

    // Push-to-talk
    onPressIn,
    onPressOut,

    // Status
    status,
    audioLevel,

    // Permissions
    hasPermission,
    isPermissionDenied,
    requestPermission,

    // Scaling
    scaledMultiplier,
    currentServings,
    scaleRecipe,
    resetScaling,
  };
}

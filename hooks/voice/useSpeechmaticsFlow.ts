// Polyfill MUST be first import for Speechmatics SDK
import "event-target-polyfill";

/**
 * useSpeechmaticsFlow Hook
 *
 * Integrates Speechmatics Flow for voice assistant functionality in cook mode.
 * Handles audio initialization, JWT authentication, bidirectional audio streaming,
 * and state management for push-to-talk interaction.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  initialize,
  playPCMData,
  toggleRecording,
  useMicrophonePermissions,
  useIsRecording,
  useExpoTwoWayAudioEventListener,
  type MicrophoneDataCallback,
} from "@speechmatics/expo-two-way-audio";
import {
  useFlow,
  useFlowEventListener,
} from "@speechmatics/flow-client-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { VoiceAssistantState } from "@/types/voice";

// =============================================================================
// Types
// =============================================================================

/**
 * Recipe data format for voice context
 */
export interface VoiceAssistantRecipe {
  id: string;
  title: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  } | string>;
  instructions: string[];
  servings: number;
}

/**
 * Options for the useSpeechmaticsFlow hook
 */
export interface UseSpeechmaticsFlowOptions {
  /** Recipe data for context */
  recipe: VoiceAssistantRecipe | null | undefined;
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback for errors */
  onError?: (error: string) => void;
}

/**
 * Return type for useSpeechmaticsFlow hook
 */
export interface UseSpeechmaticsFlowReturn {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;

  // State
  state: VoiceAssistantState;
  error: string | null;

  // Push-to-talk
  onPressIn: () => void;
  onPressOut: () => void;

  // Permissions
  hasPermission: boolean;
  isPermissionDenied: boolean;
  requestPermission: () => Promise<void>;

  // Audio initialization
  isAudioInitialized: boolean;
  isRecording: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format ingredients for template variables
 */
function formatIngredients(
  ingredients: VoiceAssistantRecipe["ingredients"]
): string {
  return ingredients
    .map((ing) => {
      if (typeof ing === "string") return ing;
      return `${ing.quantity} ${ing.unit} ${ing.name}`.trim();
    })
    .join("\n");
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for Speechmatics Flow voice assistant integration
 *
 * Provides push-to-talk voice interaction with recipe context.
 * Handles audio initialization, permissions, JWT auth, and bidirectional streaming.
 *
 * @param options - Configuration including recipe and current step
 * @returns Voice assistant controls and state
 *
 * @example
 * ```tsx
 * const {
 *   connect,
 *   disconnect,
 *   isConnected,
 *   state,
 *   onPressIn,
 *   onPressOut,
 *   hasPermission,
 *   requestPermission,
 * } = useSpeechmaticsFlow({
 *   recipe,
 *   currentStep,
 *   onError: (err) => console.error(err),
 * });
 * ```
 */
export function useSpeechmaticsFlow(
  options: UseSpeechmaticsFlowOptions
): UseSpeechmaticsFlowReturn {
  const { recipe, currentStep, onError } = options;

  // Speechmatics Flow hooks
  const { startConversation, endConversation, sendAudio, socketState } =
    useFlow();
  const isRecording = useIsRecording();

  // Microphone permissions
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Convex action for JWT
  const generateJWT = useAction(api.actions.generateSpeechmaticsJWT.generate);

  // Local state
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for callbacks and cleanup
  const onErrorRef = useRef(onError);
  const sendAudioRef = useRef(sendAudio);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs updated
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    sendAudioRef.current = sendAudio;
  }, [sendAudio]);

  // ==========================================================================
  // Audio Initialization
  // ==========================================================================

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await initialize();
        setIsAudioInitialized(true);
        console.log("[SpeechmaticsFlow] Audio initialized");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to initialize audio";
        console.error("[SpeechmaticsFlow] Audio init error:", message);
        setError(message);
        onErrorRef.current?.(message);
      }
    };

    initializeAudio();

    // Cleanup speaking timeout on unmount
    return () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // Audio Event Handlers
  // ==========================================================================

  // Handle agent audio response -> play through speaker
  useFlowEventListener("agentAudio", (audio) => {
    try {
      // Stop recording when agent starts speaking to avoid feedback
      if (isRecording) {
        toggleRecording(false);
      }

      const byteArray = new Uint8Array(audio.data.buffer);
      playPCMData(byteArray);
      setIsSpeaking(true);

      // Reset speaking state after audio chunk silence (800ms without new audio)
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 800);
    } catch (err) {
      console.error("[SpeechmaticsFlow] Error playing audio:", err);
    }
  });

  // Handle microphone data -> send to Flow
  useExpoTwoWayAudioEventListener(
    "onMicrophoneData",
    useCallback<MicrophoneDataCallback>((event) => {
      sendAudioRef.current(event.data.buffer);
    }, [])
  );

  // ==========================================================================
  // State Mapping
  // ==========================================================================

  // Map Speechmatics states to VoiceAssistantState
  const state: VoiceAssistantState = (() => {
    if (error) return "error";
    if (socketState === "connecting") return "processing";
    if (socketState === "open") {
      if (isSpeaking) return "speaking";
      if (isRecording) return "listening";
      return "idle";
    }
    return "idle";
  })();

  const isConnected = socketState === "open";
  const isConnecting = socketState === "connecting";
  const hasPermission = micPermission?.granted ?? false;
  const isPermissionDenied =
    micPermission?.status === "denied" && !micPermission?.canAskAgain;

  // ==========================================================================
  // Connection Management
  // ==========================================================================

  /**
   * Connect to Speechmatics Flow with recipe context
   */
  const connect = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      // Check permission first
      if (!hasPermission) {
        const newPermission = await requestMicPermission();
        if (!newPermission?.granted) {
          const msg = "Microphone permission required";
          setError(msg);
          onErrorRef.current?.(msg);
          return;
        }
      }

      // Get JWT from Convex
      console.log("[SpeechmaticsFlow] Fetching JWT...");
      const result = await generateJWT();

      if (!result.success || !result.jwt) {
        const msg = result.error || "Failed to get authentication token";
        setError(msg);
        onErrorRef.current?.(msg);
        return;
      }

      // Build template variables using Speechmatics' supported variables: persona, style, context
      const templateVariables: Record<string, string> = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        persona: "You are an expert cooking assistant with deep knowledge of culinary techniques, food science, and professional cooking methods. You help users cook recipes by answering questions about ingredients, cooking techniques (sautéing, braising, blanching, tempering, etc.), timing, temperatures, substitutions, and troubleshooting. You understand knife skills, heat control, emulsification, Maillard reaction, and other cooking fundamentals. Keep answers brief and clear since the user is actively cooking with messy hands.",
        style: "Be concise, friendly, and practical. Give short answers suitable for someone with messy hands in the kitchen.",
      };

      if (recipe) {
        // Build rich context with recipe details
        const recipeContext = `
The user is currently cooking: ${recipe.title}

INGREDIENTS:
${formatIngredients(recipe.ingredients)}

INSTRUCTIONS:
${recipe.instructions.map((step, i) => `Step ${i + 1}: ${step}`).join("\n")}

CURRENT PROGRESS:
- Currently on step ${currentStep + 1} of ${recipe.instructions.length}
- Current step: "${recipe.instructions[currentStep] || "Not started"}"

Answer questions about this specific recipe. If asked about the current step, refer to step ${currentStep + 1}.
`.trim();

        templateVariables.context = recipeContext;
      }

      console.log("[SpeechmaticsFlow] Starting conversation...");

      // Start conversation with Flow
      await startConversation(result.jwt, {
        config: {
          template_id: "flow-service-assistant-humphrey",
          template_variables: templateVariables,
        },
      });

      console.log("[SpeechmaticsFlow] Connected successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect";
      console.error("[SpeechmaticsFlow] Connection error:", message);
      setError(message);
      onErrorRef.current?.(message);
    }
  }, [
    hasPermission,
    requestMicPermission,
    generateJWT,
    recipe,
    currentStep,
    startConversation,
  ]);

  /**
   * Disconnect from Speechmatics Flow
   */
  const disconnect = useCallback((): void => {
    try {
      endConversation();
      setIsSpeaking(false);
      console.log("[SpeechmaticsFlow] Disconnected");
    } catch (err) {
      console.error("[SpeechmaticsFlow] Disconnect error:", err);
    }
  }, [endConversation]);

  // ==========================================================================
  // Push-to-Talk Controls
  // ==========================================================================

  /**
   * Start recording (press in)
   */
  const onPressIn = useCallback((): void => {
    if (!isConnected || !isAudioInitialized) {
      console.log("[SpeechmaticsFlow] Cannot record - not connected or audio not initialized");
      return;
    }

    try {
      toggleRecording(true);
      setIsSpeaking(false); // Stop speaking indicator when user talks
      console.log("[SpeechmaticsFlow] Recording started");
    } catch (err) {
      console.error("[SpeechmaticsFlow] Start recording error:", err);
    }
  }, [isConnected, isAudioInitialized]);

  /**
   * Stop recording (press out)
   */
  const onPressOut = useCallback((): void => {
    if (!isConnected) return;

    try {
      toggleRecording(false);
      console.log("[SpeechmaticsFlow] Recording stopped");
    } catch (err) {
      console.error("[SpeechmaticsFlow] Stop recording error:", err);
    }
  }, [isConnected]);

  // ==========================================================================
  // Permission Request
  // ==========================================================================

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<void> => {
    try {
      await requestMicPermission();
    } catch (err) {
      console.error("[SpeechmaticsFlow] Permission request error:", err);
    }
  }, [requestMicPermission]);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Connection
    connect,
    disconnect,
    isConnected,
    isConnecting,

    // State
    state,
    error,

    // Push-to-talk
    onPressIn,
    onPressOut,

    // Permissions
    hasPermission,
    isPermissionDenied,
    requestPermission,

    // Audio
    isAudioInitialized,
    isRecording,
  };
}

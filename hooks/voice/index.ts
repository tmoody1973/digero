/**
 * Voice Hooks
 *
 * Export all voice-related hooks for the cooking assistant feature.
 */

// Audio permissions
export { useAudioPermissions, openAppSettings } from "./useAudioPermissions";

// Legacy audio hooks (expo-av based)
export { useAudioRecorder } from "./useAudioRecorder";
export { useAudioPlayer } from "./useAudioPlayer";

// New streaming audio hooks (expo-audio-studio + react-native-audio-api)
export { useStreamingAudioRecorder } from "./useStreamingAudioRecorder";
export type { UseStreamingAudioRecorderReturn, StreamingAudioRecorderOptions } from "./useStreamingAudioRecorder";
export { useStreamingAudioPlayer } from "./useStreamingAudioPlayer";
export type { UseStreamingAudioPlayerReturn, StreamingAudioPlayerOptions } from "./useStreamingAudioPlayer";

// Unified audio connection (WebSocket proxy to Gemini)
export { useAudioConnection } from "./useAudioConnection";
export type { UseAudioConnectionReturn, UseAudioConnectionOptions } from "./useAudioConnection";

// Voice assistant state machine
export {
  useVoiceAssistantState,
  useVoiceAssistantStateChecks,
} from "./useVoiceAssistantState";

// Unified voice assistant hook (main integration point for cook-mode)
export { useVoiceAssistant } from "./useVoiceAssistant";
export type {
  UseVoiceAssistantReturn,
  UseVoiceAssistantOptions,
  VoiceAssistantRecipe,
  VoiceAssistantTimerConfig,
  VoiceAssistantNavigationConfig,
  ConvexIngredient,
} from "./useVoiceAssistant";

// Legacy direct Gemini connection (deprecated - use useAudioConnection instead)
export { useGeminiLive } from "./useGeminiLive";
export type { UseGeminiLiveReturn, UseGeminiLiveOptions } from "./useGeminiLive";

// Recipe context builder
export { useRecipeContext } from "./useRecipeContext";
export type { UseRecipeContextReturn, UseRecipeContextOptions } from "./useRecipeContext";

// Timer voice control
export { useTimerVoiceControl } from "./useTimerVoiceControl";
export type {
  UseTimerVoiceControlReturn,
  UseTimerVoiceControlOptions,
  TimerState,
  TimerVoiceCallbacks,
  TimerCommandResult,
} from "./useTimerVoiceControl";

// Navigation voice control
export { useNavigationVoiceControl } from "./useNavigationVoiceControl";
export type {
  UseNavigationVoiceControlReturn,
  UseNavigationVoiceControlOptions,
  NavigationState,
  NavigationVoiceCallbacks,
  NavigationCommandResult,
} from "./useNavigationVoiceControl";

// Scaling voice control
export { useScalingVoiceControl } from "./useScalingVoiceControl";
export type {
  UseScalingVoiceControlReturn,
  UseScalingVoiceControlOptions,
  ScalingState,
  ScalingVoiceCallbacks,
  ScalingCommandResult,
} from "./useScalingVoiceControl";

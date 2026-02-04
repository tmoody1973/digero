/**
 * Voice Assistant Types
 *
 * Type definitions for the voice cooking assistant feature including
 * state machine types, audio types, and voice control interfaces.
 */

// =============================================================================
// Voice Assistant State Machine
// =============================================================================

/**
 * Voice assistant states for the state machine
 */
export type VoiceAssistantState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

/**
 * Actions that can transition the voice assistant state
 */
export type VoiceAssistantAction =
  | { type: "START_LISTENING" }
  | { type: "STOP_LISTENING" }
  | { type: "START_PROCESSING" }
  | { type: "START_SPEAKING" }
  | { type: "FINISH_SPEAKING" }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

/**
 * Valid state transitions
 * Maps current state to allowed next states
 */
export const VALID_TRANSITIONS: Record<VoiceAssistantState, VoiceAssistantState[]> = {
  idle: ["listening", "error"],
  listening: ["processing", "idle", "error"],
  processing: ["speaking", "idle", "error"],
  speaking: ["idle", "listening", "error"],
  error: ["idle"],
};

/**
 * State machine context containing the current state and any error
 */
export interface VoiceAssistantStateContext {
  /** Current state of the voice assistant */
  state: VoiceAssistantState;
  /** Error message if in error state */
  error: string | null;
  /** Timestamp of last state change */
  lastTransition: number;
}

// =============================================================================
// Audio Types
// =============================================================================

/**
 * Audio permission status
 */
export type AudioPermissionStatus = "undetermined" | "granted" | "denied";

/**
 * Audio recording configuration
 */
export interface AudioRecordingConfig {
  /** Sample rate in Hz (e.g., 16000 for 16kHz) */
  sampleRate: number;
  /** Bits per sample (e.g., 16 for 16-bit) */
  bitsPerSample: number;
  /** Number of audio channels (1 for mono) */
  channels: number;
  /** Audio format/codec */
  format: "pcm" | "wav";
}

/**
 * Default recording configuration for Gemini Live API
 */
export const DEFAULT_RECORDING_CONFIG: AudioRecordingConfig = {
  sampleRate: 16000,
  bitsPerSample: 16,
  channels: 1,
  format: "pcm",
};

/**
 * Audio recording state
 */
export interface AudioRecordingState {
  /** Whether recording is currently active */
  isRecording: boolean;
  /** Duration of current recording in milliseconds */
  durationMs: number;
  /** URI of the recorded audio file */
  uri: string | null;
}

/**
 * Audio playback state
 */
export interface AudioPlaybackState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Duration of current audio in milliseconds */
  durationMs: number;
  /** Current playback position in milliseconds */
  positionMs: number;
  /** Whether playback is buffering */
  isBuffering: boolean;
}

// =============================================================================
// Voice Control Types
// =============================================================================

/**
 * Types of voice commands that can be detected
 */
export type VoiceCommandType = "timer" | "navigation" | "scaling" | "query";

/**
 * Parsed voice command result
 */
export interface ParsedVoiceCommand {
  /** Type of command detected */
  type: VoiceCommandType;
  /** Raw text of the command */
  rawText: string;
  /** Extracted parameters (varies by command type) */
  params: VoiceCommandParams;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Parameters for different command types
 */
export type VoiceCommandParams =
  | TimerCommandParams
  | NavigationCommandParams
  | ScalingCommandParams
  | QueryCommandParams;

/**
 * Timer command parameters
 */
export interface TimerCommandParams {
  type: "timer";
  action: "start" | "pause" | "resume" | "cancel" | "status";
  /** Duration in seconds (for start action) */
  durationSeconds?: number;
}

/**
 * Navigation command parameters
 */
export interface NavigationCommandParams {
  type: "navigation";
  action: "next" | "previous" | "goto" | "status";
  /** Target step number (1-indexed, for goto action) */
  stepNumber?: number;
}

/**
 * Scaling command parameters
 */
export interface ScalingCommandParams {
  type: "scaling";
  action: "scale" | "reset" | "query";
  /** Scale multiplier (e.g., 2 for double) */
  multiplier?: number;
  /** Target servings */
  targetServings?: number;
  /** Ingredient to query (for query action) */
  ingredientQuery?: string;
}

/**
 * Query command parameters (passed to Gemini)
 */
export interface QueryCommandParams {
  type: "query";
  /** The question to ask */
  question: string;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type for useAudioPermissions hook
 */
export interface UseAudioPermissionsReturn {
  /** Current permission status */
  status: AudioPermissionStatus;
  /** Whether permission is granted */
  isGranted: boolean;
  /** Whether permission is denied */
  isDenied: boolean;
  /** Request permission from the user */
  requestPermission: () => Promise<AudioPermissionStatus>;
  /** Check current permission status */
  checkPermission: () => Promise<AudioPermissionStatus>;
}

/**
 * Return type for useAudioRecorder hook
 */
export interface UseAudioRecorderReturn {
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Stop recording and return the audio URI */
  stopRecording: () => Promise<string | null>;
  /** Whether currently recording */
  isRecording: boolean;
  /** Duration of current recording in milliseconds */
  durationMs: number;
  /** URI of the last recording */
  recordingUri: string | null;
  /** Any error that occurred */
  error: string | null;
}

/**
 * Return type for useAudioPlayer hook
 */
export interface UseAudioPlayerReturn {
  /** Play audio from a URI or buffer */
  playAudio: (source: string | ArrayBuffer) => Promise<void>;
  /** Stop current playback */
  stopAudio: () => Promise<void>;
  /** Pause current playback */
  pauseAudio: () => Promise<void>;
  /** Resume paused playback */
  resumeAudio: () => Promise<void>;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is buffering */
  isBuffering: boolean;
  /** Current playback position in milliseconds */
  positionMs: number;
  /** Total duration in milliseconds */
  durationMs: number;
  /** Any error that occurred */
  error: string | null;
}

/**
 * Return type for useVoiceAssistantState hook
 */
export interface UseVoiceAssistantStateReturn {
  /** Current state of the voice assistant */
  state: VoiceAssistantState;
  /** Error message if in error state */
  error: string | null;
  /** Transition to a new state */
  transition: (action: VoiceAssistantAction) => boolean;
  /** Reset to idle state */
  reset: () => void;
  /** Check if a transition is valid */
  canTransition: (targetState: VoiceAssistantState) => boolean;
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for MicrophonePermissionModal component
 */
export interface MicrophonePermissionModalProps {
  /** Whether the modal is visible */
  isVisible: boolean;
  /** Current permission status */
  status: AudioPermissionStatus;
  /** Called when permission is requested */
  onRequestPermission: () => void;
  /** Called when modal is dismissed */
  onDismiss: () => void;
  /** Called when user wants to open settings */
  onOpenSettings?: () => void;
}

/**
 * useGeminiLive Hook
 *
 * React hook wrapper for the GeminiLiveClient, providing
 * an easy-to-use interface for voice assistant integration.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GeminiLiveClient,
  ConnectionState,
  GeminiLiveConfig,
  AudioChunk,
} from "@/lib/voice/GeminiLiveClient";
import type { VoiceAssistantAction } from "@/types/voice";

// =============================================================================
// Types
// =============================================================================

/**
 * Return type for useGeminiLive hook
 */
export interface UseGeminiLiveReturn {
  /** Connect to Gemini Live API */
  connect: () => Promise<void>;
  /** Disconnect from Gemini Live API */
  disconnect: () => void;
  /** Send audio data (base64 encoded 16-bit PCM, 16kHz) */
  sendAudio: (audioBase64: string) => void;
  /** Send text content */
  sendText: (text: string) => void;
  /** Signal end of audio stream */
  sendAudioStreamEnd: () => void;
  /** Update system instruction (requires reconnect) */
  updateSystemInstruction: (instruction: string) => Promise<void>;
  /** Whether connected to Gemini */
  isConnected: boolean;
  /** Current connection state */
  connectionState: ConnectionState;
  /** Current error if any */
  error: string | null;
}

/**
 * Configuration options for the hook
 */
export interface UseGeminiLiveOptions {
  /** System instruction for the AI */
  systemInstruction?: string;
  /** Voice configuration */
  voiceConfig?: {
    voiceName?: string;
  };
  /** Callback when audio response is received */
  onAudioResponse?: (chunk: AudioChunk) => void;
  /** Callback when text response is received */
  onTextResponse?: (text: string) => void;
  /** Callback when transcription is received */
  onTranscription?: (text: string, isInput: boolean) => void;
  /** Callback when turn is complete */
  onTurnComplete?: () => void;
  /** Callback when generation is interrupted */
  onInterrupted?: () => void;
  /** Voice assistant state transition function */
  transition?: (action: VoiceAssistantAction) => boolean;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * React hook for Gemini Live API interaction
 *
 * Provides a React-friendly interface for the GeminiLiveClient,
 * handling lifecycle, state management, and event callbacks.
 *
 * @param options - Configuration options
 * @returns Gemini Live controls and state
 *
 * @example
 * ```tsx
 * const { connect, disconnect, sendAudio, isConnected, error } = useGeminiLive({
 *   systemInstruction: recipeContext,
 *   onAudioResponse: (chunk) => playAudio(chunk),
 *   onTurnComplete: () => transition({ type: "FINISH_SPEAKING" }),
 * });
 *
 * useEffect(() => {
 *   connect();
 *   return () => disconnect();
 * }, []);
 * ```
 */
export function useGeminiLive(
  options: UseGeminiLiveOptions = {}
): UseGeminiLiveReturn {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * Get or create the client instance
   */
  const getClient = useCallback((): GeminiLiveClient => {
    if (!clientRef.current) {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not configured");
      }

      const config: GeminiLiveConfig = {
        apiKey,
        systemInstruction: optionsRef.current.systemInstruction,
        voiceConfig: optionsRef.current.voiceConfig,
      };

      clientRef.current = new GeminiLiveClient(config);

      // Set up event handlers
      clientRef.current.setEventHandlers({
        onConnectionStateChange: (state) => {
          setConnectionState(state);

          // Clear error on successful connection
          if (state === "connected") {
            setError(null);
          }
        },
        onAudioResponse: (chunk) => {
          optionsRef.current.onAudioResponse?.(chunk);

          // Trigger speaking state if transition function provided
          if (optionsRef.current.transition) {
            optionsRef.current.transition({ type: "START_SPEAKING" });
          }
        },
        onTextResponse: (text) => {
          optionsRef.current.onTextResponse?.(text);
        },
        onTranscription: (text, isInput) => {
          optionsRef.current.onTranscription?.(text, isInput);
        },
        onTurnComplete: () => {
          optionsRef.current.onTurnComplete?.();

          // Trigger finish speaking state if transition function provided
          if (optionsRef.current.transition) {
            optionsRef.current.transition({ type: "FINISH_SPEAKING" });
          }
        },
        onInterrupted: () => {
          optionsRef.current.onInterrupted?.();
        },
        onError: (err) => {
          setError(err.message);

          // Trigger error state if transition function provided
          if (optionsRef.current.transition) {
            optionsRef.current.transition({
              type: "SET_ERROR",
              error: err.message,
            });
          }
        },
      });
    }

    return clientRef.current;
  }, []);

  /**
   * Connect to Gemini Live API
   */
  const connect = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const client = getClient();
      await client.connect();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to Gemini";
      setError(message);
      throw err;
    }
  }, [getClient]);

  /**
   * Disconnect from Gemini Live API
   */
  const disconnect = useCallback((): void => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  /**
   * Send audio data to Gemini
   */
  const sendAudio = useCallback(
    (audioBase64: string): void => {
      const client = getClient();
      client.sendAudio(audioBase64);
    },
    [getClient]
  );

  /**
   * Send text content to Gemini
   */
  const sendText = useCallback(
    (text: string): void => {
      const client = getClient();
      client.sendText(text);
    },
    [getClient]
  );

  /**
   * Signal end of audio stream
   */
  const sendAudioStreamEnd = useCallback((): void => {
    const client = getClient();
    client.sendAudioStreamEnd();
  }, [getClient]);

  /**
   * Update system instruction
   */
  const updateSystemInstruction = useCallback(
    async (instruction: string): Promise<void> => {
      const client = getClient();
      await client.updateSystemInstruction(instruction);
    },
    [getClient]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    sendAudio,
    sendText,
    sendAudioStreamEnd,
    updateSystemInstruction,
    isConnected: connectionState === "connected",
    connectionState,
    error,
  };
}

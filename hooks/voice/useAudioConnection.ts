/**
 * useAudioConnection Hook
 *
 * Unified hook for bidirectional audio communication with Gemini Live API
 * via the backend WebSocket proxy. Combines streaming recording and playback.
 *
 * Architecture:
 * Mobile App <--WebSocket--> Backend Proxy <--Gemini SDK--> Gemini Live API
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Platform } from "react-native";
import { useStreamingAudioRecorder } from "./useStreamingAudioRecorder";
import { useStreamingAudioPlayer } from "./useStreamingAudioPlayer";
import type { VoiceAssistantState, VoiceAssistantAction } from "../../types/voice";

// =============================================================================
// Types
// =============================================================================

export interface UseAudioConnectionReturn {
  /** Connect to the voice assistant */
  connect: () => Promise<void>;
  /** Disconnect from the voice assistant */
  disconnect: () => Promise<void>;
  /** Whether connected to the backend */
  isConnected: boolean;
  /** Whether AI is currently speaking */
  isSpeaking: boolean;
  /** Whether user is currently speaking */
  isListening: boolean;
  /** Current status message */
  status: string;
  /** Audio input level (0-1) */
  audioLevel: number;
  /** Any error that occurred */
  error: string | null;
}

export interface UseAudioConnectionOptions {
  /** Backend WebSocket URL */
  backendUrl?: string;
  /** System instruction for Gemini (recipe context) */
  systemInstruction?: string;
  /** Voice assistant state transition function */
  transition?: (action: VoiceAssistantAction) => boolean;
  /** Callback when AI finishes speaking */
  onTurnComplete?: () => void;
  /** Callback when AI is interrupted */
  onInterrupted?: () => void;
  /** Callback when transcription is received */
  onTranscription?: (text: string) => void;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Get backend URL based on platform
 * For physical device, use your computer's IP on the same network
 */
const getDefaultBackendUrl = (): string => {
  // In development, use environment variable or localhost
  const devUrl = process.env.EXPO_PUBLIC_VOICE_PROXY_URL;
  if (devUrl) return devUrl;

  return Platform.select({
    ios: "ws://localhost:8080",
    android: "ws://10.0.2.2:8080", // Android emulator
    default: "ws://localhost:8080",
  }) as string;
};

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for bidirectional voice communication with Gemini
 *
 * Connects to a backend WebSocket proxy that handles the Gemini Live API.
 * Streams audio in real-time and plays responses as they arrive.
 *
 * @param options Configuration options
 * @returns Connection controls and state
 *
 * @example
 * ```tsx
 * const { connect, disconnect, isConnected, isSpeaking, isListening } = useAudioConnection({
 *   systemInstruction: recipeContext,
 *   onTurnComplete: () => setVoiceState('idle'),
 * });
 *
 * // Connect when cook mode starts
 * useEffect(() => {
 *   connect();
 *   return () => disconnect();
 * }, []);
 * ```
 */
export function useAudioConnection(
  options: UseAudioConnectionOptions = {}
): UseAudioConnectionReturn {
  const {
    backendUrl = getDefaultBackendUrl(),
    systemInstruction,
    transition,
    onTurnComplete,
    onInterrupted,
    onTranscription,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Ready to connect");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const isSpeakingRef = useRef(false);
  const systemInstructionRef = useRef(systemInstruction);

  // Keep refs up to date
  useEffect(() => {
    systemInstructionRef.current = systemInstruction;
  }, [systemInstruction]);

  /**
   * Handle audio chunks from recording
   */
  const handleAudioChunk = useCallback((base64Data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "audio_chunk",
          data: base64Data,
          timestamp: Date.now(),
        })
      );
    }
  }, []);

  // Streaming audio recorder
  const { startStreaming, stopStreaming, isStreaming } =
    useStreamingAudioRecorder({
      onAudioChunk: handleAudioChunk,
    });

  // Streaming audio player
  const {
    initialize: initializePlayer,
    playChunk,
    flush: flushAudio,
    stop: stopAudio,
    isPlaying,
  } = useStreamingAudioPlayer({
    onPlaybackStart: () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      transition?.({ type: "START_SPEAKING" });
    },
    onPlaybackEnd: () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      transition?.({ type: "FINISH_SPEAKING" });
    },
  });

  /**
   * Handle WebSocket messages from backend
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            console.log("[AudioConnection] Backend connected to Gemini");
            setStatus("Connected - Ready");
            break;

          case "audio_response":
            // Play audio chunk
            playChunk(data.data);
            break;

          case "transcription":
            setStatus(`Gemini: ${data.text}`);
            onTranscription?.(data.text);
            break;

          case "turn_complete":
            // Flush any remaining audio
            flushAudio();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            onTurnComplete?.();
            break;

          case "interrupted":
            console.log("[AudioConnection] Interrupted");
            stopAudio();
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            onInterrupted?.();
            break;

          case "error":
            console.error("[AudioConnection] Backend error:", data.message);
            setError(data.message);
            setStatus(`Error: ${data.message}`);
            break;

          default:
            console.log("[AudioConnection] Unknown message type:", data.type);
        }
      } catch (err) {
        console.error("[AudioConnection] Error parsing message:", err);
      }
    },
    [playChunk, flushAudio, stopAudio, onTurnComplete, onInterrupted, onTranscription]
  );

  /**
   * Connect to the voice assistant backend
   */
  const connect = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setStatus("Connecting...");

      // Initialize audio player
      await initializePlayer();

      // Create WebSocket connection
      const ws = new WebSocket(backendUrl);

      ws.onopen = () => {
        console.log("[AudioConnection] WebSocket connected");
        setIsConnected(true);
        setStatus("Connected - Initializing...");
        wsRef.current = ws;

        // Send connect message with system instruction
        ws.send(
          JSON.stringify({
            type: "connect",
            systemInstruction: systemInstructionRef.current,
          })
        );

        // Start listening
        startStreaming();
        setIsListening(true);
        setStatus("Connected - Listening...");
        transition?.({ type: "START_LISTENING" });
      };

      ws.onmessage = handleMessage;

      ws.onclose = async () => {
        console.log("[AudioConnection] WebSocket disconnected");
        setIsConnected(false);
        setIsListening(false);
        setStatus("Disconnected");
        wsRef.current = null;

        // Stop recording
        try {
          await stopStreaming();
        } catch (e) {
          console.log("[AudioConnection] Error stopping recording:", e);
        }

        // Stop playback
        stopAudio();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      };

      ws.onerror = (err) => {
        console.error("[AudioConnection] WebSocket error:", err);
        setError("Connection error");
        setStatus("Connection error");
        setIsConnected(false);
      };
    } catch (err) {
      console.error("[AudioConnection] Connect error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setStatus("Error connecting");
    }
  }, [
    backendUrl,
    initializePlayer,
    handleMessage,
    startStreaming,
    stopStreaming,
    stopAudio,
    transition,
  ]);

  /**
   * Disconnect from the voice assistant
   */
  const disconnect = useCallback(async (): Promise<void> => {
    // Stop recording
    try {
      await stopStreaming();
    } catch (e) {
      console.log("[AudioConnection] Error stopping recording:", e);
    }

    // Stop playback
    stopAudio();

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "disconnect" }));
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setStatus("Disconnected");
  }, [stopStreaming, stopAudio]);

  /**
   * Update system instruction (recipe context)
   */
  const updateSystemInstruction = useCallback(
    (instruction: string) => {
      systemInstructionRef.current = instruction;

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "update_context",
            systemInstruction: instruction,
          })
        );
      }
    },
    []
  );

  // Sync listening state
  useEffect(() => {
    setIsListening(isStreaming);
  }, [isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    isSpeaking,
    isListening,
    status,
    audioLevel,
    error,
  };
}

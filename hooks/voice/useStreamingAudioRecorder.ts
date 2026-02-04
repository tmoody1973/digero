/**
 * useStreamingAudioRecorder Hook
 *
 * Audio recording using expo-audio with chunk simulation.
 * Records audio and provides it for sending to the voice assistant.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
} from "expo-audio";

// =============================================================================
// Types
// =============================================================================

export interface UseStreamingAudioRecorderReturn {
  /** Start streaming audio recording */
  startStreaming: () => Promise<void>;
  /** Stop streaming audio recording and return audio data */
  stopStreaming: () => Promise<string | null>;
  /** Whether currently recording and streaming */
  isStreaming: boolean;
  /** Duration in milliseconds */
  durationMs: number;
  /** Any error that occurred */
  error: string | null;
}

export interface StreamingAudioRecorderOptions {
  /** Callback when an audio chunk is available (base64 encoded) */
  onAudioChunk: (base64Data: string) => void;
  /** Optional sample rate (default: 16000 for Gemini) */
  sampleRate?: number;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for audio recording with expo-audio
 *
 * Records audio and sends it as base64 when stopped.
 * This is a simpler push-to-talk implementation.
 *
 * @param options Configuration including onAudioChunk callback
 * @returns Streaming controls and state
 */
export function useStreamingAudioRecorder(
  options: StreamingAudioRecorderOptions
): UseStreamingAudioRecorderReturn {
  const { onAudioChunk } = options;

  const [isStreaming, setIsStreaming] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onAudioChunkRef = useRef(onAudioChunk);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use expo-audio recorder with speech-optimized settings
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  });

  // Keep callback ref up to date
  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
  }, [onAudioChunk]);

  /**
   * Start recording audio
   */
  const startStreaming = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      // Configure audio session for recording
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
        allowsRecording: true,
      });

      // Start recording
      recorder.record();

      setIsStreaming(true);
      setDurationMs(0);
      startTimeRef.current = Date.now();

      // Track duration
      durationIntervalRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);

      console.log("[StreamingRecorder] Started recording");
    } catch (err) {
      console.error("[StreamingRecorder] Start error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
      setIsStreaming(false);
    }
  }, [recorder]);

  /**
   * Stop recording and send the audio data
   */
  const stopStreaming = useCallback(async (): Promise<string | null> => {
    try {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop recording
      await recorder.stop();
      const uri = recorder.uri;

      setIsStreaming(false);
      console.log("[StreamingRecorder] Stopped recording, uri:", uri);

      // Read the audio file and convert to base64
      if (uri) {
        try {
          // Fetch the file and convert to base64
          const response = await fetch(uri);
          const blob = await response.blob();

          // Convert blob to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // Remove data URL prefix (e.g., "data:audio/m4a;base64,")
              const base64Data = result.split(',')[1] || result;
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Send the audio chunk
          onAudioChunkRef.current(base64);

          return base64;
        } catch (readErr) {
          console.error("[StreamingRecorder] Failed to read audio file:", readErr);
        }
      }

      return null;
    } catch (err) {
      console.error("[StreamingRecorder] Stop error:", err);
      setError(err instanceof Error ? err.message : "Failed to stop recording");
      setIsStreaming(false);
      return null;
    }
  }, [recorder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    startStreaming,
    stopStreaming,
    isStreaming,
    durationMs,
    error,
  };
}

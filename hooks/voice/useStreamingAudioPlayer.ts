/**
 * useStreamingAudioPlayer Hook
 *
 * Real-time audio playback using react-native-audio-api with BufferQueueSource.
 * Enables smooth streaming playback of audio chunks from Gemini Live API.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Platform } from "react-native";
import { AudioContext } from "react-native-audio-api";
import * as base64js from "base64-js";

// =============================================================================
// Types
// =============================================================================

export interface UseStreamingAudioPlayerReturn {
  /** Initialize the audio context */
  initialize: () => Promise<void>;
  /** Queue an audio chunk for playback (base64 encoded PCM) */
  playChunk: (base64Data: string) => void;
  /** Flush any buffered audio */
  flush: () => void;
  /** Stop playback and clear queue */
  stop: () => void;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Any error that occurred */
  error: string | null;
}

export interface StreamingAudioPlayerOptions {
  /** Sample rate of incoming audio (default: 24000 for Gemini output) */
  sampleRate?: number;
  /** Buffer threshold in bytes before flushing (default: 48000 = ~1s) */
  bufferThreshold?: number;
  /** Callback when playback starts */
  onPlaybackStart?: () => void;
  /** Callback when playback ends */
  onPlaybackEnd?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

/** Default sample rate for Gemini output audio */
const DEFAULT_SAMPLE_RATE = 24000;

/** Default buffer threshold (~1 second of audio at 24kHz 16-bit mono) */
const DEFAULT_BUFFER_THRESHOLD = 48000;

/** Maximum queue size before recreating source to prevent memory issues */
const MAX_QUEUE_SIZE = 50;

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for streaming audio playback
 *
 * Uses react-native-audio-api's BufferQueueSource for smooth, gapless
 * playback of streaming audio from Gemini Live API.
 *
 * @param options Configuration options
 * @returns Playback controls and state
 *
 * @example
 * ```tsx
 * const { initialize, playChunk, flush, stop } = useStreamingAudioPlayer({
 *   onPlaybackEnd: () => setIsSpeaking(false),
 * });
 *
 * // Initialize on mount
 * useEffect(() => { initialize(); }, []);
 *
 * // Play chunks as they arrive from WebSocket
 * ws.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   if (data.type === 'audio_response') {
 *     playChunk(data.data);
 *   }
 * };
 * ```
 */
export function useStreamingAudioPlayer(
  options: StreamingAudioPlayerOptions = {}
): UseStreamingAudioPlayerReturn {
  const {
    sampleRate = DEFAULT_SAMPLE_RATE,
    bufferThreshold = DEFAULT_BUFFER_THRESHOLD,
    onPlaybackStart,
    onPlaybackEnd,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio context and source refs
  const audioContextRef = useRef<AudioContext | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioSourceRef = useRef<any>(null);
  const isSourceStartedRef = useRef(false);

  // Buffer refs for accumulating chunks
  const pendingChunksRef = useRef<Uint8Array[]>([]);
  const pendingSizeRef = useRef(0);

  // Queue tracking for safety
  const enqueuedCountRef = useRef(0);
  const processedCountRef = useRef(0);

  // Callback refs
  const onPlaybackStartRef = useRef(onPlaybackStart);
  const onPlaybackEndRef = useRef(onPlaybackEnd);

  // Keep callback refs up to date
  useEffect(() => {
    onPlaybackStartRef.current = onPlaybackStart;
    onPlaybackEndRef.current = onPlaybackEnd;
  }, [onPlaybackStart, onPlaybackEnd]);

  /**
   * Initialize or get the audio context and source
   */
  const setupAudioContext = useCallback(async () => {
    try {
      // Create audio context if needed
      if (!audioContextRef.current) {
        console.log("[StreamingPlayer] Creating AudioContext");
        audioContextRef.current = new AudioContext({ sampleRate });
      }

      const context = audioContextRef.current;

      // Create BufferQueueSource if needed (not available on web)
      if (!audioSourceRef.current && Platform.OS !== "web") {
        console.log("[StreamingPlayer] Creating BufferQueueSource");
        // createBufferQueueSource is a custom method in react-native-audio-api
        // @ts-ignore - Method exists at runtime
        const source = context.createBufferQueueSource();
        source.connect(context.destination);

        // Track when buffers finish playing
        source.onEnded = () => {
          processedCountRef.current += 1;
          const queueSize =
            enqueuedCountRef.current - processedCountRef.current;

          if (queueSize === 0) {
            setIsPlaying(false);
            onPlaybackEndRef.current?.();
          }

          if (queueSize % 5 === 0) {
            console.log(
              `[StreamingPlayer] Buffer finished. Queue: ${queueSize}`
            );
          }
        };

        audioSourceRef.current = source;
        isSourceStartedRef.current = false;
      }
    } catch (err) {
      console.error("[StreamingPlayer] Setup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to setup audio context"
      );
    }
  }, [sampleRate]);

  /**
   * Initialize the audio player
   */
  const initialize = useCallback(async (): Promise<void> => {
    await setupAudioContext();
  }, [setupAudioContext]);

  /**
   * Flush buffered audio chunks to the queue
   */
  const flushBuffer = useCallback(() => {
    if (pendingChunksRef.current.length === 0) return;

    // Ensure context and source exist
    if (!audioContextRef.current || !audioSourceRef.current) {
      return;
    }

    try {
      const context = audioContextRef.current;
      const source = audioSourceRef.current;

      // Safety check: queue too large
      const currentQueueSize =
        enqueuedCountRef.current - processedCountRef.current;
      if (currentQueueSize > MAX_QUEUE_SIZE) {
        console.warn(
          `[StreamingPlayer] Queue too large (${currentQueueSize}), recreating source`
        );
        // Recreate source to prevent crash
        source.stop();
        source.disconnect();
        audioSourceRef.current = null;
        isSourceStartedRef.current = false;
        enqueuedCountRef.current = 0;
        processedCountRef.current = 0;
        pendingChunksRef.current = [];
        pendingSizeRef.current = 0;
        return;
      }

      // Combine all pending chunks
      const totalLength = pendingSizeRef.current;
      const combinedBuffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of pendingChunksRef.current) {
        combinedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      // Clear pending buffer
      pendingChunksRef.current = [];
      pendingSizeRef.current = 0;

      // Convert Int16 PCM to Float32
      const float32Data = new Float32Array(combinedBuffer.length / 2);
      const dataView = new DataView(combinedBuffer.buffer);

      for (let i = 0; i < float32Data.length; i++) {
        const int16 = dataView.getInt16(i * 2, true);
        float32Data[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
      }

      // Create AudioBuffer
      const audioBuffer = context.createBuffer(1, float32Data.length, sampleRate);
      audioBuffer.copyToChannel(float32Data, 0);

      // Enqueue buffer
      source.enqueueBuffer(audioBuffer);
      enqueuedCountRef.current += 1;

      console.log(
        `[StreamingPlayer] Flushed ${totalLength} bytes. Queue: ${
          enqueuedCountRef.current - processedCountRef.current
        }`
      );

      // Start source if not started
      if (!isSourceStartedRef.current) {
        source.start();
        isSourceStartedRef.current = true;
        setIsPlaying(true);
        onPlaybackStartRef.current?.();
        console.log("[StreamingPlayer] Source started");
      }
    } catch (err) {
      console.error("[StreamingPlayer] Flush error:", err);
      setError(err instanceof Error ? err.message : "Failed to flush audio");
    }
  }, [sampleRate]);

  /**
   * Queue an audio chunk for playback
   */
  const playChunk = useCallback(
    (base64Data: string): void => {
      try {
        // Ensure audio context is ready
        if (!audioContextRef.current || !audioSourceRef.current) {
          setupAudioContext();
        }

        // Resume context if suspended
        const context = audioContextRef.current;
        if (context?.state === "suspended") {
          context.resume();
        }

        // Decode base64 to bytes
        const byteArray = base64js.toByteArray(base64Data);

        // Add to pending buffer
        pendingChunksRef.current.push(byteArray);
        pendingSizeRef.current += byteArray.length;

        // Flush if threshold reached
        if (pendingSizeRef.current >= bufferThreshold) {
          flushBuffer();
        }
      } catch (err) {
        console.error("[StreamingPlayer] Play chunk error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to play audio chunk"
        );
      }
    },
    [setupAudioContext, flushBuffer, bufferThreshold]
  );

  /**
   * Flush any remaining buffered audio
   */
  const flush = useCallback((): void => {
    flushBuffer();
  }, [flushBuffer]);

  /**
   * Stop playback and clear queue
   */
  const stop = useCallback((): void => {
    try {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
        isSourceStartedRef.current = false;
      }

      // Clear buffers
      pendingChunksRef.current = [];
      pendingSizeRef.current = 0;
      enqueuedCountRef.current = 0;
      processedCountRef.current = 0;

      setIsPlaying(false);
      console.log("[StreamingPlayer] Stopped");
    } catch (err) {
      console.error("[StreamingPlayer] Stop error:", err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[StreamingPlayer] Unmounting, cleaning up");
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
          audioSourceRef.current.disconnect();
        } catch (e) {
          console.warn("[StreamingPlayer] Error stopping source:", e);
        }
        audioSourceRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.warn("[StreamingPlayer] Error closing context:", e);
        }
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    initialize,
    playChunk,
    flush,
    stop,
    isPlaying,
    error,
  };
}

/**
 * useAudioPlayer Hook
 *
 * Handles audio playback using expo-audio for playing voice assistant responses.
 * Supports playing from URIs and base64 audio data.
 */

import { useState, useCallback, useEffect } from "react";
import { useAudioPlayer as useExpoAudioPlayer, AudioModule } from "expo-audio";
import { File, Paths } from "expo-file-system";
import type { UseAudioPlayerReturn } from "@/types/voice";

/**
 * Hook for playing audio from the voice assistant
 *
 * Plays audio responses from Gemini Live API, handling both
 * URI-based and buffer-based audio sources.
 *
 * @returns Playback controls and state
 *
 * @example
 * ```tsx
 * const { playAudio, stopAudio, isPlaying } = useAudioPlayer();
 *
 * // Play audio from URI
 * await playAudio("file:///path/to/audio.wav");
 *
 * // Or from Gemini response buffer
 * await playAudio(geminiAudioBuffer);
 * ```
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isBuffering, setIsBuffering] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string | null>(null);

  const player = useExpoAudioPlayer(currentSource ?? "");

  /**
   * Configure audio session for playback
   */
  const configureAudioSession = useCallback(async (): Promise<boolean> => {
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
      });
      return true;
    } catch (err) {
      console.error("Failed to configure audio session for playback:", err);
      setError("Failed to configure audio session");
      return false;
    }
  }, []);

  /**
   * Convert ArrayBuffer to temporary file URI for playback
   */
  const bufferToFileUri = useCallback(
    async (buffer: ArrayBuffer): Promise<string> => {
      // Create a temporary file in the cache directory
      const fileName = `gemini_audio_${Date.now()}.wav`;
      const file = new File(Paths.cache, fileName);

      // Write the buffer directly to the file
      const uint8Array = new Uint8Array(buffer);
      await file.write(uint8Array);

      return file.uri;
    },
    []
  );

  /**
   * Play audio from a URI or ArrayBuffer
   */
  const playAudio = useCallback(
    async (source: string | ArrayBuffer): Promise<void> => {
      try {
        setError(null);

        // Configure audio session
        const configured = await configureAudioSession();
        if (!configured) return;

        // Get URI from source
        let uri: string;
        if (typeof source === "string") {
          uri = source;
        } else {
          uri = await bufferToFileUri(source);
        }

        // Set source and play
        setCurrentSource(uri);
        player.play();
      } catch (err) {
        console.error("Failed to play audio:", err);
        setError("Failed to play audio");
      }
    },
    [configureAudioSession, bufferToFileUri, player]
  );

  /**
   * Stop current playback
   */
  const stopAudio = useCallback(async (): Promise<void> => {
    try {
      player.pause();
      player.seekTo(0);
      setPositionMs(0);
    } catch (err) {
      console.error("Failed to stop audio:", err);
      setError("Failed to stop audio");
    }
  }, [player]);

  /**
   * Pause current playback
   */
  const pauseAudio = useCallback(async (): Promise<void> => {
    try {
      player.pause();
    } catch (err) {
      console.error("Failed to pause audio:", err);
      setError("Failed to pause audio");
    }
  }, [player]);

  /**
   * Resume paused playback
   */
  const resumeAudio = useCallback(async (): Promise<void> => {
    try {
      player.play();
    } catch (err) {
      console.error("Failed to resume audio:", err);
      setError("Failed to resume audio");
    }
  }, [player]);

  // Track position and duration
  useEffect(() => {
    setPositionMs(player.currentTime * 1000);
    setDurationMs(player.duration * 1000);
    setIsBuffering(player.buffering);
  }, [player.currentTime, player.duration, player.buffering]);

  return {
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    isPlaying: player.playing,
    isBuffering,
    positionMs,
    durationMs,
    error,
  };
}

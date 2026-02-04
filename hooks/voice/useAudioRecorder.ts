/**
 * useAudioRecorder Hook
 *
 * Handles audio recording using expo-audio with configuration optimized
 * for the Gemini Live API (16kHz, 16-bit PCM).
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  useAudioRecorder as useExpoAudioRecorder,
  AudioModule,
  RecordingOptions,
  RecordingPresets,
} from "expo-audio";
import type { UseAudioRecorderReturn } from "@/types/voice";

/**
 * Recording preset optimized for speech recognition
 * - 16kHz sample rate (Gemini Live API requirement)
 * - 16-bit PCM format
 * - Mono channel
 */
const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
};

/**
 * Hook for recording audio optimized for voice assistant use
 *
 * Configures audio for 16kHz, 16-bit PCM as required by Gemini Live API.
 * Handles recording lifecycle and provides duration tracking.
 *
 * @returns Recording controls and state
 *
 * @example
 * ```tsx
 * const { startRecording, stopRecording, isRecording, durationMs } = useAudioRecorder();
 *
 * const handlePressIn = () => startRecording();
 * const handlePressOut = async () => {
 *   const uri = await stopRecording();
 *   if (uri) sendToGemini(uri);
 * };
 * ```
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [durationMs, setDurationMs] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRecorder = useExpoAudioRecorder(RECORDING_OPTIONS);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * Configure audio session for recording
   * Uses mixWithOthers to allow background music to continue
   */
  const configureAudioSession = useCallback(async (): Promise<boolean> => {
    try {
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
      });
      return true;
    } catch (err) {
      console.error("Failed to configure audio session:", err);
      setError("Failed to configure audio session");
      return false;
    }
  }, []);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Clear any previous errors
      setError(null);

      // Configure audio session
      const configured = await configureAudioSession();
      if (!configured) return;

      // Start recording
      audioRecorder.record();

      setDurationMs(0);
      startTimeRef.current = Date.now();

      // Track duration
      durationIntervalRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Failed to start recording");
    }
  }, [configureAudioSession, audioRecorder]);

  /**
   * Stop recording and return the URI of the recorded audio
   */
  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop recording
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      setRecordingUri(uri);

      return uri;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setError("Failed to stop recording");
      return null;
    }
  }, [audioRecorder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording: audioRecorder.isRecording,
    durationMs,
    recordingUri,
    error,
  };
}

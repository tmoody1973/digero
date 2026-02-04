/**
 * useAudioPermissions Hook
 *
 * Handles microphone permission requests and status checking for the voice assistant.
 * Uses expo-audio for permission management.
 */

import { useState, useCallback, useEffect } from "react";
import * as Audio from "expo-audio";
import { Linking, Platform } from "react-native";
import type {
  AudioPermissionStatus,
  UseAudioPermissionsReturn,
} from "@/types/voice";

/**
 * Hook for managing microphone permissions
 *
 * Provides permission status checking and requesting functionality
 * following the same pattern as CameraViewfinder.tsx
 *
 * @returns Permission status and control functions
 *
 * @example
 * ```tsx
 * const { status, isGranted, requestPermission } = useAudioPermissions();
 *
 * if (!isGranted) {
 *   return <MicrophonePermissionModal onRequest={requestPermission} />;
 * }
 * ```
 */
export function useAudioPermissions(): UseAudioPermissionsReturn {
  const [permissionResponse, setPermissionResponse] =
    useState<Audio.PermissionResponse | null>(null);

  /**
   * Convert expo-audio permission response to our status type
   */
  const getStatus = useCallback((): AudioPermissionStatus => {
    if (!permissionResponse) return "undetermined";
    if (permissionResponse.granted) return "granted";
    if (permissionResponse.canAskAgain) return "undetermined";
    return "denied";
  }, [permissionResponse]);

  const status = getStatus();

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<AudioPermissionStatus> => {
    try {
      const result = await Audio.getRecordingPermissionsAsync();
      setPermissionResponse(result);
      if (result.granted) return "granted";
      if (result.canAskAgain) return "undetermined";
      return "denied";
    } catch (error) {
      console.error("Failed to check audio permission:", error);
      return "denied";
    }
  }, []);

  /**
   * Request permission from the user
   */
  const requestPermission = useCallback(async (): Promise<AudioPermissionStatus> => {
    try {
      const result = await Audio.requestRecordingPermissionsAsync();
      setPermissionResponse(result);
      if (result.granted) return "granted";
      if (result.canAskAgain) return "undetermined";
      return "denied";
    } catch (error) {
      console.error("Failed to request audio permission:", error);
      return "denied";
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    status,
    isGranted: status === "granted",
    isDenied: status === "denied",
    requestPermission,
    checkPermission,
  };
}

/**
 * Utility to open app settings
 * Useful when permission is denied and user needs to grant it manually
 */
export async function openAppSettings(): Promise<void> {
  try {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  } catch (error) {
    console.error("Failed to open app settings:", error);
  }
}

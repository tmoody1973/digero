/**
 * Microphone Permission Modal Component
 *
 * Displays a modal for requesting microphone permission for the voice assistant.
 * Follows the same pattern as CameraViewfinder.tsx permission UI.
 */

import React from "react";
import { View, Text, Pressable, Modal, Linking, Platform } from "react-native";
import { AlertCircle, Mic, Settings } from "lucide-react-native";
import type { MicrophonePermissionModalProps } from "@/types/voice";

/**
 * MicrophonePermissionModal Component
 *
 * Shows permission request UI when microphone access is needed.
 * Handles both undetermined (can request) and denied (need settings) states.
 *
 * @example
 * ```tsx
 * const { status, isGranted, requestPermission } = useAudioPermissions();
 *
 * return (
 *   <>
 *     <MicrophonePermissionModal
 *       isVisible={!isGranted && showModal}
 *       status={status}
 *       onRequestPermission={requestPermission}
 *       onDismiss={() => setShowModal(false)}
 *     />
 *     {isGranted && <VoiceAssistant />}
 *   </>
 * );
 * ```
 */
export function MicrophonePermissionModal({
  isVisible,
  status,
  onRequestPermission,
  onDismiss,
  onOpenSettings,
}: MicrophonePermissionModalProps) {
  /**
   * Open system settings for the app
   */
  const handleOpenSettings = async () => {
    if (onOpenSettings) {
      onOpenSettings();
      return;
    }

    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("app-settings:");
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error("Failed to open settings:", error);
    }
  };

  const isDenied = status === "denied";

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="w-full max-w-sm rounded-2xl bg-stone-900 p-6">
          {/* Icon */}
          <View className="mb-4 items-center">
            <View
              className={`h-16 w-16 items-center justify-center rounded-full ${
                isDenied ? "bg-red-500/20" : "bg-orange-500/20"
              }`}
            >
              {isDenied ? (
                <AlertCircle size={32} color="#ef4444" />
              ) : (
                <Mic size={32} color="#f97316" />
              )}
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-lg font-semibold text-white">
            {isDenied ? "Microphone Access Denied" : "Microphone Access Required"}
          </Text>

          {/* Description */}
          <Text className="mb-6 text-center text-stone-400">
            {isDenied
              ? "Microphone access was denied. Please enable it in Settings to use hands-free cooking assistance."
              : "Allow microphone access for hands-free cooking assistance. Ask questions, control timers, and navigate recipes with your voice."}
          </Text>

          {/* Action Buttons */}
          <View className="gap-3">
            {isDenied ? (
              // Denied state - show settings button
              <>
                <Pressable
                  onPress={handleOpenSettings}
                  className="flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 active:bg-orange-600"
                >
                  <Settings size={20} color="#fff" />
                  <Text className="font-semibold text-white">Open Settings</Text>
                </Pressable>
                <Pressable
                  onPress={onDismiss}
                  className="rounded-xl bg-stone-800 py-3 active:bg-stone-700"
                >
                  <Text className="text-center font-medium text-stone-300">
                    Maybe Later
                  </Text>
                </Pressable>
              </>
            ) : (
              // Undetermined state - show grant permission button
              <>
                <Pressable
                  onPress={onRequestPermission}
                  className="flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 active:bg-orange-600"
                >
                  <Mic size={20} color="#fff" />
                  <Text className="font-semibold text-white">Grant Permission</Text>
                </Pressable>
                <Pressable
                  onPress={onDismiss}
                  className="rounded-xl bg-stone-800 py-3 active:bg-stone-700"
                >
                  <Text className="text-center font-medium text-stone-300">
                    Not Now
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Additional info for denied state */}
          {isDenied && (
            <Text className="mt-4 text-center text-xs text-stone-500">
              Go to Settings &gt; Privacy &gt; Microphone &gt; Digero
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline Permission Request View
 *
 * Alternative to modal - shows inline permission UI within a screen.
 * Useful when permission is required to see the main content.
 */
export function MicrophonePermissionView({
  status,
  onRequestPermission,
  onOpenSettings,
}: Omit<MicrophonePermissionModalProps, "isVisible" | "onDismiss">) {
  const isDenied = status === "denied";

  const handleOpenSettings = async () => {
    if (onOpenSettings) {
      onOpenSettings();
      return;
    }

    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("app-settings:");
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error("Failed to open settings:", error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-stone-900 p-6">
      {/* Icon */}
      <View
        className={`mb-4 h-16 w-16 items-center justify-center rounded-full ${
          isDenied ? "bg-red-500/20" : "bg-orange-500/20"
        }`}
      >
        {isDenied ? (
          <AlertCircle size={32} color="#ef4444" />
        ) : (
          <Mic size={32} color="#f97316" />
        )}
      </View>

      {/* Title */}
      <Text className="mb-2 text-lg font-semibold text-white">
        {isDenied ? "Microphone Access Denied" : "Microphone Access Required"}
      </Text>

      {/* Description */}
      <Text className="mb-6 text-center text-stone-400">
        {isDenied
          ? "Please enable microphone access in Settings to use the voice assistant."
          : "Allow microphone access for hands-free cooking assistance."}
      </Text>

      {/* Action Button */}
      {isDenied ? (
        <Pressable
          onPress={handleOpenSettings}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 active:bg-orange-600"
        >
          <Settings size={20} color="#fff" />
          <Text className="font-semibold text-white">Open Settings</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onRequestPermission}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 active:bg-orange-600"
        >
          <Mic size={20} color="#fff" />
          <Text className="font-semibold text-white">Grant Permission</Text>
        </Pressable>
      )}
    </View>
  );
}

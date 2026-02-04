/**
 * Speechmatics Voice Button Component
 *
 * Self-contained voice button that manages Speechmatics Flow connection
 * and provides push-to-talk functionality for cook mode.
 */

import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Mic, MicOff, Wifi, WifiOff } from "lucide-react-native";
import { PushToTalkButton } from "./PushToTalkButton";
import { MicrophonePermissionModal } from "./MicrophonePermissionModal";
import {
  useSpeechmaticsFlow,
  type VoiceAssistantRecipe,
} from "@/hooks/voice/useSpeechmaticsFlow";

interface SpeechmaticsVoiceButtonProps {
  /** Recipe data for voice context */
  recipe: VoiceAssistantRecipe | null | undefined;
  /** Current step index (0-based) */
  currentStep: number;
}

/**
 * Voice button with integrated Speechmatics Flow connection
 *
 * Handles:
 * - Permission requests via modal
 * - Connection management (auto-connect on first press)
 * - Push-to-talk recording
 * - State display
 *
 * @example
 * ```tsx
 * <SpeechmaticsVoiceButton
 *   recipe={{ id, title, ingredients, instructions, servings }}
 *   currentStep={currentStep}
 * />
 * ```
 */
export function SpeechmaticsVoiceButton({
  recipe,
  currentStep,
}: SpeechmaticsVoiceButtonProps) {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    state,
    error,
    onPressIn,
    onPressOut,
    hasPermission,
    isPermissionDenied,
    requestPermission,
    isAudioInitialized,
    isRecording,
  } = useSpeechmaticsFlow({
    recipe,
    currentStep,
    onError: (err) => setConnectionError(err),
  });

  // Clear error after 5 seconds
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(() => setConnectionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [connectionError]);

  // Handle tap - toggle recording on/off
  const handlePress = async () => {
    // Check permission first
    if (!hasPermission) {
      if (isPermissionDenied) {
        setShowPermissionModal(true);
        return;
      }
      await requestPermission();
      return;
    }

    // Connect if not connected
    if (!isConnected && !isConnecting) {
      await connect();
      return;
    }

    // Toggle recording using SDK state
    if (isRecording) {
      onPressOut();
    } else {
      onPressIn();
    }
  };

  // Handle permission modal actions
  const handleRequestPermission = async () => {
    await requestPermission();
    setShowPermissionModal(false);
  };

  const handleDismissModal = () => {
    setShowPermissionModal(false);
  };

  // Determine button disabled state
  const isDisabled = !isAudioInitialized || isConnecting;

  return (
    <>
      {/* Connection status indicator */}
      {(isConnected || isConnecting) && (
        <View
          style={{
            position: "absolute",
            right: 16,
            bottom: 160,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
          }}
        >
          {isConnecting ? (
            <>
              <WifiOff size={14} color="#fbbf24" />
              <Text style={{ color: "#fbbf24", fontSize: 12, marginLeft: 6 }}>
                Connecting...
              </Text>
            </>
          ) : (
            <>
              <Wifi size={14} color="#22c55e" />
              <Text style={{ color: "#22c55e", fontSize: 12, marginLeft: 6 }}>
                Voice ready
              </Text>
            </>
          )}
        </View>
      )}

      {/* Error toast */}
      {connectionError && (
        <View
          style={{
            position: "absolute",
            right: 16,
            left: 16,
            bottom: 200,
            backgroundColor: "rgba(239, 68, 68, 0.9)",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 14 }}>
            {connectionError}
          </Text>
          <Pressable
            onPress={() => setConnectionError(null)}
            style={{ position: "absolute", right: 12, top: 8 }}
          >
            <Text style={{ color: "#ffffff", fontSize: 18 }}>×</Text>
          </Pressable>
        </View>
      )}

      {/* Tap-to-toggle button */}
      <PushToTalkButton
        state={isRecording ? "listening" : state}
        onPress={handlePress}
        disabled={isDisabled}
      />

      {/* Permission modal */}
      <MicrophonePermissionModal
        isVisible={showPermissionModal}
        status={isPermissionDenied ? "denied" : "undetermined"}
        onRequestPermission={handleRequestPermission}
        onDismiss={handleDismissModal}
      />
    </>
  );
}

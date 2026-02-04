/**
 * PushToTalkButton Component
 *
 * Floating action button for push-to-talk voice interaction.
 * Press and hold to record, release to send to AI.
 */

import { useCallback } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { Mic, MicOff, Loader } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { VoiceAssistantState } from "@/types/voice";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PushToTalkButtonProps {
  /** Current voice assistant state */
  state: VoiceAssistantState;
  /** Called when user presses down on button */
  onPressIn: () => void;
  /** Called when user releases button */
  onPressOut: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * PushToTalkButton Component
 *
 * 56x56dp floating action button positioned in bottom-right corner.
 * Uses orange-500 color with microphone icon.
 *
 * States:
 * - idle: Normal orange button with mic icon
 * - listening: Pressed state with scale animation and color change
 * - processing/speaking: Disabled state with loader icon
 *
 * @example
 * ```tsx
 * <PushToTalkButton
 *   state={voiceState}
 *   onPressIn={() => transition({ type: "START_LISTENING" })}
 *   onPressOut={() => transition({ type: "STOP_LISTENING" })}
 * />
 * ```
 */
export function PushToTalkButton({
  state,
  onPressIn,
  onPressOut,
  disabled = false,
}: PushToTalkButtonProps) {
  const insets = useSafeAreaInsets();

  // Animation values
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);

  // Determine if button should be disabled
  const isDisabled = disabled || state === "processing" || state === "speaking";
  const isListening = state === "listening";

  // Handle press in
  const handlePressIn = useCallback(() => {
    if (isDisabled) return;

    scale.value = withSpring(1.15, { damping: 15, stiffness: 300 });
    colorProgress.value = withSpring(1, { damping: 15, stiffness: 300 });
    onPressIn();
  }, [isDisabled, onPressIn, scale, colorProgress]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    if (isDisabled) return;

    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    colorProgress.value = withSpring(0, { damping: 15, stiffness: 300 });
    onPressOut();
  }, [isDisabled, onPressOut, scale, colorProgress]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ["#f97316", "#ea580c"] // orange-500 to orange-600
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  // Render icon based on state
  const renderIcon = () => {
    if (state === "processing") {
      return <Loader size={24} color="#ffffff" className="animate-spin" />;
    }

    if (isDisabled && state !== "listening") {
      return <MicOff size={24} color="#ffffff" />;
    }

    return <Mic size={24} color="#ffffff" />;
  };

  return (
    <View
      style={{
        position: "absolute",
        right: 16,
        bottom: Math.max(insets.bottom, 16) + 80, // Above navigation buttons
      }}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          },
          animatedStyle,
          isDisabled && { opacity: 0.5 },
        ]}
        accessibilityLabel={
          isListening
            ? "Recording voice, release to send"
            : "Hold to speak to cooking assistant"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {renderIcon()}
      </AnimatedPressable>

      {/* Listening indicator ring */}
      {isListening && (
        <Animated.View
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 32,
            borderWidth: 3,
            borderColor: "#f97316",
            opacity: 0.5,
          }}
        />
      )}
    </View>
  );
}

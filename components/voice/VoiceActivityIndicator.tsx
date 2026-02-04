/**
 * VoiceActivityIndicator Component
 *
 * Small visual indicator showing the current voice assistant state.
 * Designed for minimal visual footprint in cook-mode header.
 */

import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import type { VoiceAssistantState } from "@/types/voice";

interface VoiceActivityIndicatorProps {
  /** Current voice assistant state */
  state: VoiceAssistantState;
  /** Optional size override (default: 12) */
  size?: number;
}

/**
 * VoiceActivityIndicator Component
 *
 * 12x12dp dot indicator with state-based colors and animations.
 *
 * States:
 * - idle: dim gray (stone-600)
 * - listening: pulsing orange (orange-500)
 * - processing: animated spinner (orange-500)
 * - speaking: solid orange (orange-500)
 * - error: red (red-500)
 *
 * @example
 * ```tsx
 * <VoiceActivityIndicator state={voiceState} />
 * ```
 */
export function VoiceActivityIndicator({
  state,
  size = 12,
}: VoiceActivityIndicatorProps) {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Set up pulse animation for listening state
  useEffect(() => {
    if (state === "listening") {
      // Pulse animation: scale 1.0 -> 1.3 -> 1.0
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        false
      );
      // Opacity pulse
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      // Reset animations
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [state, scale, opacity]);

  // Animated styles for the dot
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Get color based on state
  const getBackgroundColor = (): string => {
    switch (state) {
      case "idle":
        return "#57534e"; // stone-600
      case "listening":
        return "#f97316"; // orange-500
      case "processing":
        return "#f97316"; // orange-500
      case "speaking":
        return "#f97316"; // orange-500
      case "error":
        return "#ef4444"; // red-500
      default:
        return "#57534e"; // stone-600
    }
  };

  // Render processing spinner
  if (state === "processing") {
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" color="#f97316" />
      </View>
    );
  }

  // Render dot indicator
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(),
        },
        animatedStyle,
      ]}
      accessibilityLabel={`Voice assistant ${state}`}
      accessibilityRole="text"
    />
  );
}

/**
 * Compact version for very tight spaces
 */
export function VoiceActivityDot({
  state,
}: {
  state: VoiceAssistantState;
}) {
  return <VoiceActivityIndicator state={state} size={8} />;
}

/**
 * OfflineFallbackInput Component
 *
 * Text input for typed commands when voice assistant is offline.
 * Provides fallback interaction for basic commands.
 */

import { useState, useCallback } from "react";
import { View, TextInput, Pressable, Text, Keyboard } from "react-native";
import { Send, WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseOfflineCommand, type OfflineCommandResult } from "@/lib/voice/offlineCommands";

interface OfflineFallbackInputProps {
  /** Whether the component is visible */
  isVisible: boolean;
  /** Called when a command is submitted */
  onCommand: (result: OfflineCommandResult) => void;
  /** Optional placeholder text */
  placeholder?: string;
}

/**
 * OfflineFallbackInput Component
 *
 * Shows when voice assistant is offline. Allows typed commands
 * for basic navigation and timer control.
 *
 * Supported commands:
 * - "next" / "previous" - step navigation
 * - "start timer X" - start a timer
 * - "stop timer" - cancel timer
 *
 * @example
 * ```tsx
 * <OfflineFallbackInput
 *   isVisible={isOffline}
 *   onCommand={(result) => {
 *     if (result.type === "navigation") {
 *       handleNavigation(result.action);
 *     }
 *   }}
 * />
 * ```
 */
export function OfflineFallbackInput({
  isVisible,
  onCommand,
  placeholder = 'Type a command (e.g., "next", "start timer 5 min")',
}: OfflineFallbackInputProps) {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);

  // Handle submit
  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const result = parseOfflineCommand(trimmed);

    if (result.type === "unknown") {
      setLastError("Command not recognized. Try: next, previous, start timer 5 min, stop timer");
      return;
    }

    // Clear input and error
    setInputValue("");
    setLastError(null);
    Keyboard.dismiss();

    // Execute command
    onCommand(result);
  }, [inputValue, onCommand]);

  // Handle text change
  const handleChangeText = useCallback((text: string) => {
    setInputValue(text);
    // Clear error when user types
    if (lastError) {
      setLastError(null);
    }
  }, [lastError]);

  if (!isVisible) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Math.max(insets.bottom, 16),
        backgroundColor: "#1c1917", // stone-900
        borderTopWidth: 1,
        borderTopColor: "#44403c", // stone-700
      }}
    >
      {/* Offline indicator */}
      <View className="flex-row items-center justify-center gap-2 py-2">
        <WifiOff size={14} color="#a8a29e" />
        <Text className="text-xs text-stone-400">
          Voice assistant offline - type commands instead
        </Text>
      </View>

      {/* Input row */}
      <View className="flex-row items-center gap-2 px-4 pb-2">
        <View className="flex-1 flex-row items-center rounded-xl bg-stone-800 px-3">
          <TextInput
            value={inputValue}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor="#78716c"
            className="flex-1 py-3 text-sm text-white"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!inputValue.trim()}
          className={`h-11 w-11 items-center justify-center rounded-xl ${
            inputValue.trim()
              ? "bg-orange-500 active:bg-orange-600"
              : "bg-stone-700"
          }`}
          accessibilityLabel="Send command"
          accessibilityRole="button"
          accessibilityState={{ disabled: !inputValue.trim() }}
        >
          <Send
            size={18}
            color={inputValue.trim() ? "#ffffff" : "#78716c"}
          />
        </Pressable>
      </View>

      {/* Error message */}
      {lastError && (
        <View className="px-4 pb-2">
          <Text className="text-xs text-red-400">{lastError}</Text>
        </View>
      )}

      {/* Command hints */}
      <View className="flex-row flex-wrap gap-2 px-4">
        <CommandHint text="next" onPress={() => setInputValue("next")} />
        <CommandHint text="previous" onPress={() => setInputValue("previous")} />
        <CommandHint text="start timer 5 min" onPress={() => setInputValue("start timer 5 min")} />
        <CommandHint text="stop timer" onPress={() => setInputValue("stop timer")} />
      </View>
    </View>
  );
}

/**
 * Quick command hint button
 */
function CommandHint({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg bg-stone-800 px-2 py-1 active:bg-stone-700"
    >
      <Text className="text-xs text-stone-400">{text}</Text>
    </Pressable>
  );
}

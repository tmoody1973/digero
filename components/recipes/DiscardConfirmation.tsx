/**
 * Discard Confirmation Component
 *
 * Modal dialog for confirming form discard when data has been entered.
 */

import { View, Text, Pressable, Modal } from "react-native";

interface DiscardConfirmationProps {
  visible: boolean;
  onCancel: () => void;
  onDiscard: () => void;
}

export function DiscardConfirmation({
  visible,
  onCancel,
  onDiscard,
}: DiscardConfirmationProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white dark:bg-stone-800 rounded-2xl p-6 w-full max-w-sm">
          {/* Title */}
          <Text className="text-xl font-bold text-stone-900 dark:text-stone-100 text-center mb-2">
            Discard Changes?
          </Text>

          {/* Message */}
          <Text className="text-base text-stone-600 dark:text-stone-400 text-center mb-6">
            You have unsaved changes. Are you sure you want to discard them?
          </Text>

          {/* Buttons */}
          <View className="gap-3">
            {/* Discard Button */}
            <Pressable
              onPress={onDiscard}
              className="rounded-xl py-3.5 items-center bg-red-500 active:bg-red-600"
            >
              <Text className="text-white font-semibold text-base">
                Discard Changes
              </Text>
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={onCancel}
              className="rounded-xl py-3.5 items-center bg-stone-100 dark:bg-stone-700 active:bg-stone-200 dark:active:bg-stone-600"
            >
              <Text className="text-stone-700 dark:text-stone-300 font-semibold text-base">
                Keep Editing
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * DeleteConfirmationDialog Component
 *
 * Confirmation dialog for deleting a cookbook.
 * Clarifies that recipes won't be deleted, only the collection.
 */

import { View, Text, Pressable, Modal } from "react-native";
import { AlertTriangle } from "lucide-react-native";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  cookbookName: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  cookbookName,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-stone-800">
          {/* Header */}
          <View className="items-center px-6 pt-6">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </View>
            <Text className="text-center text-lg font-semibold text-stone-900 dark:text-white">
              Delete Cookbook?
            </Text>
          </View>

          {/* Content */}
          <View className="px-6 py-4">
            <Text className="text-center text-stone-600 dark:text-stone-400">
              Are you sure you want to delete{" "}
              <Text className="font-semibold text-stone-900 dark:text-white">
                "{cookbookName}"
              </Text>
              ?
            </Text>
            <Text className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
              This won't delete your recipes, only the cookbook collection.
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 border-t border-stone-200 p-4 dark:border-stone-700">
            <Pressable
              onPress={onCancel}
              disabled={isDeleting}
              className="flex-1 items-center rounded-xl border border-stone-200 py-3 active:bg-stone-50 dark:border-stone-700 dark:active:bg-stone-700"
            >
              <Text className="font-semibold text-stone-600 dark:text-stone-400">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={isDeleting}
              className={`flex-1 items-center rounded-xl py-3 ${
                isDeleting
                  ? "bg-stone-200 dark:bg-stone-700"
                  : "bg-red-500 active:bg-red-600"
              }`}
            >
              <Text
                className={`font-semibold ${
                  isDeleting ? "text-stone-400" : "text-white"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

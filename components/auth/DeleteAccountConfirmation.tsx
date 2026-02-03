/**
 * Delete Account Confirmation Component
 *
 * Modal dialog for confirming account deletion.
 * Warns user about permanent data loss.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";

interface DeleteAccountConfirmationProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAccountConfirmation({
  visible,
  onCancel,
  onConfirm,
}: DeleteAccountConfirmationProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!clerkUser) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Delete user from Clerk (this will trigger webhook to delete from Convex)
      await clerkUser.delete();

      // Sign out to clear local session
      await signOut();

      // Navigate to sign-in
      router.replace("/(auth)/sign-in");

      onConfirm();
    } catch (err) {
      console.error("Failed to delete account:", err);
      setError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [clerkUser, signOut, router, onConfirm]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white dark:bg-stone-800 rounded-2xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center">
              <Text className="text-2xl">!</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-stone-900 dark:text-stone-100 text-center mb-2">
            Delete Account?
          </Text>

          {/* Warning Message */}
          <Text className="text-base text-stone-600 dark:text-stone-400 text-center mb-6">
            This action is permanent and cannot be undone. All your recipes,
            cookbooks, meal plans, and shopping lists will be deleted.
          </Text>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-center text-sm">
                {error}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View className="gap-3">
            {/* Delete Button */}
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className={`rounded-xl py-3.5 items-center ${
                isDeleting
                  ? "bg-red-300 dark:bg-red-800"
                  : "bg-red-500 active:bg-red-600"
              }`}
            >
              {isDeleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Delete My Account
                </Text>
              )}
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={onCancel}
              disabled={isDeleting}
              className="rounded-xl py-3.5 items-center bg-stone-100 dark:bg-stone-700 active:bg-stone-200 dark:active:bg-stone-600"
            >
              <Text className="text-stone-700 dark:text-stone-300 font-semibold text-base">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

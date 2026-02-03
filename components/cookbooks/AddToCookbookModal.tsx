/**
 * AddToCookbookModal Component
 *
 * Modal for adding a recipe to one or more cookbooks.
 * Displays all user cookbooks with checkboxes for multi-select.
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { X, BookPlus, Check, Plus } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CreateCookbookModal } from "./CreateCookbookModal";

interface AddToCookbookModalProps {
  isOpen: boolean;
  recipeId: Id<"recipes"> | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddToCookbookModal({
  isOpen,
  recipeId,
  onClose,
  onSuccess,
}: AddToCookbookModalProps) {
  const [selectedCookbooks, setSelectedCookbooks] = useState<Set<Id<"cookbooks">>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user cookbooks (excluding built-in)
  const cookbooks = useQuery(api.cookbooks.listCookbooks);

  // Fetch cookbooks that already contain this recipe
  const existingCookbookIds = useQuery(
    api.cookbooks.getCookbooksForRecipe,
    recipeId ? { recipeId } : "skip"
  );

  const addRecipeToCookbooks = useMutation(api.cookbooks.addRecipeToCookbooks);

  // Filter to only show user-created cookbooks
  const userCookbooks = cookbooks?.filter((c) => !c.isBuiltIn) ?? [];

  // Initialize selection with existing memberships
  useEffect(() => {
    if (existingCookbookIds) {
      setSelectedCookbooks(new Set(existingCookbookIds));
    }
  }, [existingCookbookIds]);

  const toggleCookbook = (cookbookId: Id<"cookbooks">) => {
    setSelectedCookbooks((prev) => {
      const next = new Set(prev);
      if (next.has(cookbookId)) {
        next.delete(cookbookId);
      } else {
        next.add(cookbookId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!recipeId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addRecipeToCookbooks({
        recipeId,
        cookbookIds: Array.from(selectedCookbooks),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update cookbook memberships"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSuccess = (newCookbookId: string) => {
    setSelectedCookbooks((prev) => {
      const next = new Set(prev);
      next.add(newCookbookId as Id<"cookbooks">);
      return next;
    });
    setShowCreateModal(false);
  };

  const handleClose = () => {
    setSelectedCookbooks(new Set(existingCookbookIds ?? []));
    setError(null);
    onClose();
  };

  return (
    <>
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-white dark:bg-stone-900">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
            <View className="flex-row items-center gap-2">
              <BookPlus className="h-5 w-5 text-orange-500" />
              <Text className="text-lg font-semibold text-stone-900 dark:text-white">
                Add to Cookbook
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
            >
              <X className="h-5 w-5 text-stone-500" />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-4 py-4">
            <View className="gap-2">
              {userCookbooks.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="mb-2 text-stone-500 dark:text-stone-400">
                    No cookbooks yet
                  </Text>
                  <Pressable
                    onPress={() => setShowCreateModal(true)}
                    className="flex-row items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 active:bg-orange-600"
                  >
                    <Plus className="h-5 w-5 text-white" />
                    <Text className="font-semibold text-white">
                      Create Cookbook
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {userCookbooks.map((cookbook) => {
                    const isSelected = selectedCookbooks.has(cookbook._id);

                    return (
                      <Pressable
                        key={cookbook._id}
                        onPress={() => toggleCookbook(cookbook._id)}
                        className={`flex-row items-center gap-3 rounded-xl border p-3 ${
                          isSelected
                            ? "border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20"
                            : "border-stone-200 bg-white active:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:active:bg-stone-700"
                        }`}
                      >
                        {/* Checkbox */}
                        <View
                          className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                            isSelected
                              ? "border-orange-500 bg-orange-500"
                              : "border-stone-300 dark:border-stone-600"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </View>

                        {/* Cover Thumbnail */}
                        <Image
                          source={{ uri: cookbook.coverUrl }}
                          className="h-12 w-12 rounded-lg"
                          resizeMode="cover"
                        />

                        {/* Info */}
                        <View className="flex-1">
                          <Text className="font-medium text-stone-900 dark:text-white">
                            {cookbook.name}
                          </Text>
                          <Text className="text-sm text-stone-500 dark:text-stone-400">
                            {cookbook.recipeCount}{" "}
                            {cookbook.recipeCount === 1 ? "recipe" : "recipes"}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}

                  {/* Create New Cookbook */}
                  <Pressable
                    onPress={() => setShowCreateModal(true)}
                    className="flex-row items-center gap-3 rounded-xl border-2 border-dashed border-stone-300 p-3 active:border-orange-400 dark:border-stone-600"
                  >
                    <View className="h-6 w-6 items-center justify-center">
                      <Plus className="h-5 w-5 text-stone-400" />
                    </View>
                    <View className="h-12 w-12 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                      <Plus className="h-6 w-6 text-stone-400" />
                    </View>
                    <Text className="flex-1 font-medium text-stone-500 dark:text-stone-400">
                      Create New Cookbook
                    </Text>
                  </Pressable>
                </>
              )}

              {/* Error Message */}
              {error && (
                <View className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/30">
                  <Text className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 border-t border-stone-200 px-4 py-4 dark:border-stone-700">
            <Pressable
              onPress={handleClose}
              className="flex-1 items-center rounded-xl border border-stone-200 py-3 active:bg-stone-50 dark:border-stone-700 dark:active:bg-stone-800"
            >
              <Text className="font-semibold text-stone-600 dark:text-stone-400">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 items-center rounded-xl py-3 ${
                !isSubmitting
                  ? "bg-orange-500 active:bg-orange-600"
                  : "bg-stone-200 dark:bg-stone-700"
              }`}
            >
              <Text
                className={`font-semibold ${
                  !isSubmitting ? "text-white" : "text-stone-400"
                }`}
              >
                {isSubmitting ? "Saving..." : "Done"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Nested Create Modal */}
      <CreateCookbookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

/**
 * EditCookbookModal Component
 *
 * Modal for editing an existing cookbook.
 * Pre-populates form with current cookbook data.
 */

import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { X, Pencil } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CoverImagePicker } from "./CoverImagePicker";

interface EditCookbookModalProps {
  isOpen: boolean;
  cookbookId: Id<"cookbooks"> | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditCookbookModal({
  isOpen,
  cookbookId,
  onClose,
  onSuccess,
}: EditCookbookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cookbook = useQuery(
    api.cookbooks.getCookbook,
    cookbookId ? { id: cookbookId } : "skip"
  );

  const cookbookWithRecipes = useQuery(
    api.cookbooks.getCookbookWithRecipes,
    cookbookId ? { id: cookbookId } : "skip"
  );

  const updateCookbook = useMutation(api.cookbooks.updateCookbook);

  // Populate form with existing data
  useEffect(() => {
    if (cookbook) {
      setName(cookbook.name);
      setDescription(cookbook.description);
      setCoverUrl(cookbook.coverUrl);
    }
  }, [cookbook]);

  const nameCharCount = name.length;
  const descCharCount = description.length;
  const isNameValid = name.trim().length > 0 && name.length <= 50;
  const isDescValid = description.length <= 200;

  const recipeImages = cookbookWithRecipes?.recipes?.map((r) => r.imageUrl) ?? [];

  const handleSubmit = async () => {
    if (!cookbookId || !isNameValid || !isDescValid) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateCookbook({
        id: cookbookId,
        name: name.trim(),
        description: description.trim(),
        coverUrl,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cookbook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white dark:bg-stone-900"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <View className="flex-row items-center gap-2">
            <Pencil className="h-5 w-5 text-orange-500" />
            <Text className="text-lg font-semibold text-stone-900 dark:text-white">
              Edit Cookbook
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
        <ScrollView className="flex-1 px-4 py-6">
          <View className="gap-6">
            {/* Name Input */}
            <View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Name <Text className="text-red-500">*</Text>
                </Text>
                <Text
                  className={`text-xs ${
                    nameCharCount > 50
                      ? "text-red-500"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {nameCharCount}/50
                </Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Weeknight Dinners"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                maxLength={60}
              />
              {nameCharCount > 50 && (
                <Text className="mt-1 text-xs text-red-500">
                  Name must be 50 characters or less
                </Text>
              )}
            </View>

            {/* Description Input */}
            <View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Description
                </Text>
                <Text
                  className={`text-xs ${
                    descCharCount > 200
                      ? "text-red-500"
                      : "text-stone-400 dark:text-stone-500"
                  }`}
                >
                  {descCharCount}/200
                </Text>
              </View>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Quick and easy meals for busy evenings"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                className="min-h-[80px] rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                maxLength={220}
                textAlignVertical="top"
              />
              {descCharCount > 200 && (
                <Text className="mt-1 text-xs text-red-500">
                  Description must be 200 characters or less
                </Text>
              )}
            </View>

            {/* Cover Image Picker */}
            <View>
              <Text className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                Cover Image
              </Text>
              <CoverImagePicker
                selectedUrl={coverUrl}
                onSelectImage={setCoverUrl}
                recipeImages={recipeImages}
                cookbookName={name}
                cookbookDescription={description}
              />
            </View>

            {/* Error Message */}
            {error && (
              <View className="rounded-lg bg-red-50 p-3 dark:bg-red-900/30">
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
            disabled={!isNameValid || !isDescValid || isSubmitting}
            className={`flex-1 items-center rounded-xl py-3 ${
              isNameValid && isDescValid && !isSubmitting
                ? "bg-orange-500 active:bg-orange-600"
                : "bg-stone-200 dark:bg-stone-700"
            }`}
          >
            <Text
              className={`font-semibold ${
                isNameValid && isDescValid && !isSubmitting
                  ? "text-white"
                  : "text-stone-400"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

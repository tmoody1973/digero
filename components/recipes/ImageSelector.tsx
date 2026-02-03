/**
 * Image Selector Component
 *
 * Allows selecting images from camera or gallery for recipe.
 */

import { useState, useCallback } from "react";
import { View, Text, Image, Pressable, Alert, Platform } from "react-native";
import { Camera, ImageIcon, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageSelectorProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export function ImageSelector({
  imageUri,
  onImageSelected,
}: ImageSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in your device settings to take photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  }, []);

  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "ios") {
      // iOS doesn't require explicit permission for photo library reading
      return true;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Gallery Permission Required",
        "Please enable gallery access in your device settings to select photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  }, []);

  const handleCameraPress = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [requestCameraPermission, onImageSelected]);

  const handleGalleryPress = useCallback(async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [requestGalleryPermission, onImageSelected]);

  const handleRemove = useCallback(() => {
    onImageSelected(null);
  }, [onImageSelected]);

  if (imageUri) {
    // Show selected image with remove button
    return (
      <View className="relative rounded-2xl overflow-hidden">
        <Image
          source={{ uri: imageUri }}
          className="w-full aspect-[16/10]"
          resizeMode="cover"
        />
        <Pressable
          onPress={handleRemove}
          className="absolute top-3 right-3 w-10 h-10 bg-black/50 rounded-full items-center justify-center active:bg-black/70"
        >
          <X className="w-6 h-6 text-white" />
        </Pressable>
      </View>
    );
  }

  // Show placeholder with camera/gallery buttons
  return (
    <View className="bg-stone-100 dark:bg-stone-800 rounded-2xl aspect-[16/10] items-center justify-center">
      <View className="items-center">
        <ImageIcon className="w-12 h-12 text-stone-400 mb-3" />
        <Text className="text-stone-500 dark:text-stone-400 text-sm mb-4">
          Add a photo of your dish
        </Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCameraPress}
            disabled={isLoading}
            className="flex-row items-center gap-2 bg-white dark:bg-stone-700 px-4 py-2.5 rounded-xl active:bg-stone-100 dark:active:bg-stone-600"
          >
            <Camera className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            <Text className="font-medium text-stone-700 dark:text-stone-200">
              Camera
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGalleryPress}
            disabled={isLoading}
            className="flex-row items-center gap-2 bg-white dark:bg-stone-700 px-4 py-2.5 rounded-xl active:bg-stone-100 dark:active:bg-stone-600"
          >
            <ImageIcon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
            <Text className="font-medium text-stone-700 dark:text-stone-200">
              Gallery
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

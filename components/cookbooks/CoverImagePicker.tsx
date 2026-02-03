/**
 * CoverImagePicker Component
 *
 * Three-tab picker for cookbook cover images:
 * - Auto-populate from recipe images
 * - Upload from device
 * - AI-generated image via Gemini
 */

import { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, ScrollView } from "react-native";
import { ImagePlus, Upload, Sparkles, Check } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

type TabOption = "auto" | "upload" | "ai";

interface CoverImagePickerProps {
  selectedUrl: string;
  onSelectImage: (url: string) => void;
  recipeImages?: string[];
  cookbookName?: string;
  cookbookDescription?: string;
}

export function CoverImagePicker({
  selectedUrl,
  onSelectImage,
  recipeImages = [],
  cookbookName = "",
  cookbookDescription = "",
}: CoverImagePickerProps) {
  const [activeTab, setActiveTab] = useState<TabOption>("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedUrl(result.assets[0].uri);
      onSelectImage(result.assets[0].uri);
    }
  };

  const handleGenerateAI = async () => {
    if (!cookbookName.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      // TODO: Implement actual Gemini API call
      // For now, use a placeholder
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Placeholder image based on cookbook name
      const placeholderUrl = `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80`;
      setGeneratedUrl(placeholderUrl);
      onSelectImage(placeholderUrl);
    } catch (error) {
      console.error("Failed to generate AI image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs: { key: TabOption; label: string; icon: React.ReactNode }[] = [
    { key: "auto", label: "Auto", icon: <ImagePlus className="h-4 w-4" /> },
    { key: "upload", label: "Upload", icon: <Upload className="h-4 w-4" /> },
    { key: "ai", label: "AI Generate", icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <View className="gap-4">
      {/* Tab Buttons */}
      <View className="flex-row gap-2">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ${
              activeTab === tab.key
                ? "bg-orange-500"
                : "bg-stone-100 dark:bg-stone-800"
            }`}
          >
            <View
              className={
                activeTab === tab.key
                  ? "text-white"
                  : "text-stone-500 dark:text-stone-400"
              }
            >
              {tab.icon}
            </View>
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content */}
      <View className="min-h-[120px]">
        {activeTab === "auto" && (
          <View>
            {recipeImages.length === 0 ? (
              <View className="items-center justify-center rounded-xl border-2 border-dashed border-stone-300 py-8 dark:border-stone-600">
                <ImagePlus className="mb-2 h-8 w-8 text-stone-400" />
                <Text className="text-sm text-stone-500 dark:text-stone-400">
                  No recipe images available
                </Text>
                <Text className="text-xs text-stone-400 dark:text-stone-500">
                  Add recipes to see their images here
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {recipeImages.slice(0, 8).map((url, index) => (
                    <Pressable
                      key={index}
                      onPress={() => onSelectImage(url)}
                      className={`relative h-20 w-20 overflow-hidden rounded-lg ${
                        selectedUrl === url ? "ring-2 ring-orange-500" : ""
                      }`}
                    >
                      <Image
                        source={{ uri: url }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                      {selectedUrl === url && (
                        <View className="absolute bottom-1 right-1 h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                          <Check className="h-3 w-3 text-white" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {activeTab === "upload" && (
          <View className="gap-3">
            <Pressable
              onPress={handleUpload}
              className="items-center justify-center rounded-xl border-2 border-dashed border-stone-300 py-8 active:border-orange-400 dark:border-stone-600"
            >
              <Upload className="mb-2 h-8 w-8 text-stone-400" />
              <Text className="text-sm font-medium text-stone-600 dark:text-stone-400">
                Tap to upload image
              </Text>
              <Text className="text-xs text-stone-400 dark:text-stone-500">
                JPG, PNG up to 5MB
              </Text>
            </Pressable>

            {uploadedUrl && (
              <View className="flex-row items-center gap-3">
                <Image
                  source={{ uri: uploadedUrl }}
                  className="h-16 w-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-stone-900 dark:text-white">
                    Image uploaded
                  </Text>
                  <Text className="text-xs text-stone-500">
                    Tap above to replace
                  </Text>
                </View>
                {selectedUrl === uploadedUrl && (
                  <Check className="h-5 w-5 text-orange-500" />
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === "ai" && (
          <View className="gap-3">
            <View className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
              <Text className="mb-2 text-sm text-stone-600 dark:text-stone-400">
                Generate a cover image based on:
              </Text>
              <Text className="font-medium text-stone-900 dark:text-white">
                {cookbookName || "Enter a cookbook name first"}
              </Text>
              {cookbookDescription && (
                <Text className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {cookbookDescription}
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleGenerateAI}
              disabled={isGenerating || !cookbookName.trim()}
              className={`flex-row items-center justify-center gap-2 rounded-xl py-3 ${
                isGenerating || !cookbookName.trim()
                  ? "bg-stone-200 dark:bg-stone-700"
                  : "bg-orange-500 active:bg-orange-600"
              }`}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="font-semibold text-white">
                    Generating...
                  </Text>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-white" />
                  <Text className="font-semibold text-white">
                    Generate with AI
                  </Text>
                </>
              )}
            </Pressable>

            {generatedUrl && (
              <View className="flex-row items-center gap-3">
                <Image
                  source={{ uri: generatedUrl }}
                  className="h-16 w-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-stone-900 dark:text-white">
                    AI-generated image
                  </Text>
                  <Text className="text-xs text-stone-500">
                    Tap Generate to create a new one
                  </Text>
                </View>
                {selectedUrl === generatedUrl && (
                  <Check className="h-5 w-5 text-orange-500" />
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Preview */}
      {selectedUrl && (
        <View className="items-center">
          <Text className="mb-2 text-xs text-stone-500 dark:text-stone-400">
            Selected cover
          </Text>
          <Image
            source={{ uri: selectedUrl }}
            className="h-24 w-32 rounded-lg"
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );
}

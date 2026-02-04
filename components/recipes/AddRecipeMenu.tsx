/**
 * Add Recipe Menu
 *
 * Bottom sheet menu showing options for adding recipes:
 * - Manual entry
 * - Website URL
 * - YouTube URL
 * - YouTube Search
 * - Scan from photo
 * - Sous Chef (AI-powered recipe chat)
 */

import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import {
  PenLine,
  Globe,
  Youtube,
  Search,
  Camera,
  MessageSquare,
  X,
} from "lucide-react-native";

interface AddRecipeMenuProps {
  visible: boolean;
  onClose: () => void;
  onManualEntry: () => void;
  onWebsiteUrl: () => void;
  onYoutubeUrl: () => void;
  onYoutubeSearch: () => void;
  onScanPhoto: () => void;
  onAiChat?: () => void;
}

interface MenuOption {
  id: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onPress: () => void;
}

export function AddRecipeMenu({
  visible,
  onClose,
  onManualEntry,
  onWebsiteUrl,
  onYoutubeUrl,
  onYoutubeSearch,
  onScanPhoto,
  onAiChat,
}: AddRecipeMenuProps) {
  const options: MenuOption[] = [
    {
      id: "manual",
      icon: PenLine,
      iconColor: "#f97316",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      title: "Manual Entry",
      description: "Type in your own recipe",
      onPress: onManualEntry,
    },
    {
      id: "website",
      icon: Globe,
      iconColor: "#3b82f6",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      title: "Website URL",
      description: "Import from any recipe website",
      onPress: onWebsiteUrl,
    },
    {
      id: "youtube-url",
      icon: Youtube,
      iconColor: "#ef4444",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      title: "YouTube URL",
      description: "Paste a YouTube video link",
      onPress: onYoutubeUrl,
    },
    {
      id: "youtube-search",
      icon: Search,
      iconColor: "#ef4444",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      title: "Search YouTube",
      description: "Find cooking videos to import",
      onPress: onYoutubeSearch,
    },
    {
      id: "scan",
      icon: Camera,
      iconColor: "#8b5cf6",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      title: "Scan Recipe",
      description: "Take a photo of a recipe",
      onPress: onScanPhoto,
    },
    // Sous Chef option - only shown if callback is provided
    ...(onAiChat
      ? [
          {
            id: "ai-chat",
            icon: MessageSquare,
            iconColor: "#22c55e",
            iconBg: "bg-green-100 dark:bg-green-900/30",
            title: "Sous Chef",
            description: "Chat with AI for recipe ideas",
            onPress: onAiChat,
          },
        ]
      : []),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white dark:bg-stone-900 rounded-t-3xl">
              {/* Handle */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
                <Text className="text-xl font-bold text-stone-900 dark:text-white">
                  Add Recipe
                </Text>
                <Pressable
                  onPress={onClose}
                  className="p-2 -m-2 rounded-full active:bg-stone-100 dark:active:bg-stone-800"
                >
                  <X size={24} color="#78716c" />
                </Pressable>
              </View>

              {/* Options */}
              <View className="px-4 py-4 pb-10">
                {options.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        onClose();
                        option.onPress();
                      }}
                      className={`flex-row items-center gap-4 p-4 rounded-2xl active:bg-stone-100 dark:active:bg-stone-800 ${
                        index < options.length - 1 ? "mb-2" : ""
                      }`}
                    >
                      <View
                        className={`w-12 h-12 rounded-xl items-center justify-center ${option.iconBg}`}
                      >
                        <Icon size={24} color={option.iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-stone-900 dark:text-white">
                          {option.title}
                        </Text>
                        <Text className="text-sm text-stone-500 dark:text-stone-400">
                          {option.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

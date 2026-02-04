/**
 * AI Chat Screen
 *
 * Conversational interface for AI-powered recipe generation.
 * Uses react-native-gifted-chat for chat UI and Convex for real-time messaging.
 * Integrates with Gemini 2.0 Flash for recipe suggestions.
 * Supports image attachments and voice input.
 */

import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, Platform, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import {
  GiftedChat,
  IMessage,
  Bubble,
} from "react-native-gifted-chat";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";
import { ArrowLeft } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { createRenderCustomView, ChatInputToolbar } from "@/components/chat";

/**
 * Extended message type with custom properties for recipe data
 */
interface ChatMessage extends IMessage {
  recipeData?: unknown;
  clarificationQuestions?: string[];
  imageUrl?: string;
}

/**
 * AI user constant
 */
const AI_USER = {
  _id: "sous_chef",
  name: "Sous Chef",
  avatar: "https://placehold.co/100x100/a855f7/ffffff?text=%F0%9F%91%A8%E2%80%8D%F0%9F%8D%B3",
};

export default function AIChatScreen() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Local state
  const [isTyping, setIsTyping] = useState(false);

  // Convex queries and mutations
  const messages = useQuery(api.aiChat.getMessages, { limit: 50 });
  const sendMessage = useMutation(api.aiChat.sendMessage);
  const saveAiResponse = useMutation(api.aiChat.saveAiResponse);
  const generateRecipe = useAction(api.actions.generateRecipeChat.generateRecipeChat);

  // Current user for GiftedChat
  const currentUser = useMemo(
    () => ({
      _id: clerkUser?.id ?? "anonymous",
      name: clerkUser?.fullName ?? "User",
    }),
    [clerkUser]
  );

  // Transform Convex messages to GiftedChat format
  const giftedMessages = useMemo<ChatMessage[]>(() => {
    if (!messages) return [];

    return messages
      .map((msg) => ({
        _id: msg._id,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        user: msg.role === "user" ? currentUser : AI_USER,
        recipeData: msg.recipeData,
        clarificationQuestions: msg.clarificationQuestions,
        imageUrl: msg.imageUrl,
        image: msg.imageUrl, // GiftedChat uses 'image' prop
      }))
      .reverse(); // GiftedChat expects newest first
  }, [messages, currentUser]);

  // Build conversation history for AI context
  const conversationHistory = useMemo(() => {
    if (!messages) return [];

    return messages.slice(-10).map((msg) => ({
      role: msg.role as "user" | "assistant",
      text: msg.text,
      imageUrl: msg.imageUrl,
    }));
  }, [messages]);

  // Handle sending messages with optional image attachment
  const handleSendWithImage = useCallback(
    async (text: string, imageBase64: string | null) => {
      if (!text.trim() && !imageBase64) return;

      try {
        // Save user message to Convex (store image URL if provided)
        await sendMessage({
          text: text.trim() || "What can I make with these ingredients?",
          imageUrl: imageBase64 ? "attached" : undefined,
        });

        // Show typing indicator
        setIsTyping(true);

        // Generate AI response with optional image
        const result = await generateRecipe({
          message: text.trim() || "Please identify the ingredients in this image and suggest recipes.",
          imageBase64: imageBase64 ?? undefined,
          conversationHistory,
        });

        // Hide typing indicator
        setIsTyping(false);

        if (result.success && result.data) {
          // Save AI response - only include recipeData if there are recipes
          const hasRecipes = result.data.recipes && result.data.recipes.length > 0;
          await saveAiResponse({
            text: result.data.summary || (hasRecipes ? "Here are some recipe suggestions!" : ""),
            recipeData: hasRecipes ? result.data : undefined,
            clarificationQuestions:
              result.data.clarification_questions && result.data.clarification_questions.length > 0
                ? result.data.clarification_questions
                : undefined,
          });
        } else {
          // Save error response
          await saveAiResponse({
            text:
              result.error?.message ||
              "Sorry, I had trouble with that. Please try again.",
          });
        }
      } catch (error) {
        setIsTyping(false);
        console.error("Failed to send message:", error);

        // Save error message
        await saveAiResponse({
          text: "Sorry, something went wrong. Please try again.",
        });
      }
    },
    [sendMessage, generateRecipe, saveAiResponse, conversationHistory]
  );

  // Handle GiftedChat onSend (for compatibility with quick replies)
  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const userMessage = newMessages[0];
      if (!userMessage?.text?.trim()) return;
      await handleSendWithImage(userMessage.text.trim(), null);
    },
    [handleSendWithImage]
  );

  // Handle voice transcription
  const handleVoiceTranscription = useCallback(
    (text: string) => {
      // For now, send the transcription placeholder as a message
      // In a real implementation, this would populate the input field
      handleSendWithImage(text, null);
    },
    [handleSendWithImage]
  );

  // Handle quick reply selection
  const handleQuickReply = useCallback(
    (text: string) => {
      handleSend([
        {
          _id: `quick_${Date.now()}`,
          text,
          createdAt: new Date(),
          user: currentUser,
        },
      ]);
    },
    [handleSend, currentUser]
  );

  // Handle recipe saved
  const handleRecipeSaved = useCallback((recipeId: string) => {
    console.log("Recipe saved:", recipeId);
  }, []);

  // Custom bubble rendering for app-themed styling
  const renderBubble = useCallback(
    (props: Bubble<ChatMessage>["props"]) => (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: isDark ? "#292524" : "#f5f5f4", // stone-800 / stone-100
          },
          right: {
            backgroundColor: "#f97316", // orange-500
          },
        }}
        textStyle={{
          left: {
            color: isDark ? "#fafaf9" : "#1c1917", // stone-50 / stone-950
          },
          right: {
            color: "#ffffff",
          },
        }}
      />
    ),
    [isDark]
  );

  // Custom view for recipe cards and quick replies
  const renderCustomView = useMemo(
    () => createRenderCustomView(handleQuickReply, handleRecipeSaved),
    [handleQuickReply, handleRecipeSaved]
  );

  // Custom input toolbar with image and voice support
  const renderInputToolbar = useCallback(
    () => (
      <ChatInputToolbar
        isDark={isDark}
        onSendWithImage={handleSendWithImage}
        onVoiceTranscription={handleVoiceTranscription}
        isAiTyping={isTyping}
      />
    ),
    [isDark, handleSendWithImage, handleVoiceTranscription, isTyping]
  );

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="border-b border-stone-200 bg-white px-4 pb-4 pt-12 dark:border-stone-800 dark:bg-stone-900">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={isDark ? "#fafaf9" : "#1c1917"} />
          </Pressable>
          <View>
            <Text className="text-xl font-bold text-stone-900 dark:text-white">
              Sous Chef
            </Text>
            <Text className="text-sm text-stone-500 dark:text-stone-400">
              Ask me for recipe ideas
            </Text>
          </View>
        </View>
      </View>

      {/* Chat Interface */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <GiftedChat
          messages={giftedMessages}
          onSend={handleSend}
          user={currentUser}
          isTyping={isTyping}
          renderBubble={renderBubble}
          renderCustomView={renderCustomView}
          renderInputToolbar={renderInputToolbar}
          alwaysShowSend={false}
          scrollToBottom
          infiniteScroll
          renderUsernameOnMessage={false}
          showUserAvatar={false}
          showAvatarForEveryMessage={false}
          renderAvatarOnTop
          inverted={true}
          timeTextStyle={{
            left: { color: isDark ? "#78716c" : "#a8a29e" },
            right: { color: "rgba(255,255,255,0.7)" },
          }}
          listViewProps={{
            style: {
              backgroundColor: isDark ? "#0c0a09" : "#fafaf9", // stone-950 / stone-50
            },
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

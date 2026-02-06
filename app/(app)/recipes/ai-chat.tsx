/**
 * AI Chat Screen
 *
 * Conversational interface for AI-powered recipe generation.
 * Uses react-native-gifted-chat for chat UI and Convex for real-time messaging.
 * Integrates with Gemini 2.0 Flash for recipe suggestions.
 * Supports chat sessions, image attachments, and voice input.
 *
 * Free tier: 5 messages per day
 * Plus/Creator tier: Unlimited messages
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import { useQuery, useMutation, useAction } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Plus,
  History,
  MessageSquare,
  Trash2,
  X,
  Sparkles,
  Lock,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { createRenderCustomView, ChatInputToolbar } from "@/components/chat";
import { useAIChatLimit } from "@/hooks/useAIChatLimit";
import { PaywallModal } from "@/components/subscription/PaywallModal";

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

  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<Id<"aiChatSessions"> | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Local state
  const [isTyping, setIsTyping] = useState(false);

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);

  // AI Chat limit tracking
  const {
    canSend,
    isUnlimited,
    remaining,
    limit,
    remainingDisplay,
    shouldShowUpgradePrompt,
    checkAndIncrement,
  } = useAIChatLimit();

  // Convex queries and mutations
  const sessions = useQuery(api.aiChat.getSessions);
  const messages = useQuery(
    api.aiChat.getMessages,
    currentSessionId ? { sessionId: currentSessionId, limit: 100 } : "skip"
  );
  const createSession = useMutation(api.aiChat.createSession);
  const deleteSession = useMutation(api.aiChat.deleteSession);
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

  // Auto-create or select session on mount
  useEffect(() => {
    const initSession = async () => {
      if (sessions === undefined) return; // Still loading

      if (sessions.length === 0) {
        // No sessions exist, create one
        setIsCreatingSession(true);
        try {
          const newSessionId = await createSession({});
          setCurrentSessionId(newSessionId);
        } catch (error) {
          console.error("Failed to create session:", error);
        }
        setIsCreatingSession(false);
      } else if (!currentSessionId) {
        // Select most recent session
        setCurrentSessionId(sessions[0]._id);
      }
    };

    initSession();
  }, [sessions, currentSessionId, createSession]);

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
        image: msg.imageUrl,
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

  // Handle creating a new chat session
  const handleNewChat = useCallback(async () => {
    setIsCreatingSession(true);
    try {
      const newSessionId = await createSession({});
      setCurrentSessionId(newSessionId);
      setShowHistory(false);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
    setIsCreatingSession(false);
  }, [createSession]);

  // Handle selecting a session from history
  const handleSelectSession = useCallback((sessionId: Id<"aiChatSessions">) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  }, []);

  // Handle deleting a session
  const handleDeleteSession = useCallback(
    async (sessionId: Id<"aiChatSessions">) => {
      try {
        await deleteSession({ sessionId });
        // If deleted current session, select another or create new
        if (sessionId === currentSessionId) {
          const remainingSessions = sessions?.filter((s) => s._id !== sessionId) ?? [];
          if (remainingSessions.length > 0) {
            setCurrentSessionId(remainingSessions[0]._id);
          } else {
            setCurrentSessionId(null);
          }
        }
      } catch (error) {
        console.error("Failed to delete session:", error);
      }
    },
    [deleteSession, currentSessionId, sessions]
  );

  // Handle sending messages with optional image attachment
  const handleSendWithImage = useCallback(
    async (text: string, imageBase64: string | null) => {
      if (!currentSessionId) return;
      if (!text.trim() && !imageBase64) return;

      // Check usage limit for free users
      if (!isUnlimited) {
        const result = await checkAndIncrement();
        if (!result.success) {
          // Limit reached, show paywall
          setShowPaywall(true);
          return;
        }

        // Show upgrade prompt at 80% usage (4/5 messages)
        if (result.usage?.shouldShowUpgradePrompt) {
          // OneSignal in-app message trigger would go here
          // For now, we just show the banner in the UI
        }
      }

      try {
        // Save user message to Convex
        await sendMessage({
          sessionId: currentSessionId,
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
          // Save AI response
          const hasRecipes = result.data.recipes && result.data.recipes.length > 0;
          await saveAiResponse({
            sessionId: currentSessionId,
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
            sessionId: currentSessionId,
            text: result.error?.message || "Sorry, I had trouble with that. Please try again.",
          });
        }
      } catch (error) {
        setIsTyping(false);
        console.error("Failed to send message:", error);

        if (currentSessionId) {
          await saveAiResponse({
            sessionId: currentSessionId,
            text: "Sorry, something went wrong. Please try again.",
          });
        }
      }
    },
    [currentSessionId, sendMessage, generateRecipe, saveAiResponse, conversationHistory, isUnlimited, checkAndIncrement]
  );

  // Handle GiftedChat onSend
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

  // Custom bubble rendering
  const renderBubble = useCallback(
    (props: Bubble<ChatMessage>["props"]) => (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: isDark ? "#292524" : "#f5f5f4",
          },
          right: {
            backgroundColor: "#f97316",
          },
        }}
        textStyle={{
          left: {
            color: isDark ? "#fafaf9" : "#1c1917",
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

  // Custom input toolbar
  const renderInputToolbar = useCallback(
    () => (
      <ChatInputToolbar
        isDark={isDark}
        onSendWithImage={handleSendWithImage}
        onVoiceTranscription={handleVoiceTranscription}
        isAiTyping={isTyping}
        disabled={!canSend && !isUnlimited}
      />
    ),
    [isDark, handleSendWithImage, handleVoiceTranscription, isTyping, canSend, isUnlimited]
  );

  // Format date for session list
  const formatSessionDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (sessions === undefined || isCreatingSession) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-stone-600 dark:text-stone-400">
          {isCreatingSession ? "Creating chat..." : "Loading..."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="border-b border-stone-200 bg-white px-4 pb-4 pt-12 dark:border-stone-800 dark:bg-stone-900">
        <View className="flex-row items-center justify-between">
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

          <View className="flex-row items-center gap-2">
            {/* Message Limit Badge (Free users only) */}
            {!isUnlimited && (
              <View className="flex-row items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 dark:bg-stone-800">
                <MessageSquare size={14} color={isDark ? "#a8a29e" : "#78716c"} />
                <Text className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  {remaining}/{limit}
                </Text>
              </View>
            )}

            {/* Unlimited Badge (Plus/Creator users) */}
            {isUnlimited && (
              <View className="flex-row items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 dark:bg-orange-900/30">
                <Sparkles size={14} color="#f97316" />
                <Text className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  Unlimited
                </Text>
              </View>
            )}

            {/* New Chat Button */}
            <Pressable
              onPress={handleNewChat}
              className="h-10 w-10 items-center justify-center rounded-full bg-orange-500 active:bg-orange-600"
              accessibilityLabel="New chat"
              accessibilityRole="button"
            >
              <Plus size={20} color="#ffffff" />
            </Pressable>

            {/* History Button */}
            <Pressable
              onPress={() => setShowHistory(true)}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
              accessibilityLabel="Chat history"
              accessibilityRole="button"
            >
              <History size={24} color={isDark ? "#fafaf9" : "#1c1917"} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Upgrade Prompt Banner (when at 80% usage) */}
      {shouldShowUpgradePrompt && !isUnlimited && (
        <Pressable
          onPress={() => setShowPaywall(true)}
          className="flex-row items-center justify-between bg-orange-50 px-4 py-3 dark:bg-orange-950/30"
        >
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color="#f97316" />
            <Text className="text-sm text-orange-700 dark:text-orange-400">
              Running low! Upgrade for unlimited Sous Chef.
            </Text>
          </View>
          <Text className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            Upgrade
          </Text>
        </Pressable>
      )}

      {/* Chat Interface */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {currentSessionId ? (
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
                backgroundColor: isDark ? "#0c0a09" : "#fafaf9",
              },
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-stone-500 dark:text-stone-400">
              Select a chat or start a new one
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Limit Reached Overlay (when at 0 messages) */}
      {!canSend && !isUnlimited && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
              <Lock size={24} color={isDark ? "#78716c" : "#a8a29e"} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-stone-900 dark:text-white">
                Daily limit reached
              </Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">
                Upgrade to Plus for unlimited Sous Chef
              </Text>
            </View>
            <Pressable
              onPress={() => setShowPaywall(true)}
              className="rounded-xl bg-orange-500 px-4 py-2 active:bg-orange-600"
            >
              <Text className="font-semibold text-white">Upgrade</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHistory(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowHistory(false)}
        >
          <View className="mt-auto max-h-[70%] rounded-t-3xl bg-white dark:bg-stone-900">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-700">
              <Text className="text-xl font-bold text-stone-900 dark:text-white">
                Chat History
              </Text>
              <Pressable
                onPress={() => setShowHistory(false)}
                className="h-8 w-8 items-center justify-center rounded-full active:bg-stone-100 dark:active:bg-stone-800"
              >
                <X size={20} color={isDark ? "#a8a29e" : "#78716c"} />
              </Pressable>
            </View>

            {/* Session List */}
            <ScrollView className="flex-1 px-4 py-2">
              {sessions.length === 0 ? (
                <View className="items-center py-8">
                  <MessageSquare size={48} color={isDark ? "#57534e" : "#a8a29e"} />
                  <Text className="mt-4 text-center text-stone-500 dark:text-stone-400">
                    No chat history yet
                  </Text>
                </View>
              ) : (
                sessions.map((session) => (
                  <Pressable
                    key={session._id}
                    onPress={() => handleSelectSession(session._id)}
                    className={`mb-2 flex-row items-center rounded-xl p-4 ${
                      session._id === currentSessionId
                        ? "bg-orange-100 dark:bg-orange-900/30"
                        : "bg-stone-100 active:bg-stone-200 dark:bg-stone-800 dark:active:bg-stone-700"
                    }`}
                  >
                    <MessageSquare
                      size={20}
                      color={session._id === currentSessionId ? "#f97316" : isDark ? "#a8a29e" : "#78716c"}
                    />
                    <View className="ml-3 flex-1">
                      <Text
                        className={`font-medium ${
                          session._id === currentSessionId
                            ? "text-orange-700 dark:text-orange-400"
                            : "text-stone-900 dark:text-white"
                        }`}
                        numberOfLines={1}
                      >
                        {session.title}
                      </Text>
                      {session.preview && (
                        <Text
                          className="mt-0.5 text-sm text-stone-500 dark:text-stone-400"
                          numberOfLines={1}
                        >
                          {session.preview}
                        </Text>
                      )}
                      <Text className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                        {formatSessionDate(session.updatedAt)} · {session.messageCount} messages
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteSession(session._id)}
                      className="ml-2 h-8 w-8 items-center justify-center rounded-full active:bg-red-100 dark:active:bg-red-900/30"
                      accessibilityLabel="Delete chat"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                  </Pressable>
                ))
              )}
            </ScrollView>

            {/* New Chat Button in Modal */}
            <View className="border-t border-stone-200 p-4 dark:border-stone-700">
              <Pressable
                onPress={handleNewChat}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 active:bg-orange-600"
              >
                <Plus size={20} color="#ffffff" />
                <Text className="font-semibold text-white">New Chat</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        trigger="AI_CHAT_LIMIT_EXCEEDED"
        customMessage="Upgrade to Plus for unlimited Sous Chef"
        onDismiss={() => setShowPaywall(false)}
        onPurchaseSuccess={() => setShowPaywall(false)}
      />
    </View>
  );
}

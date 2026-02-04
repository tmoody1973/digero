/**
 * useGiftedChatMessages Hook
 *
 * Transforms Convex AI chat messages to GiftedChat IMessage format.
 * Handles user identification and custom message properties.
 */

import { useMemo } from "react";
import type { IMessage } from "react-native-gifted-chat";
import type { Doc } from "@/convex/_generated/dataModel";

/**
 * AI user constant for assistant messages
 */
const AI_USER = {
  _id: "ai_chef",
  name: "AI Chef",
  avatar: "https://placehold.co/100x100/f97316/ffffff?text=AI",
};

/**
 * Extended message type with custom properties
 */
export interface ChatMessage extends IMessage {
  recipeData?: unknown;
  clarificationQuestions?: string[];
  imageUrl?: string;
}

/**
 * User object for GiftedChat
 */
export interface GiftedChatUser {
  _id: string;
  name?: string;
  avatar?: string;
}

/**
 * Transform Convex messages to GiftedChat format
 *
 * @param messages - Array of Convex AI chat messages
 * @param currentUser - Current user object for GiftedChat
 * @returns Array of ChatMessage objects sorted newest first
 */
export function transformMessagesToGiftedChat(
  messages: Doc<"aiChatMessages">[] | undefined,
  currentUser: GiftedChatUser
): ChatMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  return messages
    .map((msg): ChatMessage => ({
      _id: msg._id,
      text: msg.text,
      createdAt: new Date(msg.createdAt),
      user: msg.role === "user" ? currentUser : AI_USER,
      recipeData: msg.recipeData,
      clarificationQuestions: msg.clarificationQuestions,
      imageUrl: msg.imageUrl,
      image: msg.imageUrl, // GiftedChat uses 'image' prop for display
    }))
    .reverse(); // GiftedChat expects newest first
}

/**
 * Hook for transforming Convex messages to GiftedChat format
 *
 * @param messages - Convex messages from useQuery
 * @param userId - Current user ID
 * @param userName - Current user display name
 * @returns Memoized array of ChatMessage objects
 */
export function useGiftedChatMessages(
  messages: Doc<"aiChatMessages">[] | undefined,
  userId: string,
  userName?: string
): ChatMessage[] {
  const currentUser = useMemo<GiftedChatUser>(
    () => ({
      _id: userId,
      name: userName ?? "User",
    }),
    [userId, userName]
  );

  return useMemo(
    () => transformMessagesToGiftedChat(messages, currentUser),
    [messages, currentUser]
  );
}

/**
 * Build conversation history for AI context
 *
 * Returns the last N messages in chronological order for AI context.
 *
 * @param messages - Convex messages from useQuery
 * @param limit - Maximum number of messages to include (default 10)
 * @returns Array of conversation history objects
 */
export function buildConversationHistory(
  messages: Doc<"aiChatMessages">[] | undefined,
  limit: number = 10
): Array<{
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
}> {
  if (!messages || messages.length === 0) {
    return [];
  }

  return messages.slice(-limit).map((msg) => ({
    role: msg.role as "user" | "assistant",
    text: msg.text,
    imageUrl: msg.imageUrl,
  }));
}

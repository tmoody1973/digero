/**
 * ChatCustomViews Component
 *
 * Custom view renderer for GiftedChat messages.
 * Renders recipe cards and quick reply buttons for AI responses.
 */

import { View } from "react-native";
import { RecipeChatCard, type AiRecipe } from "./RecipeChatCard";
import { QuickReplyButtons } from "./QuickReplyButtons";

/**
 * Extended message type with custom properties
 */
interface CustomMessageProps {
  currentMessage?: {
    _id: string | number;
    text: string;
    user: {
      _id: string | number;
    };
    recipeData?: {
      recipes?: AiRecipe[];
    };
    clarificationQuestions?: string[];
  };
  onQuickReply?: (text: string) => void;
  onRecipeSaved?: (recipeId: string) => void;
}

/**
 * Renders custom content below message bubbles
 * For AI messages with recipe data or clarification questions
 */
export function ChatCustomView({
  currentMessage,
  onQuickReply,
  onRecipeSaved,
}: CustomMessageProps) {
  if (!currentMessage) return null;

  // Check if this is an AI message (not from the current user)
  const isAiMessage = currentMessage.user._id === "ai_chef";
  if (!isAiMessage) return null;

  const { recipeData, clarificationQuestions } = currentMessage;

  // No custom content needed
  if (!recipeData?.recipes?.length && !clarificationQuestions?.length) {
    return null;
  }

  return (
    <View className="w-full max-w-[300px]">
      {/* Render recipe cards */}
      {recipeData?.recipes?.map((recipe) => (
        <RecipeChatCard
          key={recipe.id}
          recipe={recipe}
          onSaved={() => onRecipeSaved?.(recipe.id)}
        />
      ))}

      {/* Render quick reply buttons */}
      {clarificationQuestions && clarificationQuestions.length > 0 && (
        <QuickReplyButtons
          questions={clarificationQuestions}
          onSelect={(question) => onQuickReply?.(question)}
        />
      )}
    </View>
  );
}

/**
 * Creates the renderCustomView prop function for GiftedChat
 */
export function createRenderCustomView(
  onQuickReply: (text: string) => void,
  onRecipeSaved?: (recipeId: string) => void
) {
  return (props: CustomMessageProps) => (
    <ChatCustomView
      {...props}
      onQuickReply={onQuickReply}
      onRecipeSaved={onRecipeSaved}
    />
  );
}

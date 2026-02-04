/**
 * QuickReplyButtons Component
 *
 * Horizontal scrollable list of quick reply buttons for clarification questions.
 * Tapping a button sends the question as a user message.
 */

import { ScrollView, Pressable, Text } from "react-native";

interface QuickReplyButtonsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function QuickReplyButtons({ questions, onSelect }: QuickReplyButtonsProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-2 py-2 gap-2"
      className="mb-2"
    >
      {questions.map((question, index) => (
        <Pressable
          key={`${question}-${index}`}
          onPress={() => onSelect(question)}
          className="rounded-full bg-stone-100 px-4 py-2 active:bg-stone-200 dark:bg-stone-800 dark:active:bg-stone-700"
        >
          <Text className="text-sm text-stone-700 dark:text-stone-300" numberOfLines={1}>
            {question}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

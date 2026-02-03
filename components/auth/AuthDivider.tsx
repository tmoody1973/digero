/**
 * Auth Divider Component
 *
 * Visual divider with "or continue with" text for auth screens.
 */

import { View, Text } from "react-native";

export function AuthDivider() {
  return (
    <View className="flex-row items-center my-6">
      <View className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
      <Text className="mx-4 text-sm text-stone-500 dark:text-stone-400">
        or continue with
      </Text>
      <View className="flex-1 h-px bg-stone-200 dark:bg-stone-700" />
    </View>
  );
}

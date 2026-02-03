/**
 * OAuth Button Component
 *
 * Styled button for OAuth sign-in/sign-up (Apple, Google).
 * Includes provider icons and consistent styling.
 */

import { Pressable, Text, View } from "react-native";

interface OAuthButtonProps {
  provider: "apple" | "google";
  onPress: () => void;
  disabled?: boolean;
}

export function OAuthButton({ provider, onPress, disabled }: OAuthButtonProps) {
  const config = {
    apple: {
      label: "Continue with Apple",
      bgColor: "bg-black dark:bg-white",
      textColor: "text-white dark:text-black",
      icon: AppleIcon,
    },
    google: {
      label: "Continue with Google",
      bgColor: "bg-white dark:bg-stone-800",
      textColor: "text-stone-700 dark:text-stone-200",
      icon: GoogleIcon,
    },
  };

  const { label, bgColor, textColor, icon: Icon } = config[provider];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-xl py-3.5 px-4 border border-stone-200 dark:border-stone-700 ${bgColor} ${
        disabled ? "opacity-50" : "active:opacity-80"
      }`}
    >
      <View className="mr-3">
        <Icon />
      </View>
      <Text className={`font-semibold text-base ${textColor}`}>{label}</Text>
    </Pressable>
  );
}

// Apple icon as inline SVG (simplified for React Native)
function AppleIcon() {
  return (
    <View className="w-5 h-5 items-center justify-center">
      <Text className="text-white dark:text-black text-lg font-bold">
        {/* Apple logo character */}
      </Text>
    </View>
  );
}

// Google icon as inline SVG (simplified for React Native)
function GoogleIcon() {
  return (
    <View className="w-5 h-5 items-center justify-center">
      <Text className="text-base font-bold text-blue-500">G</Text>
    </View>
  );
}

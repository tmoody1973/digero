/**
 * Free Tier Benefits Screen
 *
 * Shows new users what they get with the free tier
 * and what's available if they upgrade.
 */

import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import {
  Check,
  BookOpen,
  Camera,
  MessageSquare,
  Calendar,
  ShoppingCart,
  Sparkles,
  Crown,
} from "lucide-react-native";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  included: boolean;
  limit?: string;
}

function FeatureItem({ icon, title, description, included, limit }: FeatureItemProps) {
  return (
    <View className="flex-row items-start gap-3 py-3">
      <View className={`w-10 h-10 rounded-full items-center justify-center ${
        included ? "bg-green-500/20" : "bg-stone-200 dark:bg-stone-700"
      }`}>
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </Text>
          {included && <Check size={16} color="#22c55e" />}
        </View>
        <Text className="text-sm text-stone-600 dark:text-stone-400">
          {description}
        </Text>
        {limit && (
          <Text className="text-xs text-orange-500 mt-1 font-medium">
            {limit}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function FreeTierScreen() {
  const router = useRouter();

  return (
    <OnboardingContainer
      currentStep={5}
      totalSteps={6}
      onSkip={() => router.push("/(onboarding)/profile-setup")}
    >
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="items-center mt-8 mb-6">
          <View className="w-16 h-16 rounded-full bg-orange-500/20 items-center justify-center mb-4">
            <Sparkles size={32} color="#f97316" />
          </View>
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-center">
            What You Get for Free
          </Text>
          <Text className="text-base text-stone-600 dark:text-stone-400 text-center mt-2">
            Start cooking with these features included
          </Text>
        </View>

        {/* Free Features */}
        <View className="bg-white dark:bg-stone-800 rounded-2xl p-4 mb-6 border border-stone-200 dark:border-stone-700">
          <FeatureItem
            icon={<BookOpen size={20} color="#22c55e" />}
            title="Save Recipes"
            description="Import from YouTube, websites, or create your own"
            included={true}
            limit="Up to 10 recipes"
          />

          <View className="h-px bg-stone-200 dark:bg-stone-700" />

          <FeatureItem
            icon={<Camera size={20} color="#22c55e" />}
            title="Cookbook Scanning"
            description="Snap a photo to import recipes from physical cookbooks"
            included={true}
            limit="3 scans per month"
          />

          <View className="h-px bg-stone-200 dark:bg-stone-700" />

          <FeatureItem
            icon={<MessageSquare size={20} color="#22c55e" />}
            title="AI Sous Chef"
            description="Get cooking tips and recipe help from our AI assistant"
            included={true}
            limit="5 messages per day"
          />

          <View className="h-px bg-stone-200 dark:bg-stone-700" />

          <FeatureItem
            icon={<Calendar size={20} color="#22c55e" />}
            title="Meal Planning"
            description="Plan your weekly meals with drag-and-drop calendar"
            included={true}
          />

          <View className="h-px bg-stone-200 dark:bg-stone-700" />

          <FeatureItem
            icon={<ShoppingCart size={20} color="#22c55e" />}
            title="Shopping Lists"
            description="Auto-generate shopping lists from your meal plan"
            included={true}
          />
        </View>

        {/* Upgrade Teaser */}
        <View className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-2xl p-4 border border-purple-500/20">
          <View className="flex-row items-center gap-2 mb-2">
            <Crown size={20} color="#a855f7" />
            <Text className="text-base font-bold text-purple-600 dark:text-purple-400">
              Want More?
            </Text>
          </View>
          <Text className="text-sm text-stone-600 dark:text-stone-400 mb-3">
            Upgrade anytime for unlimited recipes, AI messages, cookbook scans,
            exclusive creator content, and member discounts.
          </Text>
          <Text className="text-xs text-stone-500 dark:text-stone-500">
            Starting at $4.99/month
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="absolute bottom-8 left-6 right-6">
        <Pressable
          onPress={() => router.push("/(onboarding)/profile-setup")}
          className="bg-orange-500 active:bg-orange-600 rounded-xl py-4 items-center shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            Continue
          </Text>
        </Pressable>
      </View>
    </OnboardingContainer>
  );
}

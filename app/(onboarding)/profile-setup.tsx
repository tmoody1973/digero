/**
 * Profile Setup Screen
 *
 * Final onboarding screen for setting cooking skill level and dietary restrictions.
 * Saves profile data to Convex and marks onboarding as complete.
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  COOKING_SKILL_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
  CookingSkillLevel,
} from "@/product-plan/data-model/types";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  // Form state
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<CookingSkillLevel>("intermediate");
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle dietary restriction
  const toggleRestriction = useCallback((restriction: string) => {
    setSelectedRestrictions((current) =>
      current.includes(restriction)
        ? current.filter((r) => r !== restriction)
        : [...current, restriction]
    );
  }, []);

  // Handle completing setup
  const handleCompleteSetup = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await completeOnboarding({
        cookingSkillLevel: selectedSkillLevel,
        dietaryRestrictions: selectedRestrictions,
      });

      router.replace("/(app)");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [completeOnboarding, selectedSkillLevel, selectedRestrictions, router]);

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      <ScrollView
        contentContainerClassName="px-6 py-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-center mb-2">
            Personalize Your Experience
          </Text>
          <Text className="text-base text-stone-600 dark:text-stone-400 text-center">
            Help us recommend the right recipes for you
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <Text className="text-red-600 dark:text-red-400 text-center">
              {error}
            </Text>
          </View>
        )}

        {/* Cooking Skill Level */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            What's your cooking skill level?
          </Text>
          <View className="flex-row gap-3">
            {COOKING_SKILL_LEVEL_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSelectedSkillLevel(option.value)}
                className={`flex-1 py-3 px-4 rounded-xl border ${
                  selectedSkillLevel === option.value
                    ? "bg-orange-500 border-orange-500"
                    : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedSkillLevel === option.value
                      ? "text-white"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dietary Restrictions */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Any dietary restrictions?
          </Text>
          <Text className="text-sm text-stone-500 dark:text-stone-400 mb-4">
            Select all that apply (optional)
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {DIETARY_RESTRICTION_OPTIONS.map((option) => {
              const isSelected = selectedRestrictions.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleRestriction(option.value)}
                  className={`py-2.5 px-4 rounded-xl border ${
                    isSelected
                      ? "bg-orange-100 dark:bg-orange-900/30 border-orange-500"
                      : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      isSelected
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Complete Button */}
        <Pressable
          onPress={handleCompleteSetup}
          disabled={isLoading}
          className={`rounded-xl py-4 items-center shadow-sm ${
            isLoading
              ? "bg-stone-300 dark:bg-stone-700"
              : "bg-orange-500 active:bg-orange-600"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Complete Setup
            </Text>
          )}
        </Pressable>

        {/* Skip Option */}
        <Pressable
          onPress={handleCompleteSetup}
          disabled={isLoading}
          className="mt-4 py-2"
        >
          <Text className="text-stone-500 dark:text-stone-400 text-center text-sm">
            Skip for now
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

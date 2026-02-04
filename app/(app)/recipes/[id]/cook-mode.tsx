/**
 * Cook Mode Screen
 *
 * Full-screen step-by-step cooking view with large text and timers.
 * Screen stays awake while in this mode.
 * Includes Speechmatics Flow voice assistant for hands-free cooking help.
 */

import { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useKeepAwake } from "expo-keep-awake";

import {
  CountdownTimer,
  StepProgressBar,
  TimerButton,
  getPrimaryTime,
} from "@/components/recipes/cook-mode";
import { SpeechmaticsFlowProvider } from "@/components/voice/SpeechmaticsFlowProvider";
import { SpeechmaticsVoiceButton } from "@/components/voice/SpeechmaticsVoiceButton";
import type { VoiceAssistantRecipe } from "@/hooks/voice/useSpeechmaticsFlow";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CookModeScreen() {
  // Keep screen awake during cook mode
  useKeepAwake();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(true);

  const recipe = useQuery(api.recipes.get, {
    id: id as Id<"recipes">,
  });

  const totalSteps = recipe?.instructions.length ?? 0;

  // Handle step navigation
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStep(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
      }
    },
    [totalSteps]
  );

  const goToPrevious = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const goToNext = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  // Handle timer
  const handleStartTimer = useCallback((seconds: number) => {
    setActiveTimer(seconds);
    setTimerRemaining(seconds);
    setTimerRunning(true);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setTimerRemaining(0);
  }, []);

  const handleDismissTimer = useCallback(() => {
    setActiveTimer(null);
    setTimerRemaining(null);
    setTimerRunning(true);
  }, []);

  const handleTimerTick = useCallback((remaining: number) => {
    setTimerRemaining(remaining);
  }, []);

  // Handle scroll end to update current step
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentStep(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Loading state
  if (recipe === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-900">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Recipe not found
  if (recipe === null) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-900 px-6">
        <Text className="mb-2 text-xl font-semibold text-white">
          Recipe Not Found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 rounded-xl bg-orange-500 px-6 py-3"
        >
          <Text className="font-medium text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Build voice assistant recipe data
  const voiceRecipe: VoiceAssistantRecipe = {
    id: recipe._id,
    title: recipe.title,
    ingredients: recipe.ingredients.map((ing) =>
      typeof ing === "string"
        ? ing
        : { name: ing.name, quantity: ing.quantity, unit: ing.unit }
    ),
    instructions: recipe.instructions,
    servings: recipe.servings,
  };

  const renderStep = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const detectedTime = getPrimaryTime(item);

    return (
      <View
        style={{ width: SCREEN_WIDTH }}
        className="flex-1 items-center justify-center px-8"
      >
        <Text className="text-center text-3xl font-medium leading-relaxed text-white">
          {item}
        </Text>

        {detectedTime && detectedTime > 0 && (
          <View className="mt-8">
            <TimerButton
              seconds={detectedTime}
              onPress={() => handleStartTimer(detectedTime)}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SpeechmaticsFlowProvider>
      <View className="flex-1 bg-stone-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-stone-800 active:bg-stone-700"
          >
            <X className="h-5 w-5 text-white" />
          </Pressable>

          <Text className="text-lg font-semibold text-white">
            Step {currentStep + 1} of {totalSteps}
          </Text>

          <View className="w-10" />
        </View>

        {/* Progress Bar */}
        <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Recipe Title */}
        <View className="px-4 py-4">
          <Text className="text-center text-base text-stone-400" numberOfLines={1}>
            {recipe.title}
          </Text>
        </View>

        {/* Steps Pager */}
        <FlatList
          ref={flatListRef}
          data={recipe.instructions}
          renderItem={renderStep}
          keyExtractor={(_, index) => `step-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={0}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          className="flex-1"
        />

        {/* Active Timer Overlay */}
        {activeTimer !== null && (
          <View className="absolute bottom-32 left-0 right-0 px-4">
            <CountdownTimer
              initialSeconds={activeTimer}
              onComplete={handleTimerComplete}
              onDismiss={handleDismissTimer}
              onTick={handleTimerTick}
            />
          </View>
        )}

        {/* Voice Assistant Button */}
        <SpeechmaticsVoiceButton
          recipe={voiceRecipe}
          currentStep={currentStep}
        />

        {/* Navigation Buttons */}
        <View className="flex-row items-center justify-between px-4 pb-8 pt-4">
          <Pressable
            onPress={goToPrevious}
            disabled={currentStep === 0}
            className={`h-14 w-14 items-center justify-center rounded-full ${
              currentStep === 0
                ? "bg-stone-800/50"
                : "bg-stone-800 active:bg-stone-700"
            }`}
          >
            <ChevronLeft
              className={`h-6 w-6 ${
                currentStep === 0 ? "text-stone-600" : "text-white"
              }`}
            />
          </Pressable>

          {/* Step indicators */}
          <View className="flex-row gap-2">
            {recipe.instructions.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => goToStep(index)}
                className={`h-2 rounded-full ${
                  index === currentStep
                    ? "w-6 bg-orange-500"
                    : "w-2 bg-stone-700"
                }`}
              />
            ))}
          </View>

          <Pressable
            onPress={goToNext}
            disabled={currentStep === totalSteps - 1}
            className={`h-14 w-14 items-center justify-center rounded-full ${
              currentStep === totalSteps - 1
                ? "bg-stone-800/50"
                : "bg-orange-500 active:bg-orange-600"
            }`}
          >
            <ChevronRight
              className={`h-6 w-6 ${
                currentStep === totalSteps - 1 ? "text-stone-600" : "text-white"
              }`}
            />
          </Pressable>
        </View>
      </View>
    </SpeechmaticsFlowProvider>
  );
}

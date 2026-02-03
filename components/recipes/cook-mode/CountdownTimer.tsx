/**
 * CountdownTimer Component
 *
 * Displays a countdown timer with start, pause, reset controls.
 * Triggers audio/vibration alert on completion.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, Pressable, Vibration } from "react-native";
import { Play, Pause, RotateCcw } from "lucide-react-native";
import { formatSeconds } from "./timePatterns";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function CountdownTimer({
  initialSeconds,
  onComplete,
  onDismiss,
}: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            // Vibration alert
            Vibration.vibrate([500, 200, 500, 200, 500]);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds, onComplete]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setRemainingSeconds(initialSeconds);
  }, [initialSeconds]);

  // Format time for display
  const formatDisplayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View
      className={`items-center rounded-2xl p-6 ${
        isComplete
          ? "bg-green-100 dark:bg-green-900/30"
          : "bg-stone-100 dark:bg-stone-800"
      }`}
    >
      {/* Timer Display */}
      <Text
        className={`font-mono text-5xl font-bold ${
          isComplete
            ? "text-green-600 dark:text-green-400"
            : "text-stone-900 dark:text-stone-100"
        }`}
      >
        {formatDisplayTime(remainingSeconds)}
      </Text>

      {isComplete && (
        <Text className="mt-2 text-lg font-medium text-green-600 dark:text-green-400">
          Timer Complete!
        </Text>
      )}

      {/* Controls */}
      <View className="mt-4 flex-row items-center gap-4">
        {!isRunning && !isComplete && (
          <Pressable
            onPress={handleStart}
            className="h-14 w-14 items-center justify-center rounded-full bg-orange-500 active:bg-orange-600"
          >
            <Play className="h-6 w-6 text-white" fill="white" />
          </Pressable>
        )}

        {isRunning && (
          <Pressable
            onPress={handlePause}
            className="h-14 w-14 items-center justify-center rounded-full bg-orange-500 active:bg-orange-600"
          >
            <Pause className="h-6 w-6 text-white" fill="white" />
          </Pressable>
        )}

        {(isComplete || remainingSeconds < initialSeconds) && (
          <Pressable
            onPress={handleReset}
            className="h-14 w-14 items-center justify-center rounded-full bg-stone-200 active:bg-stone-300 dark:bg-stone-700 dark:active:bg-stone-600"
          >
            <RotateCcw className="h-6 w-6 text-stone-600 dark:text-stone-300" />
          </Pressable>
        )}
      </View>

      {/* Dismiss button */}
      {onDismiss && (
        <Pressable onPress={onDismiss} className="mt-4">
          <Text className="text-stone-500 dark:text-stone-400">Dismiss</Text>
        </Pressable>
      )}
    </View>
  );
}

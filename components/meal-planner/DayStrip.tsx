/**
 * DayStrip Component
 *
 * Horizontal row of 7 circular date indicators for the week.
 * Today is highlighted with orange fill, selected day has a ring,
 * and days with meals show dot indicators.
 */

import { View, Text, Pressable } from "react-native";
import type { DayStripProps } from "@/types/meal-planner";

export function DayStrip({ days, selectedDay, onSelectDay }: DayStripProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {days.map((day) => {
        const isSelected = day.date === selectedDay;

        return (
          <Pressable
            key={day.date}
            onPress={() => onSelectDay(day.date)}
            className="items-center"
            accessibilityLabel={`${day.dayName} ${day.dateNumber}${day.isToday ? ", today" : ""}${day.hasMeals ? ", has meals planned" : ""}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            {/* Day Name */}
            <Text
              className={`mb-1 text-xs font-medium ${
                day.isToday
                  ? "text-orange-500"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              {day.dayName}
            </Text>

            {/* Date Circle */}
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${
                day.isToday
                  ? "bg-orange-500"
                  : isSelected
                    ? "border-2 border-orange-500 bg-white dark:bg-stone-800"
                    : "bg-white dark:bg-stone-800"
              }`}
            >
              <Text
                className={`text-lg font-bold ${
                  day.isToday
                    ? "text-white"
                    : isSelected
                      ? "text-orange-500"
                      : "text-stone-900 dark:text-white"
                }`}
              >
                {day.dateNumber}
              </Text>
            </View>

            {/* Meal Indicator Dot */}
            {day.hasMeals && !day.isToday && (
              <View className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
            )}
            {day.isToday && day.hasMeals && (
              <View className="mt-1 h-1.5 w-1.5 rounded-full bg-white" />
            )}
            {!day.hasMeals && <View className="mt-1 h-1.5 w-1.5" />}
          </Pressable>
        );
      })}
    </View>
  );
}

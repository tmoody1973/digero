/**
 * useWeekNavigation Hook
 *
 * Manages week navigation state for the meal planner calendar.
 * Provides current week info, selected day, and navigation functions.
 */

import { useState, useCallback, useMemo } from "react";
import type { WeekInfo, DayInfo, UseWeekNavigationReturn } from "@/types/meal-planner";

/**
 * Get the start of the week (Sunday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a week label (e.g., "Feb 2 - 8, 2026")
 */
function formatWeekLabel(startDate: Date, endDate: Date): string {
  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

/**
 * Get short day name (e.g., "Sun", "Mon")
 */
function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Hook for managing week navigation in the meal planner
 */
export function useWeekNavigation(
  mealsWithDates?: { day: string }[]
): UseWeekNavigationReturn {
  const today = useMemo(() => new Date(), []);

  // State: start of the current displayed week
  const [weekStartDate, setWeekStartDate] = useState<Date>(() =>
    getWeekStart(today)
  );

  // State: currently selected day
  const [selectedDay, setSelectedDay] = useState<string>(() =>
    formatDate(today)
  );

  // Calculate week info
  const currentWeek = useMemo<WeekInfo>(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);

    return {
      startDate: formatDate(weekStartDate),
      endDate: formatDate(endDate),
      weekLabel: formatWeekLabel(weekStartDate, endDate),
    };
  }, [weekStartDate]);

  // Generate day info for all 7 days in the week
  const weekDays = useMemo<DayInfo[]>(() => {
    const days: DayInfo[] = [];
    const mealDays = new Set(mealsWithDates?.map((m) => m.day) || []);

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dateString = formatDate(date);

      days.push({
        date: dateString,
        dayName: getDayName(date),
        dateNumber: String(date.getDate()),
        isToday: isSameDay(date, today),
        hasMeals: mealDays.has(dateString),
      });
    }

    return days;
  }, [weekStartDate, mealsWithDates, today]);

  // Navigation: go to previous week
  const goToPreviousWeek = useCallback(() => {
    setWeekStartDate((current) => {
      const newDate = new Date(current);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  // Navigation: go to next week
  const goToNextWeek = useCallback(() => {
    setWeekStartDate((current) => {
      const newDate = new Date(current);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  // Navigation: go to today
  const goToToday = useCallback(() => {
    const newWeekStart = getWeekStart(today);
    setWeekStartDate(newWeekStart);
    setSelectedDay(formatDate(today));
  }, [today]);

  // Select a specific day
  const selectDay = useCallback((day: string) => {
    setSelectedDay(day);
  }, []);

  return {
    currentWeek,
    selectedDay,
    weekDays,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    selectDay,
  };
}

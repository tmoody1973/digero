/**
 * Recipe Detail Layout
 *
 * Layout wrapper for recipe detail screens including cook mode.
 */

import { Stack } from "expo-router";

export default function RecipeDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="cook-mode"
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

/**
 * Recipes Layout
 *
 * Layout wrapper for recipe-related screens.
 */

import { Stack } from "expo-router";

export default function RecipesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fafaf9", // stone-50
        },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

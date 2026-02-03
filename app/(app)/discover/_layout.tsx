/**
 * Discover Layout
 *
 * Layout wrapper for the Discover tab screens.
 */

import { Stack } from "expo-router";

export default function DiscoverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#0c0a09", // stone-950
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="channel/[id]"
        options={{
          presentation: "card",
        }}
      />
    </Stack>
  );
}

/**
 * Expo App Configuration
 *
 * Configuration for the Digero React Native app including
 * iOS Share Sheet Extension for recipe URL sharing.
 */

import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Digero",
  slug: "digero",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./digero_logo_white.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./digero_logo_white.png",
    resizeMode: "contain",
    backgroundColor: "#0c0a09", // stone-950
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.digero.app",
    infoPlist: {
      // Deep linking configuration
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["digero"],
        },
      ],
      // Camera usage for cookbook scanning
      NSCameraUsageDescription: "Allow Digero to access your camera to scan recipes from cookbooks",
      // Photo library for recipe images
      NSPhotoLibraryUsageDescription: "Allow Digero to access your photos to add images to recipes",
    },
    // Required capabilities for RevenueCat
    entitlements: {
      "com.apple.developer.in-app-payments": [],
    },
    // Share Extension configuration
    // Note: expo-share-extension handles most of this automatically
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./digero_logo_white.png",
      backgroundColor: "#0c0a09",
    },
    package: "com.digero.app",
    // Deep linking configuration
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "digero",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./digero_logo_white.png",
  },
  scheme: "digero",
  plugins: [
    "expo-router",
    [
      "expo-camera",
      {
        cameraPermission: "Allow Digero to access your camera to scan recipes",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Digero to access your photos to select recipe images",
      },
    ],
    [
      "expo-share-intent",
      {
        // iOS Share Extension configuration
        iosActivationRules: {
          NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          NSExtensionActivationSupportsText: true,
        },
        // Optional: customize the share extension name
        // iosShareExtensionName: "Share to Digero",
      },
    ],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "0e09f3d3-28db-4b60-821d-943e4f677901", // Replace with actual EAS project ID
    },
  },
});

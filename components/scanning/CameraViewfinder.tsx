/**
 * Camera Viewfinder Component
 *
 * Full-screen camera preview with orange corner frame overlay
 * for guiding page positioning. Includes real-time feedback
 * messages and capture button.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import { Camera, AlertCircle } from "lucide-react-native";
import * as ImageManipulator from "expo-image-manipulator";

import type { CameraViewfinderProps, CameraGuidance } from "./types";

/**
 * Get camera guidance message based on state
 */
function getGuidanceMessage(isReady: boolean): CameraGuidance {
  if (!isReady) {
    return {
      type: "position_page",
      message: "Position the recipe page within the frame",
    };
  }
  return {
    type: "ready",
    message: "Hold steady and tap to capture",
  };
}

/**
 * CameraViewfinder Component
 *
 * Provides camera preview with:
 * - Orange corner frame overlay matching mockup
 * - Real-time guidance messages
 * - Capture button with visual feedback
 * - Image compression before callback
 */
export function CameraViewfinder({
  onCapture,
  isProcessing,
  guidanceMessage,
}: CameraViewfinderProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Auto-set ready after brief delay (simulates stabilization)
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const guidance = getGuidanceMessage(isReady);
  const displayMessage = guidanceMessage || guidance.message;

  /**
   * Handle image capture with compression
   */
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo) return;

      // Compress image to target under 2MB
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1920 } }], // Resize to reasonable width
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (manipulated.base64) {
        onCapture(manipulated.base64, "image/jpeg");
      }
    } catch (error) {
      console.error("Failed to capture image:", error);
    }
  }, [onCapture, isProcessing]);

  // Permission not determined yet
  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-900">
        <Text className="text-stone-400">Requesting camera permission...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-900 p-6">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <AlertCircle size={32} color="#ef4444" />
        </View>
        <Text className="mb-2 text-lg font-semibold text-white">
          Camera Access Required
        </Text>
        <Text className="mb-6 text-center text-stone-400">
          Please grant camera access to scan cookbook pages.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="rounded-xl bg-orange-500 px-6 py-3 active:bg-orange-600"
        >
          <Text className="font-semibold text-white">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-900">
      {/* Camera Preview */}
      <View className="relative flex-1">
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onCameraReady={() => setIsReady(true)}
        />

        {/* Frame Overlay - Semi-transparent border */}
        <View
          className="absolute inset-8 rounded-3xl border-2 border-orange-500/50"
          pointerEvents="none"
        />

        {/* Corner Markers */}
        <View
          className="absolute left-8 top-8 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-orange-500"
          pointerEvents="none"
        />
        <View
          className="absolute right-8 top-8 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-orange-500"
          pointerEvents="none"
        />
        <View
          className="absolute bottom-8 left-8 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-orange-500"
          pointerEvents="none"
        />
        <View
          className="absolute bottom-8 right-8 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-orange-500"
          pointerEvents="none"
        />
      </View>

      {/* Controls */}
      <View className="border-t border-stone-800 bg-stone-900 p-6">
        {/* Guidance Message */}
        <Text className="mb-4 text-center text-stone-400">
          {displayMessage}
        </Text>

        {/* Capture Button */}
        <View className="items-center">
          <Pressable
            onPress={handleCapture}
            disabled={isProcessing}
            className={`h-20 w-20 items-center justify-center rounded-full shadow-lg ${
              isProcessing
                ? "bg-stone-600"
                : "bg-orange-500 active:scale-95 active:bg-orange-600"
            }`}
          >
            <Camera size={32} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

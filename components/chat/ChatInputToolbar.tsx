/**
 * ChatInputToolbar Component
 *
 * Custom input toolbar for AI recipe chat with image attachment and voice input.
 * Integrates with GiftedChat via renderInputToolbar and renderActions props.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  Camera,
  Image as ImageIcon,
  Mic,
  X,
  Send as SendIcon,
  Square,
} from "lucide-react-native";
import { useAudioPermissions } from "@/hooks/voice";
import { MicrophonePermissionModal } from "@/components/voice/MicrophonePermissionModal";
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
} from "expo-audio";

/**
 * Props for ChatInputToolbar component
 */
interface ChatInputToolbarProps {
  /** Whether dark mode is enabled */
  isDark: boolean;
  /** Callback when a message with optional image is ready to send */
  onSendWithImage?: (text: string, imageBase64: string | null) => void;
  /** Callback when voice transcription is complete */
  onVoiceTranscription?: (text: string) => void;
  /** Whether currently waiting for AI response */
  isAiTyping?: boolean;
}

/**
 * Image attachment state
 */
interface ImageAttachment {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

/**
 * Compress image to max width and convert to base64 data URL
 */
async function compressAndEncodeImage(
  uri: string
): Promise<{ uri: string; base64: string; width: number; height: number } | null> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!result.base64) {
      return null;
    }

    return {
      uri: result.uri,
      base64: `data:image/jpeg;base64,${result.base64}`,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Failed to compress image:", error);
    return null;
  }
}

/**
 * Custom input toolbar with image and voice capabilities
 */
export function ChatInputToolbar({
  isDark,
  onSendWithImage,
  onVoiceTranscription,
  isAiTyping = false,
}: ChatInputToolbarProps) {
  // Image attachment state
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Text input state
  const [inputText, setInputText] = useState("");

  // Audio permissions
  const {
    isGranted: hasAudioPermission,
    isDenied: isAudioDenied,
    requestPermission: requestAudioPermission,
  } = useAudioPermissions();

  // Audio recorder setup
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  });

  // Recording duration tracker
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  /**
   * Pick image from camera
   */
  const handleCameraCapture = useCallback(async () => {
    setShowAttachmentMenu(false);

    // Request camera permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setIsProcessingImage(true);
      const compressed = await compressAndEncodeImage(result.assets[0].uri);
      setIsProcessingImage(false);

      if (compressed) {
        setImageAttachment(compressed);
      }
    }
  }, []);

  /**
   * Pick image from gallery
   */
  const handleGalleryPick = useCallback(async () => {
    setShowAttachmentMenu(false);

    // Request media library permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setIsProcessingImage(true);
      const compressed = await compressAndEncodeImage(result.assets[0].uri);
      setIsProcessingImage(false);

      if (compressed) {
        setImageAttachment(compressed);
      }
    }
  }, []);

  /**
   * Remove attached image
   */
  const handleRemoveImage = useCallback(() => {
    setImageAttachment(null);
  }, []);

  /**
   * Start voice recording
   */
  const handleStartRecording = useCallback(async () => {
    // Check permission first
    if (!hasAudioPermission) {
      if (isAudioDenied) {
        setShowPermissionModal(true);
        return;
      }
      const result = await requestAudioPermission();
      if (result !== "granted") {
        return;
      }
    }

    try {
      // Configure audio session
      await AudioModule.setAudioModeAsync({
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
        allowsRecording: true,
      });

      // Start recording
      recorder.record();
      setIsRecording(true);
      setRecordingDuration(0);
      startTimeRef.current = Date.now();

      // Track duration
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - startTimeRef.current);
      }, 100);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, [hasAudioPermission, isAudioDenied, requestAudioPermission, recorder]);

  /**
   * Stop voice recording and process
   */
  const handleStopRecording = useCallback(async () => {
    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    try {
      await recorder.stop();
      setIsRecording(false);

      // For now, voice recording is captured but transcription is pending
      // In a real implementation, this would send audio to a speech-to-text service
      if (onVoiceTranscription) {
        onVoiceTranscription("[Voice message recorded - transcription pending]");
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
    }
  }, [recorder, onVoiceTranscription]);

  /**
   * Handle voice button press
   */
  const handleVoicePress = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  }, [isRecording, handleStartRecording, handleStopRecording]);

  /**
   * Handle send button press
   */
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    const image = imageAttachment?.base64 ?? null;

    if (!text && !image) return;

    if (onSendWithImage) {
      onSendWithImage(text, image);
    }

    // Clear state
    setInputText("");
    setImageAttachment(null);
  }, [inputText, imageAttachment, onSendWithImage]);

  /**
   * Handle permission modal request
   */
  const handleRequestPermission = useCallback(async () => {
    await requestAudioPermission();
    setShowPermissionModal(false);
  }, [requestAudioPermission]);

  /**
   * Format recording duration
   */
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const canSend = (inputText.trim().length > 0 || imageAttachment) && !isAiTyping;

  return (
    <>
      <View
        style={{
          backgroundColor: isDark ? "#1c1917" : "#ffffff",
          borderTopColor: isDark ? "#44403c" : "#e7e5e4",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 16,
          paddingHorizontal: 12,
        }}
      >
        {/* Image Preview */}
        {imageAttachment && (
          <View style={{ marginBottom: 8 }}>
            <View
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                alignSelf: "flex-start",
              }}
            >
              <Image
                source={{ uri: imageAttachment.uri }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
                resizeMode="cover"
              />
              <Pressable
                onPress={handleRemoveImage}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: 12,
                  padding: 4,
                }}
                accessibilityLabel="Remove attached image"
                accessibilityRole="button"
              >
                <X size={14} color="#ffffff" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Processing Indicator */}
        {isProcessingImage && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              gap: 8,
            }}
          >
            <ActivityIndicator size="small" color="#f97316" />
            <Text style={{ color: isDark ? "#a8a29e" : "#78716c", fontSize: 14 }}>
              Processing image...
            </Text>
          </View>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              gap: 8,
              backgroundColor: isDark ? "#292524" : "#f5f5f4",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#ef4444",
              }}
            />
            <Text
              style={{
                color: isDark ? "#fafaf9" : "#1c1917",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Recording {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}

        {/* Input Row */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          {/* Attachment Button */}
          <Pressable
            onPress={() => setShowAttachmentMenu(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? "#292524" : "#f5f5f4",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Attach image"
            accessibilityRole="button"
            disabled={isAiTyping}
          >
            <Camera size={20} color={isDark ? "#a8a29e" : "#78716c"} />
          </Pressable>

          {/* Voice Button */}
          <Pressable
            onPress={handleVoicePress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isRecording
                ? "#ef4444"
                : isDark
                ? "#292524"
                : "#f5f5f4",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel={isRecording ? "Stop recording" : "Start voice input"}
            accessibilityRole="button"
            disabled={isAiTyping && !isRecording}
          >
            {isRecording ? (
              <Square size={16} color="#ffffff" fill="#ffffff" />
            ) : (
              <Mic size={20} color={isDark ? "#a8a29e" : "#78716c"} />
            )}
          </Pressable>

          {/* Text Input */}
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? "#292524" : "#f5f5f4",
              borderRadius: 20,
              paddingHorizontal: 16,
              minHeight: 40,
              justifyContent: "center",
            }}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about recipes..."
              placeholderTextColor={isDark ? "#78716c" : "#a8a29e"}
              style={{
                color: isDark ? "#fafaf9" : "#1c1917",
                fontSize: 16,
                lineHeight: 20,
                paddingVertical: 10,
              }}
              editable={!isAiTyping}
              multiline
              maxLength={2000}
            />
          </View>

          {/* Send Button */}
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: canSend ? "#f97316" : isDark ? "#292524" : "#e7e5e4",
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <SendIcon size={18} color={canSend ? "#ffffff" : isDark ? "#57534e" : "#a8a29e"} />
          </Pressable>
        </View>
      </View>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View
            style={{
              backgroundColor: isDark ? "#1c1917" : "#ffffff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: isDark ? "#fafaf9" : "#1c1917",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Add Image
            </Text>

            <View style={{ gap: 12 }}>
              <Pressable
                onPress={handleCameraCapture}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  backgroundColor: isDark ? "#292524" : "#f5f5f4",
                  borderRadius: 12,
                }}
                accessibilityLabel="Take photo"
                accessibilityRole="button"
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#f9731620",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera size={22} color="#f97316" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: isDark ? "#fafaf9" : "#1c1917",
                    }}
                  >
                    Take Photo
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#a8a29e" : "#78716c",
                    }}
                  >
                    Capture ingredients or dish
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleGalleryPick}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  padding: 16,
                  backgroundColor: isDark ? "#292524" : "#f5f5f4",
                  borderRadius: 12,
                }}
                accessibilityLabel="Choose from gallery"
                accessibilityRole="button"
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#22c55e20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageIcon size={22} color="#22c55e" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: isDark ? "#fafaf9" : "#1c1917",
                    }}
                  >
                    Choose from Gallery
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#a8a29e" : "#78716c",
                    }}
                  >
                    Select an existing photo
                  </Text>
                </View>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowAttachmentMenu(false)}
              style={{
                marginTop: 16,
                padding: 16,
                alignItems: "center",
              }}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: isDark ? "#a8a29e" : "#78716c",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isVisible={showPermissionModal}
        status={isAudioDenied ? "denied" : "undetermined"}
        onRequestPermission={handleRequestPermission}
        onDismiss={() => setShowPermissionModal(false)}
      />
    </>
  );
}

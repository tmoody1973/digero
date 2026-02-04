# Specification: Voice Cooking Assistant

## Goal
Enable hands-free, voice-based interaction with an AI cooking assistant during cook-mode using Google Gemini Live API. Users can ask questions about the recipe, control timers, navigate steps, and get real-time cooking guidance without touching their device.

## Architecture Overview

**Backend WebSocket Proxy Pattern:**
```
Mobile App <--WebSocket--> Voice Proxy Server <--Gemini SDK--> Gemini Live API
```

This architecture:
- Keeps the Gemini API key secure on the backend
- Enables proper bidirectional streaming (Convex does not support WebSockets)
- Allows for rate limiting, logging, and analytics
- Provides a clean separation of concerns

## User Stories
- As a home cook, I want to ask questions about the recipe while cooking so that I can keep my hands clean and focused on the food
- As a user in cook-mode, I want to control timers and navigate steps by voice so that I do not need to touch my phone with dirty hands

## Specific Requirements

**Voice Activation Methods**
- Push-to-talk button always visible in cook-mode UI (primary activation method)
- Wake word activation ("Hey Chef") for fully hands-free operation when enabled
- Toggle between modes available in app settings
- Push-to-talk button positioned in bottom-right corner for easy thumb access
- Wake word detection runs only when cook-mode is active to preserve battery

**Backend WebSocket Proxy Server**
- Node.js server using `ws` package for WebSocket connections
- Uses `@google/genai` SDK to connect to Gemini Live API
- Handles connection lifecycle, audio forwarding, and reconnection
- Runs on configurable port (default: 8080)
- Health check endpoint on separate port (default: 8081)
- Reads EXPO_PUBLIC_GEMINI_API_KEY from environment

**Audio Streaming Libraries**
- Recording: `@siteed/expo-audio-studio` for real-time audio chunk streaming
- Playback: `react-native-audio-api` with BufferQueueSource for smooth streaming
- Both enable real-time bidirectional audio (not file-based like expo-av)

**Mobile WebSocket Client**
- Connects to voice proxy server on cook-mode entry
- Streams audio chunks in real-time using expo-audio-studio
- Receives and plays audio using react-native-audio-api
- Handles reconnection with exponential backoff
- Audio format: 16-bit PCM at 16kHz (input), 24kHz (output)

**Recipe Context Injection**
- Send full recipe context to server at session start
- Context forwarded to Gemini as system instruction
- Include current step number and instruction text with each voice interaction
- Track scaled quantities if user has modified servings via voice command
- Context format as structured JSON for consistent AI understanding

**Voice Commands - Recipe Interaction**
- Answer ingredient questions: "How much butter?", "What spices do I need?"
- Answer technique questions: "How do I know when it's done?", "What temperature?"
- Substitution guidance: "Can I substitute X for Y?"
- Current step queries: "What's the current step?", "Read this step again"

**Voice Commands - Navigation**
- Step navigation: "Next step", "Previous step", "Go to step 5"
- Progress queries: "How many steps left?", "What step am I on?"
- Navigate via voice commands that trigger existing goToStep, goToPrevious, goToNext functions

**Voice Commands - Timer Control**
- Create timers: "Set a timer for 10 minutes", "Start a 5 minute timer"
- Timer queries: "How much time is left?", "Timer status"
- Timer control: "Pause timer", "Resume timer", "Cancel timer"
- Parse time durations using existing timePatterns.ts logic
- Trigger existing handleStartTimer, handleDismissTimer functions

**Voice Commands - Recipe Scaling**
- Scale recipe: "Double the recipe", "Make this for 4 people instead of 2"
- Query scaled amounts: "How much flour for double?"
- Store scaled multiplier in session state for subsequent queries

**Visual Feedback - Voice Activity Indicator**
- Minimal pulsing indicator (small dot or microphone icon) showing voice state
- States: idle (dim), listening (pulsing orange), processing (animated), speaking (solid orange)
- Position in header area near step counter to minimize visual intrusion
- No text transcript displayed per user requirement for reduced clutter

**State Machine - Voice Assistant States**
- Idle: Not listening, WebSocket connected, waiting for activation
- Listening: Microphone active, streaming audio to server
- Processing: Audio sent, waiting for Gemini response
- Speaking: Playing Gemini audio response through speaker
- Error: Connection failed or API error, show recovery option
- Transitions triggered by push-to-talk, wake word, or Gemini response events

**Phone Call Interruption Handling**
- Detect incoming call via audio session interruption events
- Pause voice assistant and mute microphone during call
- Auto-resume listening state when call ends
- Preserve conversation context across interruption

**Network Failure Handling**
- Detect WebSocket disconnection or API timeout
- Show brief toast notification: "Voice assistant offline"
- Automatic reconnection attempts with exponential backoff
- Fallback UI: show text input field for basic commands when offline
- Basic offline commands: next/previous step, start/stop timer (parsed locally)

**Audio Permissions**
- Request microphone permission when user first enables voice feature
- Show clear permission rationale: "Allow microphone access for hands-free cooking assistance"
- Handle permission denial gracefully: disable voice button, show settings link
- Add NSMicrophoneUsageDescription to app.config.ts iOS infoPlist

## Visual Design
No visual mockups provided. Voice-only interface with minimal visual feedback per user requirement.

**UI Elements Required:**
- Push-to-talk floating action button (56x56dp, orange-500, microphone icon)
- Small voice activity indicator (12x12dp pulsing dot in header)
- Wake word toggle in settings screen
- Permission request modal following existing permission UI patterns

## Existing Code to Leverage

**Cook Mode Screen (`/app/(app)/recipes/[id]/cook-mode.tsx`)**
- Already has currentStep state and step navigation functions (goToStep, goToPrevious, goToNext)
- Already has timer state and control functions (handleStartTimer, handleDismissTimer, activeTimer)
- Uses useKeepAwake to prevent screen sleep during cooking
- Recipe data already loaded via useQuery(api.recipes.get)
- Integration point: add VoiceAssistant hook and floating button to this screen

**Time Patterns Utility (`/components/recipes/cook-mode/timePatterns.ts`)**
- detectTimePatterns function parses time strings from text
- parseTimeToSeconds converts "5 minutes" to 300 seconds
- formatSeconds converts seconds back to readable format
- Reuse for parsing voice command time durations

**CountdownTimer Component (`/components/recipes/cook-mode/CountdownTimer.tsx`)**
- Existing timer UI with play/pause/reset controls
- Uses Vibration API for completion alerts
- Voice commands should control this component's state via parent callbacks

**Camera Permissions Pattern (`/components/scanning/CameraViewfinder.tsx`)**
- Shows pattern for requesting permissions with useCameraPermissions hook
- Permission denied UI pattern with "Grant Permission" button
- Follow same UX pattern for microphone permissions

**Gemini API Integration (`/convex/actions/extractRecipeWithGemini.ts`)**
- Existing Gemini API key management via environment variable
- API response parsing patterns
- Voice proxy uses same API key from environment

## Out of Scope
- Voice assistant outside of cook-mode (no global voice search or recipe discovery)
- Offline voice processing (Gemini Live API requires network connection)
- Custom wake word training (use fixed "Hey Chef" wake word)
- Multi-language voice support (English only for MVP)
- Voice-based recipe creation or editing
- Smart home device integration (no "turn on oven" commands)
- Voice assistant for meal planning or shopping lists
- Conversation history persistence across sessions
- Voice assistant settings sync across devices
- Background voice listening when app is backgrounded

## New Files Created

### Backend
- `/server/package.json` - Voice proxy server dependencies
- `/server/index.js` - WebSocket proxy server for Gemini Live API

### Frontend Hooks
- `/hooks/voice/useStreamingAudioRecorder.ts` - Real-time audio streaming with expo-audio-studio
- `/hooks/voice/useStreamingAudioPlayer.ts` - Streaming playback with react-native-audio-api
- `/hooks/voice/useAudioConnection.ts` - Unified WebSocket connection hook

### Dependencies Added
- `@siteed/expo-audio-studio` - Real-time audio streaming
- `react-native-audio-api` - Low-latency audio playback with BufferQueueSource
- `base64-js` - Base64 encoding/decoding for audio data

# Task Breakdown: Voice Cooking Assistant

## Overview

Enable hands-free, voice-based interaction with an AI cooking assistant during cook-mode using Google Gemini Live API via a backend WebSocket proxy.

**Architecture:** Mobile App <--WebSocket--> Voice Proxy Server <--Gemini SDK--> Gemini Live API

**Total Tasks:** 42 subtasks across 5 phases

---

## Phase 1: Foundation (Audio Setup, Permissions, Basic Infrastructure)

### Task Group 1.1: Audio Permissions & Configuration
**Dependencies:** None
**Estimated Effort:** 2-3 hours

- [x] 1.1.0 Complete audio permissions infrastructure
  - [ ] 1.1.1 Write 3-4 focused tests for audio permission handling
    - Test permission request flow triggers correctly
    - Test permission granted state enables voice features
    - Test permission denied state shows fallback UI
    - Test permission rationale modal displays correctly
  - [x] 1.1.2 Add NSMicrophoneUsageDescription to app.config.ts
    - Add to iOS infoPlist: "Allow microphone access for hands-free cooking assistance"
    - Follow existing permission pattern from camera permissions
  - [x] 1.1.3 Create useAudioPermissions hook
    - File: `/hooks/voice/useAudioPermissions.ts`
    - Wrap expo-av Audio.requestPermissionsAsync()
    - Return { status, requestPermission, isGranted, isDenied }
    - Follow pattern from useCameraPermissions in CameraViewfinder.tsx
  - [x] 1.1.4 Create MicrophonePermissionModal component
    - File: `/components/voice/MicrophonePermissionModal.tsx`
    - Match existing permission UI pattern from CameraViewfinder.tsx
    - Include AlertCircle icon, rationale text, "Grant Permission" button
    - Handle denied state with link to system settings
  - [ ] 1.1.5 Verify permission tests pass

**Acceptance Criteria:**
- Microphone permission request works on iOS
- Permission denied shows appropriate fallback UI
- Permission granted enables voice feature access
- NSMicrophoneUsageDescription approved for App Store

---

### Task Group 1.2: Backend WebSocket Proxy Server
**Dependencies:** None (can be done in parallel with 1.1)
**Estimated Effort:** 3-4 hours

- [x] 1.2.0 Complete backend voice proxy server
  - [x] 1.2.1 Create server package.json with dependencies
    - File: `/server/package.json`
    - Dependencies: @google/genai, ws, dotenv
    - Scripts: start, dev (with --watch)
  - [x] 1.2.2 Implement WebSocket proxy server
    - File: `/server/index.js`
    - WebSocket server using `ws` package
    - Connect to Gemini Live API using @google/genai SDK
    - Forward audio bidirectionally between client and Gemini
    - Handle connection lifecycle and errors
  - [x] 1.2.3 Implement message protocol
    - Client -> Server: connect, audio_chunk, end_of_turn, text_message, update_context, disconnect
    - Server -> Client: connected, audio_response, transcription, turn_complete, interrupted, error
  - [x] 1.2.4 Add health check endpoint
    - HTTP server on port 8081
    - Returns health status and config info
  - [x] 1.2.5 Add npm scripts to main package.json
    - voice-proxy, voice-proxy:dev, voice-proxy:install

**Acceptance Criteria:**
- Server starts and connects to Gemini
- Audio forwarded bidirectionally
- Clean shutdown on SIGTERM
- Health check returns status

---

### Task Group 1.3: Streaming Audio Libraries
**Dependencies:** None (can be done in parallel)
**Estimated Effort:** 3-4 hours

- [x] 1.3.0 Install and configure streaming audio libraries
  - [x] 1.3.1 Install @siteed/expo-audio-studio
    - For real-time audio streaming while recording
    - Replaces expo-av for recording (keeps for playback fallback)
  - [x] 1.3.2 Install react-native-audio-api
    - For BufferQueueSource streaming playback
    - Enables gapless audio playback of streaming chunks
  - [x] 1.3.3 Install base64-js
    - For efficient base64 encoding/decoding of audio data
  - [x] 1.3.4 Create useStreamingAudioRecorder hook
    - File: `/hooks/voice/useStreamingAudioRecorder.ts`
    - Uses expo-audio-studio useAudioRecorder
    - Streams audio chunks via callback while recording
    - Handles permissions, start/stop, error states
  - [x] 1.3.5 Create useStreamingAudioPlayer hook
    - File: `/hooks/voice/useStreamingAudioPlayer.ts`
    - Uses react-native-audio-api AudioContext + BufferQueueSource
    - Buffers incoming chunks and flushes when threshold reached
    - Converts PCM int16 to float32 for playback
    - Handles queue management to prevent memory issues

**Acceptance Criteria:**
- Recording streams audio chunks in real-time
- Playback handles streaming audio smoothly
- No memory leaks or crashes with extended use

---

### Task Group 1.4: Voice Assistant State Machine
**Dependencies:** Task Group 1.1
**Estimated Effort:** 2-3 hours

- [x] 1.4.0 Complete voice assistant state machine
  - [ ] 1.4.1 Write 3-4 focused tests for state machine
    - Test state transitions: idle -> listening -> processing -> speaking -> idle
    - Test error state triggers from connection failure
    - Test state resets on dismiss/cancel action
  - [x] 1.4.2 Define VoiceAssistantState type and transitions
    - File: `/types/voice.ts`
    - States: 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
    - Define allowed transitions between states
  - [x] 1.4.3 Create useVoiceAssistantState hook
    - File: `/hooks/voice/useVoiceAssistantState.ts`
    - Manage current state with useReducer
    - Expose: { state, transition, reset, error }
    - Validate transitions against allowed state changes
  - [ ] 1.4.4 Verify state machine tests pass

**Acceptance Criteria:**
- State machine correctly transitions between all 5 states
- Invalid transitions are prevented
- Error state captures error message for display

---

## Phase 2: Gemini Integration (WebSocket Client, Context Management)

### Task Group 2.1: Unified Audio Connection Hook
**Dependencies:** Task Groups 1.2, 1.3, 1.4
**Estimated Effort:** 4-5 hours

- [x] 2.1.0 Complete unified audio connection hook
  - [x] 2.1.1 Create useAudioConnection hook
    - File: `/hooks/voice/useAudioConnection.ts`
    - Combines streaming recorder and player
    - Connects to backend WebSocket proxy
    - Handles connection lifecycle
    - Exposes: connect, disconnect, isConnected, isSpeaking, isListening, status
  - [x] 2.1.2 Implement WebSocket message handling
    - Handle all server message types
    - Route audio_response to player
    - Handle turn_complete and interrupted events
    - Error handling with status updates
  - [x] 2.1.3 Integrate with voice assistant state machine
    - Trigger state transitions on events
    - Pass transition function as option
  - [x] 2.1.4 Update hooks/voice/index.ts exports
    - Export all new hooks
    - Mark legacy hooks as deprecated

**Acceptance Criteria:**
- Hook connects to backend successfully
- Bidirectional audio streaming works
- State transitions triggered correctly
- Clean disconnect on unmount

---

### Task Group 2.2: Recipe Context Management
**Dependencies:** Task Group 2.1
**Estimated Effort:** 2-3 hours

- [x] 2.2.0 Complete recipe context management for AI
  - [ ] 2.2.1 Write 3-4 focused tests for context management
    - Test full recipe context formats correctly as JSON
    - Test current step context updates on step change
    - Test scaled quantities reflect user-modified servings
  - [x] 2.2.2 Create buildRecipeContext utility
    - File: `/lib/voice/recipeContext.ts`
    - Format recipe as structured JSON: title, servings, ingredients[], instructions[]
    - Include current step number and instruction text
    - Include scaled quantities if servings modified
  - [x] 2.2.3 Create useRecipeContext hook
    - File: `/hooks/voice/useRecipeContext.ts`
    - Accept recipe data and currentStep from cook-mode
    - Track scaled multiplier for modified servings
    - Expose: { context, updateStep, scaleRecipe, scaledMultiplier }
  - [ ] 2.2.4 Inject context at session start
    - Send full recipe context when WebSocket session begins
    - Update context with current step on each interaction
  - [ ] 2.2.5 Verify recipe context tests pass

**Acceptance Criteria:**
- Recipe context includes all required fields
- AI receives current step context with each query
- Scaled quantities are correctly calculated and included

---

## Phase 3: Voice Commands (Command Parsing, Timer Control, Navigation)

### Task Group 3.1: Voice Command Parsing
**Dependencies:** Task Group 2.2
**Estimated Effort:** 3-4 hours

- [x] 3.1.0 Complete voice command parsing system
  - [ ] 3.1.1 Write 4-5 focused tests for command parsing
    - Test timer commands: "set timer for 5 minutes", "pause timer", "how much time left"
    - Test navigation commands: "next step", "previous step", "go to step 3"
    - Test scaling commands: "double the recipe", "make for 4 people"
    - Test query commands passed to Gemini without local handling
  - [x] 3.1.2 Create VoiceCommandParser utility
    - File: `/lib/voice/VoiceCommandParser.ts`
    - Define command types: 'timer' | 'navigation' | 'scaling' | 'query'
    - Parse voice text to identify command intent
    - Extract parameters (time duration, step number, scale factor)
  - [x] 3.1.3 Integrate timePatterns.ts for timer parsing
    - Reuse existing parseTimeToSeconds function
    - Parse "5 minutes", "1 hour 30 minutes", etc.
  - [x] 3.1.4 Create command execution dispatcher
    - File: `/lib/voice/commandDispatcher.ts`
    - Route timer commands to timer controls
    - Route navigation commands to step navigation
    - Route queries to Gemini for AI response
  - [ ] 3.1.5 Verify command parsing tests pass

**Acceptance Criteria:**
- Timer commands correctly parsed and time extracted
- Navigation commands correctly identify step number or direction
- Scaling commands extract multiplier
- Unknown commands routed to Gemini as queries

---

### Task Group 3.2: Timer Voice Control
**Dependencies:** Task Group 3.1
**Estimated Effort:** 2-3 hours

- [x] 3.2.0 Complete timer voice control integration
  - [ ] 3.2.1 Write 3-4 focused tests for timer voice control
    - Test "set timer for 10 minutes" calls handleStartTimer(600)
    - Test "pause timer" / "resume timer" controls timer state
    - Test "how much time left" returns remaining seconds
    - Test "cancel timer" calls handleDismissTimer
  - [x] 3.2.2 Create useTimerVoiceControl hook
    - File: `/hooks/voice/useTimerVoiceControl.ts`
    - Accept timer callbacks: handleStartTimer, handleDismissTimer
    - Accept timer state: activeTimer, isRunning, remainingSeconds
    - Expose: { executeTimerCommand, getTimerStatus }
  - [x] 3.2.3 Extend CountdownTimer with voice control interface
    - Add onTick callback to track remaining time
    - Expose remaining time for status queries
    - Use existing timer state from cook-mode.tsx
  - [x] 3.2.4 Generate voice responses for timer actions
    - "Timer set for 10 minutes"
    - "Timer paused"
    - "5 minutes and 30 seconds remaining"
  - [ ] 3.2.5 Verify timer voice control tests pass

**Acceptance Criteria:**
- Voice commands correctly control existing timers
- Timer status queries return accurate remaining time
- Voice feedback confirms timer actions

---

### Task Group 3.3: Step Navigation Voice Control
**Dependencies:** Task Group 3.1
**Estimated Effort:** 2-3 hours

- [x] 3.3.0 Complete step navigation voice control
  - [ ] 3.3.1 Write 3-4 focused tests for navigation voice control
    - Test "next step" calls goToNext
    - Test "previous step" calls goToPrevious
    - Test "go to step 5" calls goToStep(4) (0-indexed)
    - Test "what step am I on" returns current step info
  - [x] 3.3.2 Create useNavigationVoiceControl hook
    - File: `/hooks/voice/useNavigationVoiceControl.ts`
    - Accept navigation callbacks: goToStep, goToPrevious, goToNext
    - Accept state: currentStep, totalSteps
    - Expose: { executeNavigationCommand, getProgressStatus }
  - [x] 3.3.3 Handle navigation edge cases
    - "next step" at last step: "You're on the final step"
    - "previous step" at first step: "You're on the first step"
    - "go to step 100" with only 5 steps: "Recipe only has 5 steps"
  - [x] 3.3.4 Generate voice responses for navigation
    - "Moving to step 3: [step instruction preview]"
    - "You're on step 2 of 8"
    - "3 steps remaining"
  - [ ] 3.3.5 Verify navigation voice control tests pass

**Acceptance Criteria:**
- Voice navigation triggers existing cook-mode functions
- Edge cases handled gracefully with helpful responses
- Progress queries return accurate step information

---

### Task Group 3.4: Recipe Scaling Voice Control
**Dependencies:** Task Group 3.1
**Estimated Effort:** 2-3 hours

- [x] 3.4.0 Complete recipe scaling voice control
  - [ ] 3.4.1 Write 3-4 focused tests for scaling voice control
    - Test "double the recipe" sets multiplier to 2
    - Test "make for 4 people" with base 2 servings sets multiplier to 2
    - Test "how much flour for doubled" returns scaled amount
    - Test "reset to original" clears multiplier
  - [x] 3.4.2 Create useScalingVoiceControl hook
    - File: `/hooks/voice/useScalingVoiceControl.ts`
    - Track scale multiplier in session state
    - Calculate scaled quantities from original ingredients
    - Expose: { executeScalingCommand, scaledMultiplier, getScaledIngredient }
  - [x] 3.4.3 Integrate scaling with recipe context
    - Update recipe context with scaled quantities
    - AI responses reflect scaled amounts
  - [x] 3.4.4 Generate voice responses for scaling
    - "Recipe doubled. All quantities have been adjusted."
    - "For the doubled recipe, you need 2 cups of flour"
  - [ ] 3.4.5 Verify scaling voice control tests pass

**Acceptance Criteria:**
- Scaling multiplier correctly calculated from voice command
- Scaled quantities accurately computed
- AI context updated with scaled amounts

---

## Phase 4: UX Polish (Wake Word, Visual Feedback, Error Handling)

### Task Group 4.1: Push-to-Talk UI
**Dependencies:** Task Groups 3.2, 3.3, 3.4
**Estimated Effort:** 2-3 hours

- [x] 4.1.0 Complete push-to-talk UI
  - [ ] 4.1.1 Write 3-4 focused tests for push-to-talk
    - Test button tap starts listening state
    - Test button release stops listening
    - Test button disabled during processing/speaking states
    - Test button position in bottom-right corner
  - [x] 4.1.2 Create PushToTalkButton component
    - File: `/components/voice/PushToTalkButton.tsx`
    - Size: 56x56dp floating action button
    - Color: orange-500 with microphone icon
    - Position: absolute bottom-right with safe area padding
    - States: idle, listening (pressed), disabled (processing/speaking)
  - [x] 4.1.3 Implement press-and-hold interaction
    - onPressIn: start listening
    - onPressOut: stop listening and send to Gemini
    - Visual feedback: scale animation, color change on press
  - [x] 4.1.4 Integrate into cook-mode.tsx
    - Add PushToTalkButton to cook-mode screen
    - Wire to voice assistant state machine
    - Position above navigation buttons
  - [ ] 4.1.5 Verify push-to-talk tests pass

**Acceptance Criteria:**
- Push-to-talk button visible and accessible in cook-mode
- Press-and-hold correctly activates/deactivates listening
- Visual feedback clearly indicates active state
- Button positioned for easy thumb access

---

### Task Group 4.2: Voice Activity Indicator
**Dependencies:** Task Group 4.1
**Estimated Effort:** 2-3 hours

- [x] 4.2.0 Complete voice activity indicator
  - [ ] 4.2.1 Write 3-4 focused tests for voice indicator
    - Test indicator shows correct state: idle, listening, processing, speaking
    - Test pulsing animation during listening state
    - Test indicator position in header area
  - [x] 4.2.2 Create VoiceActivityIndicator component
    - File: `/components/voice/VoiceActivityIndicator.tsx`
    - Size: 12x12dp dot or small microphone icon
    - Position: header area near step counter
    - States with colors:
      - idle: dim gray (stone-600)
      - listening: pulsing orange (orange-500)
      - processing: animated spinner (orange-500)
      - speaking: solid orange (orange-500)
  - [x] 4.2.3 Implement state animations
    - Listening: smooth pulse animation (scale 1.0 -> 1.2 -> 1.0)
    - Processing: rotating spinner or dots animation
    - Use React Native Animated or Reanimated
  - [x] 4.2.4 Add indicator to cook-mode header
    - Position in header between close button and step counter
    - Minimal visual footprint per spec requirement
  - [ ] 4.2.5 Verify voice indicator tests pass

**Acceptance Criteria:**
- Indicator clearly shows current voice assistant state
- Animations smooth and non-distracting
- Minimal visual intrusion in cook-mode UI

---

### Task Group 4.3: Wake Word Detection
**Dependencies:** Task Group 4.1
**Estimated Effort:** 4-5 hours

- [ ] 4.3.0 Complete wake word detection
  - [ ] 4.3.1 Write 3-4 focused tests for wake word
    - Test "Hey Chef" activates listening
    - Test wake word detection only active in cook-mode
    - Test wake word toggle in settings controls feature
    - Test battery impact (detection pauses when not in cook-mode)
  - [ ] 4.3.2 Research and select wake word detection library
    - Options: react-native-porcupine, custom VAD + simple keyword matching
    - Consider: accuracy, battery impact, licensing
    - Document selection rationale
  - [ ] 4.3.3 Create useWakeWordDetection hook
    - File: `/hooks/voice/useWakeWordDetection.ts`
    - Wake word: "Hey Chef"
    - Start detection only when cook-mode active and feature enabled
    - Expose: { isListening, enable, disable, onWakeWordDetected }
  - [ ] 4.3.4 Add wake word toggle to settings
    - File: Update settings screen with toggle
    - Default: off (push-to-talk is primary)
    - Persist preference with AsyncStorage
  - [ ] 4.3.5 Integrate wake word with voice assistant
    - Wake word detection triggers transition to listening state
    - Same flow as push-to-talk after activation
  - [ ] 4.3.6 Verify wake word tests pass

**Acceptance Criteria:**
- "Hey Chef" reliably activates voice assistant
- Detection only runs during cook-mode
- Battery impact acceptable (detection pauses appropriately)
- Users can toggle feature in settings

**Risk Flags:**
- Wake word accuracy varies by library and device
- Battery consumption needs testing on real device
- May require custom wake word model training

---

### Task Group 4.4: Error Handling & Offline Fallback
**Dependencies:** Task Groups 4.1, 4.2
**Estimated Effort:** 3-4 hours

- [x] 4.4.0 Complete error handling and offline fallback
  - [ ] 4.4.1 Write 4-5 focused tests for error handling
    - Test network disconnection shows toast notification
    - Test offline fallback shows text input field
    - Test basic offline commands work (next/previous step, timer)
    - Test reconnection attempt after network restored
  - [x] 4.4.2 Create offline command parser
    - File: `/lib/voice/offlineCommands.ts`
    - Parse text input for basic commands locally
    - Support: "next", "previous", "start timer", "stop timer"
    - No AI queries in offline mode
  - [x] 4.4.3 Create OfflineFallbackInput component
    - File: `/components/voice/OfflineFallbackInput.tsx`
    - Text input field for typed commands
    - Only visible when voice assistant offline
    - Position: bottom of screen, replaces push-to-talk button
  - [ ] 4.4.4 Implement toast notifications for connection status
    - "Voice assistant offline" on disconnect
    - "Voice assistant connected" on reconnect
    - Use existing toast/notification pattern if available
  - [ ] 4.4.5 Handle API errors gracefully
    - Gemini API timeout: retry once, then show error
    - Rate limiting: show "Try again in a moment"
    - Authentication error: log and surface to user
  - [ ] 4.4.6 Verify error handling tests pass

**Acceptance Criteria:**
- Users informed when voice assistant offline
- Basic navigation/timer still works offline
- Automatic reconnection when network restored
- Errors shown clearly without crashing app

---

## Phase 5: Testing & Edge Cases (Interruptions, Network Failures)

### Task Group 5.1: Phone Call Interruption Handling
**Dependencies:** Task Group 4.4
**Estimated Effort:** 2-3 hours

- [ ] 5.1.0 Complete phone call interruption handling
  - [ ] 5.1.1 Write 3-4 focused tests for interruption handling
    - Test incoming call pauses voice assistant
    - Test microphone muted during call
    - Test voice assistant auto-resumes after call ends
    - Test conversation context preserved across interruption
  - [ ] 5.1.2 Create useAudioInterruption hook
    - File: `/hooks/voice/useAudioInterruption.ts`
    - Listen for audio session interruption events (expo-av)
    - Detect interruption start (incoming call)
    - Detect interruption end (call ended)
  - [ ] 5.1.3 Implement interruption handling logic
    - On interruption: pause voice assistant, mute mic, preserve state
    - On interruption end: resume listening state, unmute mic
    - Maintain WebSocket connection during brief interruptions
  - [ ] 5.1.4 Verify interruption tests pass

**Acceptance Criteria:**
- Voice assistant pauses automatically during calls
- Resumes correctly after call ends
- No audio recorded during phone call
- Conversation context maintained

---

### Task Group 5.2: Voice Assistant Integration Hook
**Dependencies:** Task Groups 5.1, 3.2, 3.3, 3.4, 2.2
**Estimated Effort:** 3-4 hours

- [x] 5.2.0 Complete unified voice assistant hook
  - [ ] 5.2.1 Write 4-5 focused integration tests
    - Test full flow: push-to-talk -> listen -> process -> speak -> idle
    - Test voice command executes correct action (timer, navigation)
    - Test AI query returns relevant recipe response
    - Test state correctly wired to cook-mode.tsx
  - [x] 5.2.2 Create useVoiceAssistant hook
    - File: `/hooks/voice/useVoiceAssistant.ts`
    - Compose all voice hooks: audio, state, commands
    - Accept cook-mode callbacks and state
    - Expose unified API for cook-mode integration
  - [x] 5.2.3 Wire useVoiceAssistant to cook-mode.tsx
    - File: Update `/app/(app)/recipes/[id]/cook-mode.tsx`
    - Initialize voice assistant with recipe data
    - Pass timer and navigation callbacks
    - Connect to push-to-talk button and indicator
  - [x] 5.2.4 Handle voice assistant lifecycle
    - Start: when cook-mode mounts and permissions granted
    - Stop: when cook-mode unmounts
    - Cleanup: disconnect WebSocket, stop audio
  - [ ] 5.2.5 Verify integration tests pass

**Acceptance Criteria:**
- Voice assistant fully functional in cook-mode
- All voice commands work end-to-end
- Clean startup and shutdown lifecycle
- No memory leaks or orphaned connections

---

### Task Group 5.3: Test Review & Gap Analysis
**Dependencies:** Task Groups 5.1, 5.2
**Estimated Effort:** 2-3 hours

- [ ] 5.3.0 Review existing tests and fill critical gaps
  - [ ] 5.3.1 Review tests from all task groups
    - Phase 1 tests: permissions, audio recording/playback, state machine
    - Phase 2 tests: WebSocket connection, recipe context
    - Phase 3 tests: command parsing, timer/nav/scaling control
    - Phase 4 tests: push-to-talk, indicator, wake word, offline
    - Phase 5 tests: interruption, integration
    - Estimated total: 50-60 tests
  - [ ] 5.3.2 Analyze test coverage gaps for voice assistant feature
    - Identify critical user workflows without test coverage
    - Focus on end-to-end flows: user speaks -> action happens
    - Prioritize integration points between hooks
  - [ ] 5.3.3 Write up to 8 additional strategic tests
    - Fill gaps in end-to-end workflow coverage
    - Test error recovery paths
    - Test edge cases only if business-critical
  - [ ] 5.3.4 Run all voice assistant feature tests
    - Run only tests related to this feature
    - Verify all critical workflows pass
    - Document any known limitations

**Acceptance Criteria:**
- All feature-specific tests pass
- Critical user workflows covered
- End-to-end flows verified
- Test documentation complete

---

## Execution Order

**Recommended implementation sequence:**

```
Phase 1: Foundation (can be parallelized)
  1.1 Audio Permissions (no deps)
  1.2 Backend WebSocket Proxy (no deps) [DONE]
  1.3 Streaming Audio Libraries (no deps) [DONE]
  1.4 State Machine (depends on 1.1)

Phase 2: Gemini Integration
  2.1 Audio Connection Hook (depends on 1.2, 1.3, 1.4) [DONE]
  2.2 Recipe Context (depends on 2.1)

Phase 3: Voice Commands
  3.1 Command Parsing (depends on 2.2) [DONE]
  3.2 Timer Control (depends on 3.1) [DONE]
  3.3 Navigation Control (depends on 3.1) [DONE]
  3.4 Scaling Control (depends on 3.1) [DONE]

Phase 4: UX Polish
  4.1 Push-to-Talk UI (depends on 3.2, 3.3, 3.4) [DONE - Integrated]
  4.2 Voice Indicator (depends on 4.1) [DONE - Integrated]
  4.3 Wake Word (depends on 4.1)
  4.4 Error Handling (depends on 4.1, 4.2) [DONE - Components created]

Phase 5: Testing & Polish
  5.1 Interruption Handling (depends on 4.4)
  5.2 Integration Hook (depends on 5.1) [DONE - Integrated]
  5.3 Test Review (depends on 5.2)
```

---

## Files Created/Modified

### New Files - Backend
| File Path | Description |
|-----------|-------------|
| `/server/package.json` | Voice proxy server dependencies |
| `/server/index.js` | WebSocket proxy server for Gemini Live API |

### New Files - Frontend Hooks
| File Path | Description |
|-----------|-------------|
| `/hooks/voice/useStreamingAudioRecorder.ts` | Real-time audio streaming with expo-audio-studio |
| `/hooks/voice/useStreamingAudioPlayer.ts` | Streaming playback with react-native-audio-api |
| `/hooks/voice/useAudioConnection.ts` | Unified WebSocket connection hook |
| `/hooks/voice/useTimerVoiceControl.ts` | Timer command execution |
| `/hooks/voice/useNavigationVoiceControl.ts` | Navigation command execution |
| `/hooks/voice/useScalingVoiceControl.ts` | Scaling command execution |
| `/hooks/voice/useWakeWordDetection.ts` | Wake word detection |
| `/hooks/voice/useAudioInterruption.ts` | Phone call interruption handling |
| `/hooks/voice/useVoiceAssistant.ts` | Unified voice assistant hook |

### New Files - Libraries
| File Path | Description |
|-----------|-------------|
| `/lib/voice/VoiceCommandParser.ts` | Voice command parsing |
| `/lib/voice/commandDispatcher.ts` | Command routing |
| `/lib/voice/offlineCommands.ts` | Offline command parsing |

### New Files - Components
| File Path | Description |
|-----------|-------------|
| `/components/voice/MicrophonePermissionModal.tsx` | Permission request UI |
| `/components/voice/PushToTalkButton.tsx` | Push-to-talk FAB |
| `/components/voice/VoiceActivityIndicator.tsx` | State indicator |
| `/components/voice/OfflineFallbackInput.tsx` | Offline text input |

### Modified Files
| File Path | Changes |
|-----------|---------|
| `/package.json` | Added audio libraries and voice-proxy scripts |
| `/hooks/voice/index.ts` | Export all new hooks |
| `/app.config.ts` | Add NSMicrophoneUsageDescription to iOS infoPlist |
| `/app/(app)/recipes/[id]/cook-mode.tsx` | Add voice assistant integration |
| `/components/recipes/cook-mode/CountdownTimer.tsx` | Add onTick callback for timer tracking |
| Settings screen (TBD) | Add wake word toggle |

---

## Key Technical Decisions

1. **Backend Proxy Architecture**: WebSocket proxy server handles Gemini connection
   - Keeps API key secure on backend
   - Enables proper bidirectional streaming (Convex does not support WebSockets)
   - Provides flexibility for rate limiting, analytics, logging

2. **Audio Libraries**:
   - `@siteed/expo-audio-studio` for streaming recording (chunks while recording)
   - `react-native-audio-api` for BufferQueueSource playback (gapless streaming)
   - Both replace file-based expo-av for real-time use cases

3. **Audio Format**: 16-bit PCM, 16kHz input, 24kHz output
4. **State Management**: useReducer-based state machine for voice states
5. **Offline Mode**: Basic command parsing locally, full AI requires network
6. **Wake Word**: "Hey Chef" - library TBD based on research
7. **Visual Feedback**: Minimal 12x12dp indicator to reduce visual clutter

---

## Dependencies on Existing Code

| Existing File | Reused Functionality |
|---------------|---------------------|
| `cook-mode.tsx` | goToStep, goToPrevious, goToNext, handleStartTimer, handleDismissTimer |
| `timePatterns.ts` | parseTimeToSeconds, detectTimePatterns |
| `CountdownTimer.tsx` | Timer UI and state management |
| `CameraViewfinder.tsx` | Permission request UI pattern |
| `extractRecipeWithGemini.ts` | Gemini API key management pattern |

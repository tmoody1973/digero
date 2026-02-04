# Spec Requirements: Voice Cooking Assistant

## Initial Description

Add voice-based AI assistant for cooking using Google Gemini Live API. While in cook-mode, users can have a hands-free conversation with an AI that knows the full recipe context. They can ask questions like 'what's the next step?', 'how much butter?', 'can I substitute X for Y?', 'how do I know when it's done?' etc. This solves the problem of not being able to touch your phone while cooking with dirty/wet hands.

## Requirements Discussion

### First Round Questions

**Q1:** How should users activate the voice assistant? Push-to-talk button, always-listening with wake word (e.g., "Hey Chef"), or both options?
**Answer:** BOTH - Push-to-talk button AND always-listening with wake word

**Q2:** Should the AI be context-aware of the current recipe step, or just know the full recipe? (Context-aware would let it proactively say "Looks like you're on step 3, the butter should be melted by now")
**Answer:** YES - AI knows current step and can walk user through recipe, answer substitution questions, etc.

**Q3:** Should there be visual feedback when the AI is listening/responding (e.g., animated waveform), or should this be entirely voice-only to minimize screen interaction?
**Answer:** Voice-only (no text transcript to reduce clutter)

**Q4:** Should voice commands be able to control timers, navigate steps, and scale recipe quantities, or just answer questions about the recipe?
**Answer:** YES to all - timer control, step navigation, recipe scaling

**Q5:** How should we handle edge cases like phone calls interrupting, music playing in background, or network drops mid-conversation?
**Answer:**
- Phone call: pause and resume
- Music playing: still work (don't require pausing)
- Network drops: fallback to text mode

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Cook Mode Screen - Path: `/Users/tarikmoody/Documents/Projects/digero/app/(app)/recipes/[id]/cook-mode.tsx`
  - Full-screen step-by-step cooking view with large text and timers
  - Already has step navigation (goToStep, goToPrevious, goToNext functions)
  - Already has timer control (handleStartTimer, handleDismissTimer functions)
  - Uses expo-keep-awake to keep screen on during cooking
  - Has currentStep state tracking which step user is on

- Components to potentially reuse:
  - `/Users/tarikmoody/Documents/Projects/digero/components/recipes/cook-mode/CountdownTimer.tsx` - Timer with start/pause/reset controls
  - `/Users/tarikmoody/Documents/Projects/digero/components/recipes/cook-mode/StepProgressBar.tsx` - Progress indicator
  - `/Users/tarikmoody/Documents/Projects/digero/components/recipes/cook-mode/timePatterns.ts` - Time detection from instruction text

- Backend logic to reference:
  - Existing Gemini API integration for cookbook scanning and recipe extraction
  - Recipe data model with ingredients and instructions arrays

### Follow-up Questions

No follow-up questions were needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - Voice-only interface with minimal visual feedback (no text transcript per user requirement).

## Requirements Summary

### Functional Requirements

**Voice Activation:**
- Push-to-talk button visible in cook mode UI
- Always-listening mode with wake word activation (wake word TBD - likely "Hey Chef" or similar)
- Users can toggle between modes in settings

**Context-Aware AI Conversation:**
- AI receives full recipe context (title, ingredients with quantities, all instructions)
- AI knows current step user is on
- AI can answer questions like:
  - "What's the next step?"
  - "How much butter do I need?"
  - "Can I substitute X for Y?"
  - "How do I know when it's done?"
  - "What temperature should the oven be?"
  - "Go back to the previous step"

**Voice Controls:**
- Timer control: "Set a timer for 10 minutes", "Pause timer", "How much time is left?"
- Step navigation: "Next step", "Previous step", "Go to step 5", "Read this step again"
- Recipe scaling: "Double the recipe", "Make this for 4 people instead of 2"

**Visual Feedback:**
- Minimal visual indicator showing voice assistant is active/listening (e.g., small pulsing dot or icon)
- No text transcript of conversation to reduce visual clutter
- Voice responses only

**Edge Case Handling:**
- Phone call interruption: Pause voice assistant, resume automatically when call ends
- Background music: Voice assistant should work alongside music (use audio ducking if supported)
- Network drop: Gracefully fallback to text-based mode with offline-capable basic commands

### Reusability Opportunities

**Existing Components:**
- Cook mode screen (`cook-mode.tsx`) already has the step navigation and timer infrastructure
- CountdownTimer component can be voice-controlled
- timePatterns.ts for parsing time durations from voice commands

**Existing APIs:**
- Gemini API already integrated for cookbook scanning - can leverage for voice conversation
- Recipe data model has structured ingredients/instructions for context injection

**New Components Needed:**
- Voice assistant hook/context for managing Gemini Live API connection
- Audio input handling (microphone permissions, audio stream)
- Wake word detection module
- Audio output handling (text-to-speech from Gemini Live)
- Voice activity indicator component

### Scope Boundaries

**In Scope:**
- Voice assistant integration in cook mode only (not global)
- Gemini Live API integration for real-time voice conversation
- Push-to-talk and wake word activation methods
- Voice control for timers, step navigation, recipe scaling
- Context-aware responses based on current recipe and step
- Phone call interruption handling
- Background music compatibility
- Network failure fallback to text mode
- Minimal visual feedback (activity indicator only, no transcript)

**Out of Scope:**
- Voice assistant outside of cook mode (e.g., recipe search by voice)
- Offline voice processing (requires network for Gemini Live API)
- Custom wake word training
- Multi-language voice support (English only for MVP)
- Voice-based recipe creation/editing
- Integration with smart home devices (e.g., "turn on the oven")
- Voice assistant for meal planning or shopping lists

### Technical Considerations

**Gemini Live API Requirements:**
- Real-time bidirectional audio streaming
- Session management for conversation context
- Audio input format compatibility (sample rate, encoding)
- Audio output playback handling

**React Native / Expo Specifics:**
- expo-av or react-native-audio-api for audio recording/playback
- Audio session configuration to work alongside background music
- Proper audio focus handling for phone calls
- Microphone permissions (already may be granted for cookbook scanning camera)

**State Management:**
- Voice assistant state (inactive, listening, processing, speaking)
- Conversation context (recipe, current step, scaled quantities if modified)
- Timer state synchronization between voice commands and UI

**Performance Considerations:**
- Audio streaming latency
- Keep-awake already handled by cook mode
- Battery usage from continuous listening in wake word mode

**Integration Points:**
- Inject into existing cook mode screen
- Hook into existing goToStep, goToPrevious, goToNext functions
- Hook into existing timer controls (handleStartTimer, handleDismissTimer)
- Access recipe data from existing useQuery hook

**Technology Stack (from CLAUDE.md):**
- Framework: React Native + Expo SDK 52+
- Navigation: expo-router (file-based)
- Backend: Convex (real-time database)
- AI: Google Gemini API (extend to Gemini Live)
- Styling: NativeWind (Tailwind for RN)

# Voice Proxy Server

WebSocket proxy server for Gemini Live API integration with the Digero cooking app.

## Architecture

```
Mobile App <--WebSocket--> Voice Proxy Server <--Gemini SDK--> Gemini Live API
```

This server acts as a proxy between the mobile app and Google's Gemini Live API:
- Keeps the Gemini API key secure on the backend
- Enables proper bidirectional audio streaming
- Provides flexibility for rate limiting and analytics

## Setup

1. Install dependencies:
```bash
npm install
# or from root:
npm run voice-proxy:install
```

2. Ensure your `.env.local` in the project root contains:
```
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

3. Start the server:
```bash
npm start
# or from root:
npm run voice-proxy
```

For development with auto-restart:
```bash
npm run dev
# or from root:
npm run voice-proxy:dev
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `EXPO_PUBLIC_GEMINI_API_KEY` | - | Gemini API key (required) |
| `VOICE_PROXY_PORT` | 8080 | WebSocket server port |
| `VOICE_PROXY_HEALTH_PORT` | 8081 | Health check HTTP port |

## Message Protocol

### Client -> Server

| Type | Fields | Description |
|------|--------|-------------|
| `connect` | `systemInstruction?: string` | Initialize Gemini session |
| `audio_chunk` | `data: string` | Base64 PCM audio chunk |
| `end_of_turn` | - | Signal end of user speech |
| `text_message` | `text: string` | Send text instead of audio |
| `update_context` | `systemInstruction: string` | Update recipe context |
| `disconnect` | - | Close session |

### Server -> Client

| Type | Fields | Description |
|------|--------|-------------|
| `connected` | `message: string` | Gemini session established |
| `audio_response` | `data: string` | Base64 PCM audio from Gemini |
| `transcription` | `text: string` | Text transcription |
| `turn_complete` | - | Gemini finished speaking |
| `interrupted` | - | User interrupted Gemini |
| `error` | `message: string` | Error occurred |

## Health Check

```bash
curl http://localhost:8081/health
```

Returns:
```json
{
  "status": "healthy",
  "apiKeyConfigured": true,
  "port": 8080
}
```

## Mobile App Configuration

Set the WebSocket URL in the mobile app:

```typescript
// For iOS simulator
const BACKEND_URL = 'ws://localhost:8080';

// For Android emulator
const BACKEND_URL = 'ws://10.0.2.2:8080';

// For physical device on same network
const BACKEND_URL = 'ws://YOUR_COMPUTER_IP:8080';
```

Or set the environment variable:
```
EXPO_PUBLIC_VOICE_PROXY_URL=ws://YOUR_IP:8080
```

## Audio Format

- **Input (from mobile)**: 16-bit PCM, 16kHz, mono
- **Output (from Gemini)**: 16-bit PCM, 24kHz, mono

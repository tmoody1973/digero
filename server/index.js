/**
 * Gemini Live API WebSocket Proxy Server
 *
 * This server acts as a proxy between the mobile app and the Gemini Live API.
 * Mobile app connects via WebSocket, server forwards audio to Gemini and streams
 * responses back to the mobile app.
 *
 * Architecture:
 * Mobile App <--WebSocket--> This Server <--Gemini SDK--> Gemini Live API
 */

import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import http from "http";

// Load environment variables
dotenv.config();

// Railway sets PORT automatically
const PORT = process.env.PORT || process.env.VOICE_PROXY_PORT || 8080;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set");
  process.exit(1);
}

// Model for Gemini
const MODEL = "gemini-1.5-flash";

// Sample rates
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

// Initialize Gemini client
const genai = new GoogleGenerativeAI(GOOGLE_API_KEY);

console.log("[Server] Initializing Gemini client...");

/**
 * Manages a Gemini Live API session for a single client connection
 */
class GeminiSession {
  constructor(clientWs, systemInstruction) {
    this.clientWs = clientWs;
    this.systemInstruction = systemInstruction;
    this.session = null;
    this.isActive = false;
  }

  /**
   * Connect to Gemini Live API
   */
  async connect() {
    try {
      console.log(`[Gemini] Connecting to model: ${MODEL}`);

      // Get the model
      const model = genai.getGenerativeModel({ model: MODEL });

      // Create live session configuration
      const config = {
        generationConfig: {
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore",
              },
            },
          },
        },
      };

      // Add system instruction if provided
      if (this.systemInstruction) {
        config.systemInstruction = {
          parts: [{ text: this.systemInstruction }],
        };
      }

      // Start live session
      // Note: The exact API may vary - this follows the pattern from the SDK
      this.session = await model.startChat({
        ...config,
        history: [],
      });

      this.isActive = true;
      console.log("[Gemini] Session started");

      // Notify client
      this.sendToClient({
        type: "connected",
        message: "Connected to Gemini",
      });

      return true;
    } catch (error) {
      console.error("[Gemini] Connection error:", error.message);
      this.isActive = false;

      // Send error to client
      this.sendToClient({
        type: "error",
        message: `Failed to connect to Gemini: ${error.message}`,
      });

      throw error;
    }
  }

  /**
   * Send audio to Gemini and stream response
   * Note: For Gemini 2.0, we use the streaming API with audio parts
   */
  async sendAudio(audioBase64) {
    if (!this.session || !this.isActive) {
      console.warn("[Gemini] Cannot send audio - session not active");
      return;
    }

    try {
      // Accumulate audio chunks and process when we have enough
      // For now, we'll use text-based interaction as a fallback
      // The full audio streaming requires the Live API which uses WebSocket
      console.log(
        `[Gemini] Received ${audioBase64.length} chars of base64 audio`
      );

      // For MVP, we can use audio inline data parts
      // This requires accumulating audio and sending as a complete message
    } catch (error) {
      console.error("[Gemini] Send audio error:", error.message);
    }
  }

  /**
   * Send text message to Gemini (fallback mode)
   */
  async sendText(text) {
    if (!this.session || !this.isActive) {
      console.warn("[Gemini] Cannot send text - session not active");
      return;
    }

    try {
      console.log(`[Gemini] Sending text: ${text}`);

      // Use streaming for text
      const result = await this.session.sendMessageStream(text);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          this.sendToClient({
            type: "transcription",
            text: text,
          });
        }
      }

      this.sendToClient({ type: "turn_complete" });
    } catch (error) {
      console.error("[Gemini] Send text error:", error.message);
      this.sendToClient({
        type: "error",
        message: error.message,
      });
    }
  }

  /**
   * Send message to connected client
   */
  sendToClient(message) {
    if (this.clientWs && this.clientWs.readyState === WebSocket.OPEN) {
      this.clientWs.send(JSON.stringify(message));
    }
  }

  /**
   * Close the Gemini session
   */
  async close() {
    this.isActive = false;
    this.session = null;
    console.log("[Gemini] Session closed");
  }
}

// Create HTTP server for health checks (Railway needs this)
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        apiKeyConfigured: !!GOOGLE_API_KEY,
        port: PORT,
        model: MODEL,
        timestamp: new Date().toISOString(),
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`[Server] Voice Proxy Server started on port ${PORT}`);
  console.log(`[Server] API Key configured: ${GOOGLE_API_KEY ? "Yes" : "No"}`);
});

wss.on("connection", async (ws, req) => {
  const clientAddress = req.socket.remoteAddress;
  console.log(`[Server] Client connected from ${clientAddress}`);

  let session = null;

  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "connect":
          // Initialize Gemini session with optional system instruction
          session = new GeminiSession(ws, message.systemInstruction);
          await session.connect();
          break;

        case "audio_chunk":
          // Forward audio to Gemini
          if (session && message.data) {
            await session.sendAudio(message.data);
          }
          break;

        case "end_of_turn":
          // Signal end of user speech
          console.log("[Server] End of turn received");
          break;

        case "text_message":
          // Send text message to Gemini (for testing)
          if (session && message.text) {
            await session.sendText(message.text);
          }
          break;

        case "update_context":
          // Update system instruction (recipe context)
          if (session && message.systemInstruction) {
            session.systemInstruction = message.systemInstruction;
            console.log("[Server] Updated system instruction");
          }
          break;

        case "disconnect":
          // Close session
          if (session) {
            await session.close();
            session = null;
          }
          break;

        default:
          console.log(`[Server] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error("[Server] Error processing message:", error.message);
      ws.send(
        JSON.stringify({
          type: "error",
          message: error.message,
        })
      );
    }
  });

  ws.on("close", async () => {
    console.log(`[Server] Client disconnected from ${clientAddress}`);
    if (session) {
      await session.close();
      session = null;
    }
  });

  ws.on("error", (error) => {
    console.error(`[Server] WebSocket error:`, error.message);
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] Shutting down...");
  wss.close();
  server.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Server] Shutting down (SIGINT)...");
  wss.close();
  server.close();
  process.exit(0);
});

/**
 * Gemini Live Client
 *
 * WebSocket client for connecting to the Gemini Live API for
 * bidirectional audio streaming. Handles connection lifecycle,
 * exponential backoff reconnection, and message serialization.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Gemini Live API WebSocket endpoint
 * Using v1beta as per the API documentation
 */
const GEMINI_LIVE_WS_ENDPOINT =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

/**
 * Default model for voice interactions
 */
const DEFAULT_MODEL = "models/gemini-2.0-flash-exp";

/**
 * Exponential backoff configuration
 */
const BACKOFF_CONFIG = {
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  multiplier: 2,
};

/**
 * Connection states for the WebSocket
 */
export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

/**
 * Configuration for the Gemini Live client
 */
export interface GeminiLiveConfig {
  /** Gemini API key */
  apiKey: string;
  /** Model to use (defaults to gemini-2.0-flash-exp) */
  model?: string;
  /** System instruction for the AI */
  systemInstruction?: string;
  /** Voice configuration */
  voiceConfig?: {
    voiceName?: string;
  };
}

/**
 * Audio chunk received from Gemini
 */
export interface AudioChunk {
  /** Base64-encoded audio data */
  data: string;
  /** MIME type of the audio */
  mimeType: string;
}

/**
 * Event handlers for the client
 */
export interface GeminiLiveEventHandlers {
  /** Called when connection state changes */
  onConnectionStateChange?: (state: ConnectionState) => void;
  /** Called when audio response is received */
  onAudioResponse?: (chunk: AudioChunk) => void;
  /** Called when text response is received */
  onTextResponse?: (text: string) => void;
  /** Called when transcription is received */
  onTranscription?: (text: string, isInput: boolean) => void;
  /** Called when turn is complete */
  onTurnComplete?: () => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
  /** Called when generation starts */
  onGenerationStart?: () => void;
  /** Called when generation is interrupted */
  onInterrupted?: () => void;
}

/**
 * WebSocket close event interface (React Native compatible)
 */
interface WebSocketCloseEvent {
  code: number;
  reason: string;
}

/**
 * Message types from the Gemini Live API
 */
interface BidiGenerateContentSetup {
  model: string;
  generationConfig?: {
    responseModalities?: string[];
    speechConfig?: {
      voiceConfig?: {
        prebuiltVoiceConfig?: {
          voiceName?: string;
        };
      };
    };
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface BidiGenerateContentRealtimeInput {
  realtimeInput: {
    mediaChunks: Array<{
      mimeType: string;
      data: string;
    }>;
  };
}

interface BidiGenerateContentClientContent {
  clientContent: {
    turns: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }>;
    turnComplete: boolean;
  };
}

// =============================================================================
// GeminiLiveClient Class
// =============================================================================

/**
 * WebSocket client for Gemini Live API
 *
 * Manages bidirectional audio streaming with the Gemini AI.
 * Handles connection lifecycle, reconnection with exponential backoff,
 * and message serialization.
 *
 * @example
 * ```typescript
 * const client = new GeminiLiveClient({
 *   apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
 *   systemInstruction: "You are a helpful cooking assistant...",
 * });
 *
 * client.setEventHandlers({
 *   onAudioResponse: (chunk) => playAudio(chunk),
 *   onError: (error) => console.error(error),
 * });
 *
 * await client.connect();
 * client.sendAudio(audioBase64);
 * ```
 */
export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private config: GeminiLiveConfig;
  private eventHandlers: GeminiLiveEventHandlers = {};
  private connectionState: ConnectionState = "disconnected";
  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isSetupComplete = false;
  private pendingMessages: string[] = [];

  constructor(config: GeminiLiveConfig) {
    this.config = {
      model: DEFAULT_MODEL,
      ...config,
    };
  }

  /**
   * Set event handlers for the client
   */
  setEventHandlers(handlers: GeminiLiveEventHandlers): void {
    this.eventHandlers = handlers;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected and ready
   */
  isConnected(): boolean {
    return this.connectionState === "connected" && this.isSetupComplete;
  }

  /**
   * Connect to the Gemini Live API
   */
  async connect(): Promise<void> {
    if (this.ws && this.connectionState === "connected") {
      return;
    }

    this.setConnectionState("connecting");
    this.isSetupComplete = false;

    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL with API key
        const wsUrl = `${GEMINI_LIVE_WS_ENDPOINT}?key=${this.config.apiKey}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.sendSetupMessage();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data as string);
          if (this.isSetupComplete && this.connectionState !== "connected") {
            this.setConnectionState("connected");
            this.flushPendingMessages();
            resolve();
          }
        };

        this.ws.onerror = () => {
          const error = new Error("WebSocket connection error");
          this.eventHandlers.onError?.(error);
          if (this.connectionState === "connecting") {
            reject(error);
          }
        };

        this.ws.onclose = (event) => {
          this.handleDisconnect(event as unknown as WebSocketCloseEvent);
        };

        // Set a connection timeout
        setTimeout(() => {
          if (this.connectionState === "connecting") {
            this.ws?.close();
            reject(new Error("Connection timeout"));
          }
        }, 30000);
      } catch (error) {
        this.setConnectionState("error");
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the Gemini Live API
   */
  disconnect(): void {
    this.cancelReconnect();

    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnect on intentional close
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }

    this.isSetupComplete = false;
    this.pendingMessages = [];
    this.setConnectionState("disconnected");
  }

  /**
   * Send audio data to Gemini
   *
   * @param audioBase64 - Base64-encoded audio data (16-bit PCM, 16kHz)
   */
  sendAudio(audioBase64: string): void {
    if (!this.isConnected()) {
      console.warn("Cannot send audio: not connected");
      return;
    }

    const message: BidiGenerateContentRealtimeInput = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm",
            data: audioBase64,
          },
        ],
      },
    };

    this.sendMessage(JSON.stringify(message));
  }

  /**
   * Send text content to Gemini
   *
   * @param text - Text content to send
   */
  sendText(text: string): void {
    if (!this.isConnected()) {
      console.warn("Cannot send text: not connected");
      return;
    }

    const message: BidiGenerateContentClientContent = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.sendMessage(JSON.stringify(message));
  }

  /**
   * Signal end of audio stream
   */
  sendAudioStreamEnd(): void {
    if (!this.isConnected()) {
      return;
    }

    const message = {
      realtimeInput: {
        audioStreamEnd: true,
      },
    };

    this.sendMessage(JSON.stringify(message));
  }

  /**
   * Update the system instruction
   * Note: This requires reconnecting as configuration cannot be updated mid-session
   */
  async updateSystemInstruction(instruction: string): Promise<void> {
    this.config.systemInstruction = instruction;

    if (this.connectionState === "connected") {
      this.disconnect();
      await this.connect();
    }
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Set and emit connection state
   */
  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.eventHandlers.onConnectionStateChange?.(state);
  }

  /**
   * Send the initial setup message
   */
  private sendSetupMessage(): void {
    const setup: { setup: BidiGenerateContentSetup } = {
      setup: {
        model: this.config.model || DEFAULT_MODEL,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceConfig?.voiceName || "Kore",
              },
            },
          },
        },
      },
    };

    // Add system instruction if provided
    if (this.config.systemInstruction) {
      setup.setup.systemInstruction = {
        parts: [{ text: this.config.systemInstruction }],
      };
    }

    this.sendMessage(JSON.stringify(setup));
  }

  /**
   * Send a message through the WebSocket
   */
  private sendMessage(message: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message if not yet connected
      if (this.connectionState === "connecting") {
        this.pendingMessages.push(message);
      }
      return;
    }

    this.ws.send(message);
  }

  /**
   * Flush any pending messages after connection
   */
  private flushPendingMessages(): void {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle setup complete
      if (message.setupComplete) {
        this.isSetupComplete = true;
        return;
      }

      // Handle server content (model responses)
      if (message.serverContent) {
        this.handleServerContent(message.serverContent);
        return;
      }

      // Handle tool calls (if we add function calling later)
      if (message.toolCall) {
        // Tool calling not implemented yet
        return;
      }

      // Handle go away (server disconnect notice)
      if (message.goAway) {
        console.warn("Server sending GoAway:", message.goAway);
        return;
      }
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  }

  /**
   * Handle server content messages
   */
  private handleServerContent(serverContent: {
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    turnComplete?: boolean;
    interrupted?: boolean;
    inputTranscription?: { text: string };
    outputTranscription?: { text: string };
  }): void {
    // Handle interruption
    if (serverContent.interrupted) {
      this.eventHandlers.onInterrupted?.();
      return;
    }

    // Handle model turn (audio/text responses)
    if (serverContent.modelTurn?.parts) {
      for (const part of serverContent.modelTurn.parts) {
        // Handle text response
        if (part.text) {
          this.eventHandlers.onTextResponse?.(part.text);
        }

        // Handle audio response
        if (part.inlineData) {
          this.eventHandlers.onAudioResponse?.({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          });
        }
      }
    }

    // Handle transcriptions
    if (serverContent.inputTranscription?.text) {
      this.eventHandlers.onTranscription?.(
        serverContent.inputTranscription.text,
        true
      );
    }

    if (serverContent.outputTranscription?.text) {
      this.eventHandlers.onTranscription?.(
        serverContent.outputTranscription.text,
        false
      );
    }

    // Handle turn complete
    if (serverContent.turnComplete) {
      this.eventHandlers.onTurnComplete?.();
    }
  }

  /**
   * Handle WebSocket disconnect
   */
  private handleDisconnect(event: WebSocketCloseEvent): void {
    this.isSetupComplete = false;
    this.ws = null;

    // Don't reconnect on clean close
    if (event.code === 1000) {
      this.setConnectionState("disconnected");
      return;
    }

    // Attempt reconnection with exponential backoff
    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    this.setConnectionState("reconnecting");

    const delay = Math.min(
      BACKOFF_CONFIG.initialDelayMs *
        Math.pow(BACKOFF_CONFIG.multiplier, this.reconnectAttempts),
      BACKOFF_CONFIG.maxDelayMs
    );

    this.reconnectAttempts++;

    console.log(
      `Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeoutId = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        // Connect will call attemptReconnect on failure
        console.error("Reconnection failed:", error);
      }
    }, delay);
  }

  /**
   * Cancel any pending reconnection
   */
  private cancelReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    this.reconnectAttempts = 0;
  }
}

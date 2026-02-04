/**
 * Voice Library
 *
 * Export all voice-related utilities and clients.
 */

export {
  GeminiLiveClient,
  type ConnectionState,
  type GeminiLiveConfig,
  type GeminiLiveEventHandlers,
  type AudioChunk,
} from "./GeminiLiveClient";

export {
  buildRecipeContext,
  getScaledIngredient,
  calculateScaleMultiplier,
  type RecipeData,
  type RecipeContext,
  type RecipeContextOptions,
  type ScaledIngredient,
  type ParsedIngredient,
} from "./recipeContext";

// Voice command parsing
export {
  parseVoiceCommand,
  isTimerCommand,
  isNavigationCommand,
  isScalingCommand,
  isQueryCommand,
} from "./VoiceCommandParser";

// Command dispatcher
export {
  dispatchCommand,
  dispatchParsedCommand,
  type TimerCallbacks,
  type NavigationCallbacks,
  type ScalingCallbacks,
  type QueryHandler,
  type CommandDispatcherCallbacks,
  type CommandDispatchResult,
} from "./commandDispatcher";

// Offline command parsing (simplified text-based commands)
export {
  parseOfflineCommand,
  parseTimeString,
  getCommandDescription,
  isOfflineSupported,
  getSupportedCommands,
  type OfflineCommandType,
  type OfflineCommandResult,
  type NavigationCommand,
  type TimerCommand,
  type UnknownCommand,
} from "./offlineCommands";

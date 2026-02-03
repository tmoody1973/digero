/**
 * Scanning Component Types
 *
 * Type definitions for the cookbook scanning feature.
 */

import type { Id } from "@/convex/_generated/dataModel";

/**
 * Scan session step states
 */
export type ScanStep = "cover" | "scanning" | "processing" | "review" | "complete";

/**
 * Ingredient category type
 */
export type IngredientCategory =
  | "meat"
  | "produce"
  | "dairy"
  | "pantry"
  | "spices"
  | "condiments"
  | "bread"
  | "other";

/**
 * Extracted ingredient from recipe page
 */
export interface ExtractedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Extracted recipe data from Gemini
 */
export interface ExtractedRecipeData {
  title: string;
  ingredients: ExtractedIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  pageNumber: string | null;
}

/**
 * Recipe preview for session summary
 */
export interface ScannedRecipePreview {
  _id: Id<"recipes">;
  title: string;
  ingredientCount: number;
  instructionCount: number;
}

/**
 * Page data for multi-page recipes
 */
export interface PageData {
  pageNumber: number;
  extractedData: ExtractedRecipeData;
}

/**
 * Scan session state for UI
 */
export interface ScanSessionState {
  sessionId: Id<"scanSessions"> | null;
  step: ScanStep;
  bookName: string;
  coverImageUrl: string | null;
  physicalCookbookId: Id<"physicalCookbooks"> | null;
  scannedRecipes: ScannedRecipePreview[];
  currentRecipe: ExtractedRecipeData | null;
  multiPageData: PageData[];
  isMultiPage: boolean;
  error: {
    type: string;
    message: string;
  } | null;
}

/**
 * Camera guidance message types
 */
export type CameraGuidanceType = "hold_steady" | "move_closer" | "position_page" | "ready";

/**
 * Camera guidance state
 */
export interface CameraGuidance {
  type: CameraGuidanceType;
  message: string;
}

/**
 * Props for ScanSessionModal
 */
export interface ScanSessionModalProps {
  visible: boolean;
  onClose: () => void;
  existingCookbookId?: Id<"physicalCookbooks">;
  existingCookbookName?: string;
}

/**
 * Props for CameraViewfinder
 */
export interface CameraViewfinderProps {
  onCapture: (imageBase64: string, mimeType: string) => void;
  isProcessing: boolean;
  guidanceMessage?: string;
}

/**
 * Props for CoverStep
 */
export interface CoverStepProps {
  bookName: string;
  onBookNameChange: (name: string) => void;
  onCaptureCover: () => void;
  onSkip: () => void;
}

/**
 * Props for ScanningStep
 */
export interface ScanningStepProps {
  bookName: string;
  coverImageUrl: string | null;
  scannedRecipeCount: number;
  onCapture: (imageBase64: string, mimeType: string) => void;
  onDone: () => void;
  isProcessing: boolean;
}

/**
 * Props for ProcessingStep
 */
export interface ProcessingStepProps {
  message?: string;
}

/**
 * Props for ReviewStep
 */
export interface ReviewStepProps {
  recipe: ExtractedRecipeData;
  isMultiPage: boolean;
  pageCount: number;
  scannedRecipes: ScannedRecipePreview[];
  onEditDetails: () => void;
  onContinueRecipe: () => void;
  onScanAnother: () => void;
  onDoneScanning: () => void;
}

/**
 * Props for CompleteStep
 */
export interface CompleteStepProps {
  bookName: string;
  coverImageUrl: string | null;
  scannedRecipes: ScannedRecipePreview[];
  onScanMore: () => void;
  onDone: () => void;
}

/**
 * Props for ScannedRecipeEditForm
 */
export interface ScannedRecipeEditFormProps {
  recipe: ExtractedRecipeData;
  onSave: (recipe: ExtractedRecipeData) => void;
  onCancel: () => void;
  onEnterManually: (partialData: Partial<ExtractedRecipeData>) => void;
}

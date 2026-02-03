/**
 * Web Recipe Import Types
 *
 * Type definitions for recipe import components.
 */

/**
 * Confidence level for extracted fields
 */
export type Confidence = "high" | "medium" | "low";

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
 * Parsed ingredient data
 */
export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Raw ingredient from extraction
 */
export interface RawIngredient {
  raw: string;
  parsed: ParsedIngredient | null;
}

/**
 * Extracted recipe data from backend
 */
export interface ExtractedRecipeData {
  title: string | null;
  imageUrl: string | null;
  ingredients: RawIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  confidence: Record<string, Confidence>;
  extractionMethod: "jsonld" | "microdata" | "ai";
}

/**
 * Error type for extraction
 */
export type ExtractionErrorType =
  | "INVALID_URL"
  | "FETCH_FAILED"
  | "TIMEOUT"
  | "PAYWALL_DETECTED"
  | "EXTRACTION_FAILED"
  | "NO_RECIPE_FOUND"
  | "YOUTUBE_NO_RECIPE"
  | "YOUTUBE_API_ERROR";

/**
 * Extraction result from backend
 */
export interface ExtractionResult {
  success: boolean;
  data: ExtractedRecipeData | null;
  error: {
    type: ExtractionErrorType;
    message: string;
  } | null;
  sourceUrl: string;
}

/**
 * Recipe data ready for review/edit
 */
export interface ReviewRecipeData {
  title: string;
  imageUrl: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  confidence: Record<string, Confidence>;
  sourceUrl: string;
}

/**
 * YouTube recipe data from extraction
 */
export interface YouTubeRecipeData {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  sourceUrl: string;
  title: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  confidence: Confidence;
  extractionNotes?: string;
}

/**
 * Props for UrlPasteModal
 */
export interface UrlPasteModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (data: ReviewRecipeData) => void;
  onYouTubeSuccess?: (data: YouTubeRecipeData) => void;
  initialUrl?: string;
  autoExtract?: boolean;
}

/**
 * Props for RecipeReviewScreen
 */
export interface RecipeReviewScreenProps {
  recipeData: ReviewRecipeData;
  onSave: (data: ReviewRecipeData) => void;
  onCancel: () => void;
  onCreateManually?: (sourceUrl: string) => void;
}

/**
 * Props for ConfidenceIndicator
 */
export interface ConfidenceIndicatorProps {
  level: Confidence;
  showLabel?: boolean;
}

/**
 * Props for InlineEditSection
 */
export interface InlineEditSectionProps {
  title: string;
  confidence?: Confidence;
  children: React.ReactNode;
  editMode: boolean;
  onEdit: () => void;
  onDone: () => void;
  renderEditor: () => React.ReactNode;
}

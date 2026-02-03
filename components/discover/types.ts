/**
 * YouTube Discover Types
 *
 * Type definitions for the Discover tab and YouTube recipe import features.
 */

/**
 * Extraction confidence level
 */
export type ExtractionConfidence = "high" | "medium" | "low";

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
 * Channel category type
 */
export type ChannelCategory =
  | "Italian"
  | "Asian"
  | "Quick Meals"
  | "Baking"
  | "Healthy"
  | "BBQ & Grilling"
  | "General";

/**
 * YouTube video metadata
 */
export interface VideoData {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
}

/**
 * Channel data with follow status
 */
export interface ChannelData {
  id: string;
  youtubeChannelId: string;
  name: string;
  avatarUrl: string;
  subscriberCount: number;
  description: string;
  videoCount: number;
  category: ChannelCategory;
  isFeatured: boolean;
  isFollowing: boolean;
  recentVideos?: VideoData[];
}

/**
 * Video in feed format (with channel info)
 */
export interface FeedVideoData extends VideoData {
  channelName: string;
  channelAvatarUrl: string;
}

/**
 * Parsed ingredient for recipe
 */
export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
}

/**
 * Recipe preview data (extracted from YouTube)
 */
export interface YouTubeRecipePreview {
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
  confidence: ExtractionConfidence;
  extractionNotes?: string;
}

/**
 * Category for filtering
 */
export interface Category {
  id: string;
  name: ChannelCategory;
  icon: string;
}

/**
 * View mode for Discover tab
 */
export type ViewMode = "feed" | "channels";

/**
 * Channel filter type
 */
export type ChannelFilter = "all" | "following" | "featured";

/**
 * YouTube extraction state
 */
export interface ExtractionState {
  status: "idle" | "fetching" | "extracting" | "success" | "error";
  videoMetadata: VideoData | null;
  recipePreview: YouTubeRecipePreview | null;
  error: {
    type: string;
    message: string;
  } | null;
}

/**
 * Props for ChannelCard component
 */
export interface ChannelCardProps {
  channel: ChannelData;
  onPress?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

/**
 * Props for VideoCard component
 */
export interface VideoCardProps {
  video: FeedVideoData;
  onPress?: () => void;
  onSaveRecipe?: () => void;
}

/**
 * Props for CategoryChip component
 */
export interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Props for VideoPlayerModal component
 */
export interface VideoPlayerModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  onSaveRecipe: () => void;
}

/**
 * Props for YouTubeRecipePreviewModal component
 */
export interface YouTubeRecipePreviewModalProps {
  visible: boolean;
  preview: YouTubeRecipePreview | null;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (preview: YouTubeRecipePreview) => void;
  onEditField?: (field: string, value: unknown) => void;
}

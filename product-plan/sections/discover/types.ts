// =============================================================================
// Data Types
// =============================================================================

export interface Category {
  id: string
  name: string
  icon: string
  channelCount: number
}

export interface Video {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  publishedAt: string
  viewCount: number
}

export interface Channel {
  id: string
  name: string
  avatarUrl: string
  subscriberCount: number
  isFollowing: boolean
  isFeatured: boolean
  category: string
  description: string
  recentVideos: Video[]
}

export interface FeedVideo extends Video {
  channelId: string
  channelName: string
  channelAvatarUrl: string
}

export interface RecipePreview {
  videoId: string
  title: string
  ingredientsPreview: string[]
  instructionsPreview: string
  estimatedTime: string
  servings: number
}

// =============================================================================
// Component Props
// =============================================================================

export interface DiscoverProps {
  /** List of channels (both followed and suggested) */
  channels: Channel[]
  /** Video feed from followed channels */
  feedVideos: FeedVideo[]
  /** Browsing categories */
  categories: Category[]

  // View controls
  /** Current view mode */
  viewMode?: 'feed' | 'channels'
  /** Called when user toggles between feed and channels view */
  onViewModeChange?: (mode: 'feed' | 'channels') => void

  // Search
  /** Current search query */
  searchQuery?: string
  /** Called when user searches for channels */
  onSearch?: (query: string) => void

  // Channel actions
  /** Called when user wants to view a channel's details */
  onViewChannel?: (channelId: string) => void
  /** Called when user follows a channel */
  onFollow?: (channelId: string) => void
  /** Called when user unfollows a channel */
  onUnfollow?: (channelId: string) => void

  // Video actions
  /** Called when user wants to watch a video */
  onWatchVideo?: (videoId: string) => void
  /** Called when user wants to save a video as a recipe */
  onSaveRecipe?: (videoId: string) => void

  // Category actions
  /** Called when user selects a category to browse */
  onSelectCategory?: (categoryId: string) => void
}

export interface ChannelDetailProps {
  /** The channel to display */
  channel: Channel

  // Actions
  /** Called when user follows the channel */
  onFollow?: () => void
  /** Called when user unfollows the channel */
  onUnfollow?: () => void
  /** Called when user wants to watch a video */
  onWatchVideo?: (videoId: string) => void
  /** Called when user wants to save a video as a recipe */
  onSaveRecipe?: (videoId: string) => void
  /** Called when user wants to go back */
  onBack?: () => void
}

export interface RecipePreviewModalProps {
  /** The recipe preview data */
  preview: RecipePreview
  /** Whether the modal is open */
  isOpen: boolean

  // Actions
  /** Called when user confirms saving the recipe */
  onConfirmSave?: () => void
  /** Called when user cancels/closes the modal */
  onCancel?: () => void
}

export interface VideoCardProps {
  /** The video to display */
  video: FeedVideo

  // Actions
  /** Called when user wants to watch the video */
  onWatch?: () => void
  /** Called when user wants to save as recipe */
  onSave?: () => void
}

export interface ChannelCardProps {
  /** The channel to display */
  channel: Channel

  // Actions
  /** Called when user taps the channel card */
  onView?: () => void
  /** Called when user follows the channel */
  onFollow?: () => void
  /** Called when user unfollows the channel */
  onUnfollow?: () => void
}

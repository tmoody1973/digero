"use node";

/**
 * YouTube Actions Index
 *
 * Exports all YouTube-related Convex actions.
 */

export { fetchVideoMetadata } from "./fetchVideoMetadata";
export { fetchCaptions, fetchTranscriptText } from "./fetchCaptions";
export {
  fetchChannelData,
  searchChannels,
  getChannelVideos,
} from "./fetchChannelData";
export {
  extractRecipeFromYouTube,
  downloadThumbnail,
} from "./extractRecipeFromYouTube";
export { seedFeaturedChannelsFromYouTube } from "./seedFeaturedChannelsAction";
export {
  fetchAndCacheChannelVideos,
  refreshFollowedChannelVideos,
} from "./cacheChannelVideos";

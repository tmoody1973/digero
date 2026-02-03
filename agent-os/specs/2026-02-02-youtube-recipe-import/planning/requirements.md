# Spec Requirements: YouTube Recipe Import

## Initial Description

Parse YouTube video descriptions and use AI to extract recipe information from video content. Support direct YouTube URL input via YouTube Data API v3.

**Source:** Product Roadmap - Week 2: Scanning, Planning, and Monetization (Feature #12)

**Effort Estimate:** Medium (M) - 1 week

**Priority:** Medium - Nice-to-have differentiator

---

## Requirements Discussion

### First Round Questions

**Q1:** I assume users will be able to import YouTube recipes through two entry points: (a) pasting a direct YouTube URL somewhere in the app, and (b) discovering videos through the existing Discover tab and tapping "Save Recipe" on video cards. Is that correct, or should we focus on just one entry point for the hackathon?

**Answer:** Both - paste YouTube URL AND Discover tab "Save Recipe" button

**Q2:** For the URL input method, I'm thinking of adding it to the existing recipe creation flow (perhaps alongside "Manual Entry" and "Web Import"). Should we add a dedicated "YouTube URL" input field, or should the existing Web Import detect YouTube URLs and handle them automatically?

**Answer:** Web Import auto-detects YouTube URLs (no separate input)

**Q3:** I assume we'll use the YouTube Data API v3 to fetch video metadata (title, description, thumbnails) and then send the description text to Gemini for recipe extraction. For videos where the description lacks recipe details, should we also attempt to fetch captions/transcripts, or is description-only sufficient for the MVP?

**Answer:** Use YouTube Data API for metadata + Gemini for recipe extraction (descriptions and captions)

**Q4:** When Gemini cannot confidently extract a recipe (e.g., the video is a food review, not a recipe), I'm thinking we show an error message like "We couldn't find a recipe in this video" rather than guessing. Is that the right approach, or should we allow users to manually enter details in that case?

**Answer:** Allow manual entry fallback when Gemini can't extract

**Q5:** Looking at the existing RecipePreviewModal in the Discover section, I see it shows a preview with ingredients and instructions before saving. I assume we'll reuse this same modal pattern for both URL imports and Discover saves. Should the user be able to edit the extracted recipe in the preview modal before saving, or just review and save (then edit in the recipe detail view)?

**Answer:** Allow editing in preview modal before saving

**Q6:** For the recipe thumbnail, I assume we'll use the YouTube video thumbnail as the recipe image. Should we store this as a URL reference, or download and store it in Convex file storage?

**Answer:** Download to Convex file storage (not URL reference)

**Q7:** The Discover section mockups show following channels and a video feed. I assume the YouTube Recipe Import feature should work seamlessly with Discover - when users tap "Save Recipe" on a video card, it triggers the same extraction flow. Is following channels and the video feed already built, or is that part of this feature's scope?

**Answer:** Channel following and video feed IS part of this feature's scope

**Q8:** Is there anything specific you want to exclude from this feature for the hackathon (e.g., caption/transcript parsing, channel following, video playback within the app)?

**Answer:** No exclusions - include caption parsing, channel following, in-app video playback

---

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Discover Section Components - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/components/`
  - `RecipePreviewModal.tsx` - Modal pattern for AI extraction preview (to be enhanced with editing)
  - `VideoCard.tsx` - Video card with save button
  - `ChannelCard.tsx` - Channel card with follow button
  - `ChannelDetail.tsx` - Full channel page with videos
  - `Discover.tsx` - Main view with feed/channels toggle
  - `CategoryChip.tsx` - Category browsing chips

- Feature: Discover Section Types - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/types.ts`
  - `Channel`, `Video`, `FeedVideo`, `RecipePreview` interfaces
  - Component prop interfaces for all Discover components

- Feature: Core Data Model - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/data-model/types.ts`
  - `Recipe` interface with `source: 'youtube'` and `youtubeVideoId` field
  - `Channel` and `Video` interfaces for YouTube data

- Feature: Discover Mockups - Path: `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/`
  - `discover-channels.png` - Channels browsing view with categories and featured creators
  - `channel-detail.png` - Individual channel page with video list
  - `discover-feed.png` - Video feed from followed channels

---

### Follow-up Questions

No follow-up questions were needed.

---

## Visual Assets

### Files Provided:

No visual assets provided in the spec planning folder.

### Reference Visuals from Product Plan:

The following mockups exist in the product-plan and should guide implementation:

- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/discover-channels.png`: Shows channel browsing interface with category chips (Italian, Asian, Quick Meals, Baking, Healthy, BBQ & Grilling), "Featured Creators" and "Suggested for You" sections, channel cards with avatars, descriptions, categories, and Follow buttons
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/channel-detail.png`: Shows individual channel page with avatar, name, subscriber count, video count, category tag, description, Following button, and "Latest Videos" grid with thumbnails and duration badges
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/discover-feed.png`: Video feed layout (to be referenced)

### Visual Insights:

- Orange primary color (#F97316) used throughout UI
- Channel cards show avatar, name, description, category tag, and Follow/Following button
- Video cards display thumbnail with duration badge, play overlay on hover, and save recipe button
- Bottom navigation includes: Recipes, Discover, Cookbooks, Plan, Shop tabs
- Recipe preview modal uses bottom sheet pattern on mobile with slide-up animation
- Featured creators section highlights popular cooking channels
- Category-based filtering via horizontal scrolling chips

---

## Requirements Summary

### Functional Requirements

**Entry Point 1: URL Import (Web Import Auto-Detection)**
- Web Import input field detects YouTube URLs automatically
- Supported URL formats: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
- When YouTube URL detected, trigger YouTube-specific extraction flow
- No separate "YouTube Import" button needed

**Entry Point 2: Discover Tab**
- Browse video feed from followed YouTube cooking channels
- Search and discover new YouTube cooking channels
- Follow/unfollow channels (persisted to user account)
- View channel detail pages with video listings
- Category-based channel browsing (Italian, Asian, Quick Meals, Baking, Healthy, BBQ & Grilling)
- "Save Recipe" button on video cards triggers extraction flow
- In-app video playback capability

**YouTube Data API Integration**
- Extract video ID from YouTube URL
- Fetch video metadata via Videos.list endpoint:
  - Title
  - Description
  - Thumbnails (download highest quality)
  - Duration
  - View count
  - Published date
- Fetch captions via Captions.list endpoint when available
- Fetch channel information for Discover features:
  - Channel name, avatar, subscriber count
  - Recent videos list

**Recipe Extraction Flow**
- Send video description + captions (if available) to Gemini API
- Gemini extracts structured recipe data:
  - Title (from video title or extracted)
  - Ingredients list with quantities and units
  - Step-by-step instructions
  - Prep time and cook time estimates
  - Servings
- Handle extraction confidence:
  - High confidence: Show editable preview
  - Low/no confidence: Offer manual entry fallback

**Recipe Preview Modal (Enhanced)**
- Display AI-extracted recipe for user review
- Editable fields before saving:
  - Title
  - Ingredients (add/remove/edit)
  - Instructions (add/remove/edit)
  - Prep time, cook time, servings
- Show extraction source note: "Extracted by AI from YouTube video"
- Confirm save or cancel
- Manual entry fallback when extraction fails

**Recipe Storage**
- Save recipe with `source: 'youtube'`
- Store `youtubeVideoId` for reference
- Download and store thumbnail in Convex file storage
- Store `sourceUrl` as the original YouTube URL
- Associate with user account

**Channel Following System**
- Follow/unfollow YouTube cooking channels
- Persist followed channels to user account in Convex
- Featured channels curated by app
- Suggested channels based on categories

**Video Feed**
- Aggregate recent videos from followed channels
- Sort by publish date (newest first)
- Display video cards with:
  - Thumbnail with duration badge
  - Title
  - Channel name and avatar
  - View count and publish date
  - Save Recipe button

**In-App Video Playback**
- Play YouTube videos within the app
- Use YouTube iframe embed or react-native-youtube-iframe
- Allow users to watch while considering saving recipe

### Reusability Opportunities

- RecipePreviewModal component exists but needs enhancement for editing
- VideoCard component ready for use in feed
- ChannelCard component ready for channel browsing
- ChannelDetail component ready for channel pages
- Discover main component has feed/channels toggle structure
- Category browsing chip pattern established
- Recipe data model already supports `source: 'youtube'` and `youtubeVideoId`

### Scope Boundaries

**In Scope:**
- YouTube URL auto-detection in Web Import
- Full Discover tab with channel browsing
- Channel following/unfollowing
- Video feed from followed channels
- In-app YouTube video playback
- YouTube Data API integration (metadata, descriptions, captions)
- Gemini-powered recipe extraction
- Editable recipe preview modal
- Manual entry fallback for failed extractions
- Thumbnail download to Convex storage
- Category-based channel discovery
- Featured and suggested channels

**Out of Scope:**
- YouTube authentication/OAuth (using public API only)
- User's personal YouTube subscriptions sync
- Video recommendations algorithm
- Comments or community features
- Video upload or creation
- Offline video playback
- Push notifications for new videos

### Technical Considerations

**APIs and Services:**
- YouTube Data API v3 (10,000 quota units/day free tier)
  - Videos.list - video metadata
  - Captions.list - video captions
  - Channels.list - channel information
  - Search.list - channel discovery
- Gemini API - recipe extraction from text
- Convex file storage - thumbnail persistence

**Data Models:**
- Recipe: existing model with `source: 'youtube'`, `youtubeVideoId`, `sourceUrl`
- Channel: `id`, `name`, `avatarUrl`, `subscriberCount`, `isFollowing`, `isFeatured`, `category`, `description`, `recentVideos`
- Video: `id`, `title`, `thumbnailUrl`, `duration`, `publishedAt`, `viewCount`
- FeedVideo: extends Video with `channelId`, `channelName`, `channelAvatarUrl`
- UserFollowedChannels: user-channel relationship table

**Backend Functions (Convex):**
- `youtube/extractRecipe` - fetch video data and extract recipe via Gemini
- `youtube/fetchVideoMetadata` - get video info from YouTube API
- `youtube/fetchCaptions` - get video captions if available
- `youtube/searchChannels` - search for cooking channels
- `youtube/getChannelVideos` - get recent videos from a channel
- `channels/follow` - add channel to user's followed list
- `channels/unfollow` - remove channel from followed list
- `channels/getFeed` - aggregate videos from followed channels

**Environment Variables Required:**
- `YOUTUBE_API_KEY` - YouTube Data API v3 key (stored in Convex)
- `GEMINI_API_KEY` - already configured for cookbook scanning

**Quota Considerations:**
- YouTube API: 10,000 units/day
- Videos.list: 1 unit per call
- Captions.list: 50 units per call
- Search.list: 100 units per call
- Monitor usage and implement caching for channel data

**Similar Code Patterns to Follow:**
- Cookbook scanning flow for Gemini integration pattern
- Web recipe import for URL parsing pattern
- Existing component library in product-plan/sections/discover/components/

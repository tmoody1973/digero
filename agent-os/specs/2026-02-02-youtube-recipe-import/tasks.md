# Task Breakdown: YouTube Recipe Import

## Overview
Total Tasks: 44

This feature enables users to import recipes from YouTube videos through two entry points: auto-detection of YouTube URLs in Web Import and a dedicated Discover tab for browsing and following cooking channels.

## Task List

### Backend Layer

#### Task Group 1: YouTube API Integration
**Dependencies:** None

- [x] 1.0 Complete YouTube Data API integration
  - [x] 1.1 Write 2-8 focused tests for YouTube API functions
    - Test video metadata fetch with valid video ID
    - Test URL parsing for youtube.com/watch, youtu.be, and shorts formats
    - Test caption fetch when captions are available
    - Test error handling for invalid video IDs
  - [x] 1.2 Add `YOUTUBE_API_KEY` environment variable to Convex
    - Store key in Convex environment variables
    - Add key validation on startup
  - [x] 1.3 Create URL parsing utility function
    - Extract video ID from `youtube.com/watch?v=` format
    - Extract video ID from `youtu.be/` format
    - Extract video ID from `youtube.com/shorts/` format
    - Return null for non-YouTube URLs
  - [x] 1.4 Create `youtube/fetchVideoMetadata` Convex action
    - Call YouTube Data API `videos.list` endpoint
    - Fetch: title, description, thumbnails, duration, viewCount, publishedAt
    - Parse ISO 8601 duration to readable format
    - Handle API errors and quota limits
  - [x] 1.5 Create `youtube/fetchCaptions` Convex action
    - Call YouTube Data API `captions.list` endpoint
    - Fetch caption track list for video
    - Download caption text when available
    - Return null gracefully when no captions exist
  - [x] 1.6 Implement quota-aware caching
    - Cache video metadata responses (10,000 units/day limit)
    - Use Convex tables for caching with TTL
    - Track daily quota usage
  - [x] 1.7 Ensure YouTube API tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify API calls return expected data structure
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- Video metadata fetches successfully for valid video IDs
- All three YouTube URL formats parse correctly
- Captions retrieved when available
- API errors handled gracefully with meaningful messages

---

#### Task Group 2: Channel Data Functions
**Dependencies:** Task Group 1

- [x] 2.0 Complete channel data layer
  - [x] 2.1 Write 2-8 focused tests for channel functions
    - Test channel data fetch by channel ID
    - Test channel search with query string
    - Test fetching videos for a channel
    - Test follow/unfollow mutations
  - [x] 2.2 Create `youtube/fetchChannelData` Convex action
    - Call YouTube Data API `channels.list` endpoint
    - Fetch: name, avatar (thumbnails.default), subscriberCount, description, videoCount
    - Map to Channel type interface
  - [x] 2.3 Create `youtube/searchChannels` Convex action
    - Call YouTube Data API `search.list` endpoint with type=channel
    - Filter by cooking/food categories
    - Return list of Channel objects with metadata
    - Limit results for quota conservation (max 10-20 per search)
  - [x] 2.4 Create `youtube/getChannelVideos` Convex action
    - Fetch recent videos from a specific channel
    - Call YouTube Data API `search.list` with channelId and type=video
    - Return list of Video objects sorted by publishedAt
    - Limit to 20 most recent videos
  - [x] 2.5 Create `channels` table in Convex schema
    - Fields: youtubeChannelId, name, avatarUrl, subscriberCount, description, videoCount, category, isFeatured
    - Indexes on: youtubeChannelId, isFeatured, category
  - [x] 2.6 Create `userFollowedChannels` table in Convex schema
    - Fields: userId, channelId (reference to channels table)
    - Indexes on: userId, [userId, channelId]
  - [x] 2.7 Create `channels/follow` mutation
    - Add channel to userFollowedChannels table
    - Create channel record if not exists
    - Return updated channel with isFollowing: true
  - [x] 2.8 Create `channels/unfollow` mutation
    - Remove channel from userFollowedChannels table
    - Return updated channel with isFollowing: false
  - [x] 2.9 Create `channels/getFeed` query
    - Aggregate recent videos from all followed channels for user
    - Sort by publishedAt (newest first)
    - Return list of FeedVideo objects with channel info attached
    - Paginate results (20 per page)
  - [x] 2.10 Ensure channel data tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify channel operations work correctly
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- Channel data fetches and caches correctly
- Channel search returns relevant cooking channels
- Follow/unfollow persists to database
- Feed aggregates videos from followed channels

---

#### Task Group 3: Gemini Recipe Extraction
**Dependencies:** Task Group 1

- [x] 3.0 Complete Gemini recipe extraction
  - [x] 3.1 Write 2-8 focused tests for recipe extraction
    - Test extraction with rich description containing recipe
    - Test extraction with description + captions
    - Test low-confidence result handling
    - Test extraction failure graceful handling
  - [x] 3.2 Create `youtube/extractRecipe` Convex action
    - Accept video description and optional captions text
    - Construct prompt for Gemini API with structured output request
    - Send to Gemini API (reuse existing API key from cookbook scanning)
    - Parse response into RecipePreview structure
  - [x] 3.3 Define Gemini extraction prompt
    - Request structured JSON output
    - Extract: title, ingredients (quantity, unit, name), instructions (step-by-step), prepTime, cookTime, servings
    - Include confidence score in response (high/medium/low)
    - Handle videos that are not recipes
  - [x] 3.4 Implement confidence-based response handling
    - High confidence: Return complete RecipePreview
    - Medium confidence: Return partial data with warning flag
    - Low/no confidence: Return extraction failed flag
  - [x] 3.5 Create `youtube/downloadThumbnail` Convex action
    - Fetch highest quality thumbnail (maxres > hq > default)
    - Store image in Convex file storage
    - Return file ID for recipe association
  - [x] 3.6 Create `recipes/saveFromYouTube` mutation
    - Accept RecipePreview data with edits
    - Store with source: 'youtube' and youtubeVideoId
    - Associate thumbnail file ID
    - Store sourceUrl as original YouTube URL
    - Associate with authenticated user
  - [x] 3.7 Ensure recipe extraction tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify Gemini integration returns structured data
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- Recipes extract with structured ingredients and instructions
- Confidence levels accurately reflect extraction quality
- Thumbnails download and store in Convex
- Recipes save with correct YouTube metadata

---

### Frontend Layer

#### Task Group 4: URL Detection & Web Import Enhancement
**Dependencies:** Task Group 3

- [x] 4.0 Complete YouTube URL detection in Web Import
  - [x] 4.1 Write 2-8 focused tests for URL detection flow
    - Test YouTube URL detection triggers YouTube flow
    - Test non-YouTube URL continues normal web import
    - Test loading state displays correctly
    - Test extraction result displays in preview modal
  - [x] 4.2 Add YouTube URL detection to Web Import input
    - Detect YouTube URLs on paste or input change
    - Use URL parsing utility from Task 1.3
    - Route to YouTube-specific extraction when detected
    - Continue normal web import for non-YouTube URLs
  - [x] 4.3 Implement YouTube extraction loading state
    - Display "Extracting from YouTube..." message
    - Show video thumbnail during extraction
    - Use Sparkles icon animation (follow ScanSession pattern)
  - [x] 4.4 Connect to `youtube/extractRecipe` action
    - Call fetchVideoMetadata first
    - Call fetchCaptions (handle missing captions gracefully)
    - Call extractRecipe with description + captions
    - Handle all three confidence levels
  - [x] 4.5 Display extraction result in RecipePreviewModal
    - On success: Open modal with extracted recipe
    - On low confidence: Show warning with "Enter Manually" option
    - On failure: Show error with manual entry fallback
  - [x] 4.6 Ensure URL detection tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify end-to-end URL detection flow
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- YouTube URLs detected automatically in Web Import
- Appropriate loading states shown during extraction
- Extraction results displayed in preview modal
- Non-YouTube URLs continue to work normally

---

#### Task Group 5: Editable Recipe Preview Modal
**Dependencies:** Task Group 4

- [x] 5.0 Complete editable RecipePreviewModal
  - [x] 5.1 Write 2-8 focused tests for modal editing
    - Test title editing saves correctly
    - Test adding/removing ingredients
    - Test editing instruction steps
    - Test save button submits edited data
  - [x] 5.2 Enhance RecipePreviewModal with editable title
    - Make title field editable (tap to edit pattern)
    - Add inline text input for title editing
    - Update state on change
  - [x] 5.3 Add editable ingredients list
    - Each ingredient row: quantity input, unit dropdown, name input
    - Add "Add Ingredient" button at list bottom
    - Swipe to delete or delete button on each row
    - Validate at least one ingredient before save
  - [x] 5.4 Add editable instructions list
    - Each instruction step: numbered text area
    - Add "Add Step" button at list bottom
    - Swipe to delete or delete button on each step
    - Auto-renumber steps when one is removed
    - Validate at least one step before save
  - [x] 5.5 Add editable time and servings fields
    - Prep time: numeric input with minutes label
    - Cook time: numeric input with minutes label
    - Servings: numeric input with "servings" label
  - [x] 5.6 Display video thumbnail in modal header
    - Show YouTube video thumbnail at top of modal
    - Thumbnail serves as recipe image preview
    - Include "Extracted by AI from YouTube video" source note
  - [x] 5.7 Implement save flow
    - Validate required fields
    - Call `recipes/saveFromYouTube` mutation
    - Show success state
    - Navigate to recipe detail or library
  - [x] 5.8 Ensure modal editing tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify all editing functions work
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- All recipe fields are editable before save
- Ingredients can be added, removed, and edited
- Instructions can be added, removed, and reordered
- Save persists all edited data correctly

---

#### Task Group 6: Manual Entry Fallback
**Dependencies:** Task Group 5

- [x] 6.0 Complete manual entry fallback
  - [x] 6.1 Write 2-4 focused tests for fallback flow
    - Test fallback message displays on extraction failure
    - Test "Enter Manually" opens pre-populated form
    - Test pre-filled video title and thumbnail carry forward
  - [x] 6.2 Create extraction failed state in RecipePreviewModal
    - Display "We had trouble extracting this recipe" message
    - Show video thumbnail and title
    - Include "Enter Manually" button
    - Include "Try Again" button (re-attempt extraction)
  - [x] 6.3 Pre-populate manual entry form
    - Pre-fill recipe title with video title
    - Pre-fill image with video thumbnail
    - Leave ingredients and instructions empty for user input
    - Include sourceUrl and youtubeVideoId in form data
  - [x] 6.4 Ensure fallback tests pass
    - Run ONLY the 2-4 tests written in 6.1
    - Verify fallback experience works end-to-end
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-4 tests written in 6.1 pass
- Clear error message when extraction fails
- Manual entry opens with pre-filled metadata
- User can complete recipe entry manually

---

#### Task Group 7: Discover Tab - Channels View
**Dependencies:** Task Group 2

- [x] 7.0 Complete Discover Channels view
  - [x] 7.1 Write 2-8 focused tests for Channels view
    - Test channel list renders with correct data
    - Test category chip filtering works
    - Test follow button toggles state
    - Test channel card tap navigates to detail
  - [x] 7.2 Implement view toggle in Discover component
    - Add toggle buttons: "Video Feed" (camera icon) and "Channels" (people icon)
    - Reference existing Discover.tsx component pattern
    - Persist view selection in local state
  - [x] 7.3 Implement channel filter tabs
    - Tabs: All, Following (with count), Featured
    - "All" shows all discoverable channels
    - "Following" filters to user's followed channels
    - "Featured" shows curated featured channels
  - [x] 7.4 Implement horizontal category chips
    - Categories: Italian, Asian, Quick Meals, Baking, Healthy, BBQ & Grilling
    - Each chip has icon and label
    - Tap to filter channels by category
    - Allow multi-select or single-select (per design)
    - Reference CategoryChip.tsx component
  - [x] 7.5 Implement channel search bar
    - Search input with placeholder "Search channels..."
    - Debounced search (300ms)
    - Call youtube/searchChannels on search
    - Display search results replacing normal list
  - [x] 7.6 Render "Featured Creators" section
    - Query featured channels from database
    - Display in 2-column grid
    - Use ChannelCard component for each channel
    - Reference discover-channels.png mockup
  - [x] 7.7 Render "Suggested for You" section
    - Query suggested channels (non-followed, matching user interests)
    - Display below Featured Creators
    - Use same ChannelCard component layout
  - [x] 7.8 Ensure Channels view tests pass
    - Run ONLY the 2-8 tests written in 7.1
    - Verify channel browsing works
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-8 tests written in 7.1 pass
- View toggle switches between Feed and Channels
- Category filtering narrows channel list
- Search returns relevant cooking channels
- Featured and Suggested sections display correctly

---

#### Task Group 8: Channel Card & Follow Functionality
**Dependencies:** Task Group 7

- [x] 8.0 Complete ChannelCard component functionality
  - [x] 8.1 Write 2-4 focused tests for ChannelCard
    - Test card renders channel data correctly
    - Test follow button calls follow mutation
    - Test following state updates UI
  - [x] 8.2 Implement ChannelCard display
    - Avatar (rounded square) with letter fallback
    - Channel name
    - Description (2-line clamp)
    - Subscriber count formatted (e.g., "1.2M subscribers")
    - Category tag (colored badge)
    - Reference ChannelCard.tsx and discover-channels.png
  - [x] 8.3 Implement Follow/Following button
    - "Follow" state: outline button
    - "Following" state: filled button with checkmark
    - Tap calls channels/follow or channels/unfollow mutation
    - Optimistic UI update
  - [x] 8.4 Add channel card tap navigation
    - Tap anywhere on card (except follow button) navigates to ChannelDetail
    - Pass channel ID as route parameter
  - [x] 8.5 Ensure ChannelCard tests pass
    - Run ONLY the 2-4 tests written in 8.1
    - Verify channel card interactions
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-4 tests written in 8.1 pass
- Channel cards display all required information
- Follow/unfollow updates state correctly
- Tapping card navigates to channel detail

---

#### Task Group 9: Channel Detail Page
**Dependencies:** Task Group 8

- [x] 9.0 Complete ChannelDetail page
  - [x] 9.1 Write 2-6 focused tests for ChannelDetail
    - Test header displays channel info correctly
    - Test video grid renders channel's videos
    - Test "Save Recipe" on video triggers extraction
  - [x] 9.2 Implement ChannelDetail header
    - Orange gradient background with back arrow
    - Large avatar with letter initial fallback
    - Channel name with Featured badge (if applicable)
    - Stats row: subscriber count, video count
    - Category tag (green badge)
    - Description (2-3 lines)
    - Following/Follow button
    - Reference channel-detail.png mockup
  - [x] 9.3 Implement "Latest Videos" section
    - Call youtube/getChannelVideos for channel ID
    - Display section header "Latest Videos"
    - 2-column video grid layout
  - [x] 9.4 Implement video cards in grid
    - Thumbnail with duration badge (bottom-right)
    - Video title (2-line clamp)
    - View count and publish date
    - "Save Recipe" button or tap action
  - [x] 9.5 Connect video card to extraction flow
    - Tap "Save Recipe" triggers youtube/extractRecipe
    - Opens RecipePreviewModal with result
    - Same flow as Web Import extraction
  - [x] 9.6 Ensure ChannelDetail tests pass
    - Run ONLY the 2-6 tests written in 9.1
    - Verify channel detail page works
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-6 tests written in 9.1 pass
- Channel header matches design mockup
- Latest videos load and display correctly
- Save Recipe triggers extraction flow

---

#### Task Group 10: Discover Tab - Video Feed
**Dependencies:** Task Group 9

- [x] 10.0 Complete Video Feed view
  - [x] 10.1 Write 2-6 focused tests for Video Feed
    - Test feed renders videos from followed channels
    - Test empty state prompts to follow channels
    - Test "Save Recipe" button triggers extraction
    - Test video card tap opens player
  - [x] 10.2 Implement feed data loading
    - Call channels/getFeed query
    - Display loading state while fetching
    - Handle empty state (no followed channels)
  - [x] 10.3 Implement empty state
    - Display message prompting user to follow channels
    - Include button to switch to Channels view
    - Friendly illustration or icon
  - [x] 10.4 Implement VideoCard for feed
    - Full-width video card layout
    - Large thumbnail with duration badge
    - Play button overlay
    - "Save Recipe" button (top-right, appears on hover/tap)
    - Channel avatar (circular) below thumbnail
    - Video title (2-line clamp)
    - Channel name
    - View count and time ago (e.g., "520K views - Today")
    - Reference discover-feed.png mockup
  - [x] 10.5 Connect "Save Recipe" to extraction flow
    - Tap button triggers youtube/extractRecipe for video
    - Opens RecipePreviewModal with result
  - [x] 10.6 Implement infinite scroll pagination
    - Load more videos as user scrolls
    - Display loading indicator at bottom
    - Use pagination from channels/getFeed query
  - [x] 10.7 Ensure Video Feed tests pass
    - Run ONLY the 2-6 tests written in 10.1
    - Verify feed experience works
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-6 tests written in 10.1 pass
- Feed displays videos from followed channels
- Empty state guides user to follow channels
- Videos sorted by newest first
- Save Recipe triggers extraction correctly

---

#### Task Group 11: In-App Video Playback
**Dependencies:** Task Group 10

- [x] 11.0 Complete in-app video playback
  - [x] 11.1 Write 2-4 focused tests for video player
    - Test player modal opens on video tap
    - Test YouTube video plays correctly
    - Test "Save Recipe" accessible from player view
  - [x] 11.2 Install and configure react-native-youtube-iframe
    - Add package to project dependencies
    - Configure for iOS and Android
    - Handle webview requirements
  - [x] 11.3 Create VideoPlayerModal component
    - Modal with YouTube iframe embed
    - Video plays when modal opens
    - Close button in header
    - Include "Save Recipe" button below player
  - [x] 11.4 Connect video tap to player
    - Tap video thumbnail or play overlay opens modal
    - Pass video ID to player
    - Player renders YouTube video
  - [x] 11.5 Implement "Save Recipe" from player
    - Button below video triggers extraction
    - Same flow as card Save Recipe button
    - Close player and open RecipePreviewModal
  - [x] 11.6 Ensure video player tests pass
    - Run ONLY the 2-4 tests written in 11.1
    - Verify playback experience works
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- The 2-4 tests written in 11.1 pass
- YouTube videos play in-app
- Player modal opens and closes correctly
- Save Recipe accessible from player view

---

### Testing

#### Task Group 12: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-11

- [x] 12.0 Review existing tests and fill critical gaps only
  - [x] 12.1 Review tests from Task Groups 1-11
    - Review the tests written by each task group
    - Total existing tests: approximately 32-60 tests
    - Document test coverage by area
  - [x] 12.2 Analyze test coverage gaps for YouTube Recipe Import feature
    - Identify critical user workflows lacking test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Prioritize end-to-end workflows:
      - URL paste to recipe save
      - Channel follow to feed to recipe save
      - Manual entry fallback complete flow
  - [x] 12.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Priority areas:
      - Full URL import flow (paste URL -> extract -> edit -> save)
      - Full Discover flow (browse -> follow -> feed -> save recipe)
      - Error recovery paths
  - [x] 12.4 Run feature-specific tests only
    - Run ONLY tests related to YouTube Recipe Import feature
    - Expected total: approximately 42-70 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass
- Critical user workflows for YouTube import are covered
- No more than 10 additional tests added
- Testing focused exclusively on this spec's requirements

---

## Execution Order

Recommended implementation sequence based on dependencies:

### Phase 1: Backend Foundation (Task Groups 1-3)
1. **Task Group 1: YouTube API Integration** - Core API setup, no dependencies
2. **Task Group 2: Channel Data Functions** - Depends on YouTube API
3. **Task Group 3: Gemini Recipe Extraction** - Depends on YouTube API

### Phase 2: Web Import Entry Point (Task Groups 4-6)
4. **Task Group 4: URL Detection & Web Import** - Depends on extraction backend
5. **Task Group 5: Editable Recipe Preview Modal** - Depends on URL detection flow
6. **Task Group 6: Manual Entry Fallback** - Depends on preview modal

### Phase 3: Discover Tab (Task Groups 7-11)
7. **Task Group 7: Discover Tab - Channels View** - Depends on channel backend
8. **Task Group 8: Channel Card & Follow** - Depends on Channels view
9. **Task Group 9: Channel Detail Page** - Depends on channel card
10. **Task Group 10: Discover Tab - Video Feed** - Depends on channel detail
11. **Task Group 11: In-App Video Playback** - Depends on video feed

### Phase 4: Testing
12. **Task Group 12: Test Review & Gap Analysis** - Depends on all task groups

---

## Visual Asset References

The following mockups should guide implementation:

- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/discover-channels.png` - Channel browsing interface
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/channel-detail.png` - Individual channel page
- `/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/discover-feed.png` - Video feed layout

---

## Existing Code References

Components in `product-plan/sections/discover/components/`:
- `Discover.tsx` - Main view structure
- `VideoCard.tsx` - Video card component
- `ChannelCard.tsx` - Channel card component
- `ChannelDetail.tsx` - Channel page component
- `CategoryChip.tsx` - Category chip component
- `RecipePreviewModal.tsx` - Preview modal (to be enhanced)

Type definitions in `product-plan/sections/discover/types.ts`:
- `Channel`, `Video`, `FeedVideo`, `RecipePreview` interfaces

Core data model in `product-plan/data-model/types.ts`:
- `Recipe` interface with `source: 'youtube'` support

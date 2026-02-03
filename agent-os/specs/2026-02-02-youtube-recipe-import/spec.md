# Specification: YouTube Recipe Import

## Goal

Enable users to import recipes from YouTube videos through two entry points: auto-detection of YouTube URLs in Web Import and a dedicated Discover tab for browsing and following cooking channels.

## User Stories

- As a user, I want to paste a YouTube video URL and have the app automatically extract the recipe so I can save it to my library without manual entry
- As a user, I want to browse and follow my favorite cooking channels so I can discover new recipes from their latest videos

## Specific Requirements

**YouTube URL Auto-Detection in Web Import**
- Detect YouTube URLs automatically when user pastes into Web Import field (no separate input)
- Support URL formats: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`
- Extract video ID from URL using regex pattern matching
- Route to YouTube-specific extraction flow when YouTube URL detected
- Display loading state with "Extracting from YouTube..." message

**YouTube Data API Integration**
- Use YouTube Data API v3 for all video and channel data retrieval
- Fetch video metadata via `videos.list` endpoint: title, description, thumbnails, duration, viewCount, publishedAt
- Fetch captions via `captions.list` endpoint when available for enhanced extraction
- Fetch channel data via `channels.list` endpoint: name, avatar, subscriberCount, description
- Search channels via `search.list` endpoint for discovery feature
- Store `YOUTUBE_API_KEY` in Convex environment variables
- Implement quota-aware caching (10,000 units/day limit)

**Gemini Recipe Extraction**
- Send video description text plus captions (if available) to Gemini API
- Extract structured recipe data: title, ingredients with quantities/units, step-by-step instructions, prepTime, cookTime, servings
- Return confidence indicator for extraction quality
- Handle low-confidence scenarios by displaying partial data with warning
- Use existing Gemini API key already configured for cookbook scanning

**Editable Recipe Preview Modal**
- Enhance existing `RecipePreviewModal` component to support inline editing
- Make title, ingredients, instructions, prepTime, cookTime, and servings editable before save
- Add/remove/edit individual ingredients with quantity, unit, and name fields
- Add/remove/edit individual instruction steps
- Display "Extracted by AI from YouTube video" source note
- Include video thumbnail preview in modal header

**Manual Entry Fallback**
- When Gemini extraction fails or returns low confidence, show "We had trouble extracting this recipe" message
- Provide "Enter Manually" button that opens pre-populated form with video title and thumbnail
- Pre-fill available metadata (video title as recipe title, thumbnail as image)
- Allow user to complete missing fields manually

**Discover Tab - Channel Browsing**
- Implement two-mode view toggle: "Video Feed" and "Channels" (use existing `Discover` component pattern)
- Channel browsing with category filter chips: Italian, Asian, Quick Meals, Baking, Healthy, BBQ & Grilling
- Channel filter tabs: All, Following, Featured
- Display channel cards with avatar, name, description, subscriber count, category tag, and Follow button
- Curated "Featured Creators" section at top of Channels view
- "Suggested for You" section below Featured

**Discover Tab - Video Feed**
- Aggregate recent videos from all followed channels
- Sort by publishedAt date (newest first)
- Display video cards with thumbnail, duration badge, title, channel info, view count, and time ago
- Show "Save Recipe" button on video card hover/tap
- Empty state prompts user to follow channels when feed is empty

**Channel Detail Page**
- Full-page channel view accessed by tapping channel card
- Header with avatar, name, subscriber count, video count, category, description, Following/Follow button
- "Latest Videos" grid showing channel's recent videos
- Video cards with thumbnail, duration badge, title, view count, and publish date
- Each video card has "Save Recipe" action

**In-App Video Playback**
- Embed YouTube player using `react-native-youtube-iframe` package
- Open video player modal when user taps video thumbnail or play overlay
- Allow users to watch video while considering whether to save as recipe
- Include "Save Recipe" button accessible from video player view

**Thumbnail Storage**
- Download highest quality YouTube thumbnail (maxres or hq) during save
- Store image in Convex file storage (not URL reference)
- Associate stored file ID with recipe record
- Use stored thumbnail as recipe image in library

## Visual Design

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/discover-channels.png`**
- Header with "Discover" title and "X following" count in top right
- Search bar with placeholder "Search channels..."
- View toggle buttons: "Video Feed" (camera icon) and "Channels" (people icon)
- Horizontal scrolling category chips with icons: Italian, Asian, Quick Meals, Baking, Healthy, BBQ & Grilling
- Channel filter tabs: All, Following (count), Featured
- "Featured Creators" section with 2-column grid of channel cards
- "Suggested for You" section below Featured Creators

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/channel-detail.png`**
- Orange gradient header background with back arrow
- Large channel avatar (rounded square) with letter initial fallback
- Channel name with "Featured" badge (orange star icon)
- Stats row: subscriber count, video count
- Category tag in green (e.g., "Baking")
- Channel description text (2-3 lines)
- "Following" button (checkmark icon, stone background when following)
- "Latest Videos" section header
- 2-column video grid with thumbnail, duration badge, title, view count, and date

**`/Users/tarikmoody/Documents/Projects/digero/product-plan/sections/discover/discover-feed.png`**
- Full-width video cards in vertical scroll list
- Large thumbnail with duration badge (bottom-right corner)
- Play button overlay on hover/tap
- Orange "Save Recipe" button (plus icon) appears top-right on hover
- Channel avatar (circular) below thumbnail
- Video title (2-line clamp)
- Channel name
- View count and time ago (e.g., "520K views - Today")

## Existing Code to Leverage

**Discover Section Components (`product-plan/sections/discover/components/`)**
- `Discover.tsx`: Main view with feed/channels toggle, search, category chips, and channel filtering
- `VideoCard.tsx`: Video card with thumbnail, duration badge, play overlay, and save button
- `ChannelCard.tsx`: Channel card with avatar, name, description, category tag, and follow button
- `ChannelDetail.tsx`: Full channel page with header, stats, and video grid
- `CategoryChip.tsx`: Category browsing chip with icon and selection state

**RecipePreviewModal (`product-plan/sections/discover/components/RecipePreviewModal.tsx`)**
- Modal pattern with backdrop blur, slide-up animation, and sticky header/footer
- Recipe preview with title, time, servings, ingredients list, and instructions preview
- AI extraction note with orange info box styling
- Confirm save and cancel buttons in footer
- Needs enhancement: add editable fields for inline editing before save

**Type Definitions (`product-plan/sections/discover/types.ts`)**
- `Channel`, `Video`, `FeedVideo`, `RecipePreview` interfaces ready to use
- Component prop interfaces for all Discover components
- Extend `RecipePreviewModalProps` to include editing callbacks

**Core Recipe Model (`product-plan/data-model/types.ts`)**
- `Recipe` interface already supports `source: 'youtube'` and `youtubeVideoId` field
- `Ingredient` interface with name, quantity, unit, and category
- Use existing structure for extracted recipe data

**ScanSession Pattern (`product-plan/sections/recipe-library/components/ScanSession.tsx`)**
- Multi-step flow pattern: cover -> scanning -> processing -> review -> complete
- Processing state with Sparkles icon and "AI is reading..." message
- Review state with extracted data preview and action buttons
- Apply similar flow pattern for YouTube extraction: URL input -> fetching -> extracting -> review

## Out of Scope

- YouTube OAuth authentication (use public API with key only)
- Syncing user's personal YouTube subscriptions
- Video recommendation algorithm beyond following channels
- Comments or community engagement features
- Video upload or content creation
- Offline video playback or caching
- Push notifications for new videos from followed channels
- Playlist import or bulk video processing
- Video transcript editing or annotation
- Channel analytics or engagement metrics

# Milestone 3: Discover

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestones 1-2 complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement Discover — the YouTube channel hub for finding cooking creators, following them, and saving recipes from their videos.

## Overview

Discover helps users find cooking content on YouTube. They can browse a video feed from followed channels, discover new channels through featured creators and categories, and save recipes with one tap. AI extracts recipe details from videos for preview before saving.

**Key Functionality:**
- Browse video feed from followed channels
- Search for YouTube cooking channels
- Browse featured/popular channels and categories
- Follow/unfollow channels
- View channel details with recent videos
- Preview AI-extracted recipe before saving to library

## Recommended Approach: Test-Driven Development

See `product-plan/sections/discover/tests.md` for test-writing instructions.

## What to Implement

### Components

Copy from `product-plan/sections/discover/components/`:

- `Discover.tsx` — Main view with Feed/Channels toggle
- `VideoCard.tsx` — Video card for feed with save button
- `ChannelCard.tsx` — Channel card with follow button
- `ChannelDetail.tsx` — Full channel page
- `RecipePreviewModal.tsx` — AI recipe extraction preview
- `CategoryChip.tsx` — Category browsing chips

### Data Layer

```typescript
interface Channel {
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

interface FeedVideo extends Video {
  channelId: string
  channelName: string
  channelAvatarUrl: string
}
```

You'll need to:
- YouTube Data API integration for channel/video data
- Store followed channels per user
- AI service for recipe extraction from videos
- Cache video feed data

### Callbacks

| Callback | Description |
|----------|-------------|
| `onViewModeChange` | Toggle between feed and channels view |
| `onSearch` | Search YouTube channels |
| `onViewChannel` | Navigate to channel detail |
| `onFollow` | Follow a channel |
| `onUnfollow` | Unfollow a channel |
| `onWatchVideo` | Open video (YouTube player or in-app) |
| `onSaveRecipe` | Extract recipe and show preview modal |
| `onSelectCategory` | Filter channels by category |

### Empty States

- **No followed channels:** Show featured channels with CTA to follow
- **Empty feed:** Show message encouraging user to follow channels
- **No search results:** Show "No channels found" with suggestions

## Files to Reference

- `product-plan/sections/discover/README.md`
- `product-plan/sections/discover/tests.md`
- `product-plan/sections/discover/components/`
- `product-plan/sections/discover/types.ts`
- `product-plan/sections/discover/sample-data.json`

## Expected User Flows

### Flow 1: Follow a Channel

1. User switches to "Channels" view
2. User browses featured channels or searches
3. User taps "Follow" button on a channel card
4. **Outcome:** Channel added to following, videos appear in feed

### Flow 2: Save Recipe from Video

1. User sees a video in their feed
2. User taps "Save" bookmark icon
3. Modal shows AI-extracted recipe preview (title, ingredients, instructions)
4. User confirms to save
5. **Outcome:** Recipe saved to library with YouTube source

### Flow 3: Browse Channel Detail

1. User taps a channel card
2. User sees channel info and all recent videos
3. User can follow/unfollow and save recipes from any video

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Video feed shows content from followed channels
- [ ] Channels view with featured and categories works
- [ ] Search finds YouTube channels
- [ ] Follow/unfollow persists
- [ ] Recipe extraction and preview modal work
- [ ] Empty states display properly
- [ ] Matches visual design
- [ ] Responsive on mobile

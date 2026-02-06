# Digero

> Your personal recipe assistant — save, organize, and cook with confidence.

## Overview

Digero is a mobile recipe app that helps home cooks save recipes from YouTube videos, websites, or physical cookbooks, organize them into collections, plan weekly meals, and generate shopping lists. Built for the **RevenueCat Shipyard 2026 Hackathon**.

### Key Features

- **Sous Chef Chat** — Conversational AI assistant for recipe ideas, cooking tips, and ingredient questions
- **Import from Anywhere** — Paste a URL from any recipe website or YouTube cooking video
- **Creator Attribution** — Show channel names and website sources to support creators
- **iOS Share Extension** — Share recipes directly from Safari or YouTube to Digero
- **YouTube Discovery** — Browse trending cooking channels and import video recipes
- **AI-Powered Extraction** — Gemini AI extracts ingredients and instructions automatically
- **Dietary Conversions** — Convert any recipe to vegan, vegetarian, or gluten-free with AI
- **Cookbook Organization** — Create custom collections to organize your recipes
- **Meal Planning** — Plan your weekly meals with a drag-and-drop calendar
- **Smart Shopping Lists** — Auto-generate shopping lists from your meal plan
- **Instacart Integration** — Send shopping lists directly to Instacart for easy ordering
- **Cook Mode** — Hands-free step-by-step cooking guidance with voice assistant
- **Voice Assistant** — Ask questions while cooking using Speechmatics Flow AI
- **Dark Mode** — Full dark theme support

## Creator Economy

Digero features a Nebula-inspired creator economy that rewards cooking content creators:

### For Creators

- **Creator Dashboard** — Track earnings, engagement, and Recipe Engagement Score (RES)
- **Creator Shop** — Sell cookbooks, equipment, and digital products
- **Profit Sharing** — 50% of subscription revenue goes to the creator pool
- **Partnership Tiers** — Standard, Partner, and Elite tiers with increasing benefits

### How It Works

1. **Recipe Engagement Score (RES)** — Creators earn points when users save, cook, share, or rate their recipes
2. **Revenue Pool** — 50% of all subscription revenue goes to the creator pool
3. **Fair Distribution** — Creators receive payouts proportional to their RES share
4. **Tier Multipliers** — Higher tiers earn RES bonuses (1.25x for Partner, 1.5x for Elite)

## Subscription Tiers

| Feature | Free | Plus ($4.99/mo) | Creator ($9.99/mo) |
|---------|------|-----------------|-------------------|
| Save Recipes | 10 | Unlimited | Unlimited |
| AI Chat Messages | 5/day | Unlimited | Unlimited |
| Recipe Scans | 3/month | Unlimited | Unlimited |
| Exclusive Recipes | — | ✓ | ✓ |
| Creator Dashboard | — | — | ✓ |
| Sell Products | — | — | ✓ |
| Ad-Free Experience | — | ✓ | ✓ |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Navigation | expo-router (file-based routing) |
| Backend | Convex (real-time database) |
| Auth | Clerk (email, Apple, Google) |
| Payments | RevenueCat |
| AI | Google Gemini 2.0 Flash, Speechmatics Flow |
| Chat UI | react-native-gifted-chat |
| Styling | NativeWind v4 (Tailwind CSS) |
| Icons | lucide-react-native |

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Xcode 15+ (for iOS development)
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/tmoody1973/digero.git
cd digero

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

Create a `.env.local` file with the following:

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | Yes |
| `EXPO_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | RevenueCat iOS API key | Yes |

**Convex Environment Variables** (set via `npx convex env set`):

| Variable | Description |
|----------|-------------|
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat webhook auth |
| `SPEECHMATICS_API_KEY` | Speechmatics Flow API key |
| `INSTACART_API_KEY` | Instacart Developer Platform API key |

### Development

```bash
# Start Convex dev server (in one terminal)
npx convex dev

# Start Expo dev server (in another terminal)
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Project Structure

```
digero/
├── app/                    # expo-router screens
│   ├── (app)/              # Authenticated app screens
│   │   ├── recipes/        # Recipe list, detail, cook mode
│   │   ├── discover/       # YouTube channel discovery
│   │   ├── creator/        # Creator dashboard and shop
│   │   ├── meal-planner/   # Meal planning calendar
│   │   ├── shopping/       # Shopping lists
│   │   └── settings/       # App settings and subscription
│   ├── (auth)/             # Authentication screens
│   ├── (onboarding)/       # Onboarding flow
│   └── _layout.tsx         # Root layout with providers
├── components/             # Shared UI components
│   ├── recipes/            # Recipe-related components
│   ├── chat/               # Sous Chef chat components
│   ├── creator/            # Creator dashboard components
│   ├── subscription/       # Paywall and tier components
│   ├── cookbooks/          # Cookbook components
│   └── navigation/         # Navigation components
├── convex/                 # Convex backend
│   ├── actions/            # Server actions (AI, external APIs)
│   ├── recipes.ts          # Recipe queries/mutations
│   ├── creator.ts          # Creator profiles and applications
│   ├── creatorShop.ts      # Product and order management
│   ├── creatorMessaging.ts # Creator-to-follower messaging
│   ├── subscriptions.ts    # Subscription management
│   ├── users.ts            # User management
│   └── schema.ts           # Database schema
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and helpers
│   ├── revenuecat.ts       # RevenueCat configuration
│   ├── subscriptionTiers.ts # Tier limits and features
│   └── creatorUtils.ts     # Creator-related utilities
└── ios/                    # Native iOS code + Share Extension
```

## Features in Detail

### Sous Chef Chat

Your personal AI cooking assistant powered by Gemini 2.0 Flash:

- **Conversational** — Chat naturally about cooking, ask questions, get tips
- **Recipe Generation** — Describe ingredients you have and get custom recipes
- **Image Recognition** — Take a photo of ingredients and get meal suggestions
- **Voice Input** — Speak your requests hands-free
- **Quick Replies** — Tap suggested follow-up questions
- **Save to Library** — Add AI-generated recipes directly to your collection

Access Sous Chef from the Add Recipe menu or navigate to Recipes > Sous Chef.

### Recipe Import

Import recipes from:
- **URLs** — Paste any recipe website URL
- **YouTube** — Import from cooking videos with transcript extraction
- **Share Extension** — Share directly from Safari or YouTube app
- **Manual Entry** — Create recipes from scratch

All imported recipes show the source (channel name for YouTube, website domain for URLs) to properly attribute creators.

### Creator Dashboard

For users with Creator tier subscriptions:

- **Earnings Overview** — Track total earnings and pending payouts
- **Recipe Analytics** — See which recipes drive the most engagement
- **RES Tracking** — Monitor your Recipe Engagement Score in real-time
- **Product Management** — Add and manage shop products
- **Follower Messaging** — Send updates to your followers

### Dietary Conversions

Convert any recipe to:
- **Vegan** — No animal products
- **Vegetarian** — No meat or fish
- **Gluten-Free** — No wheat, barley, or rye

The AI provides smart substitutions and cooking tips for each conversion.

### Cook Mode

Hands-free cooking experience:
- Large, easy-to-read instructions
- Step-by-step navigation
- Keep screen awake while cooking
- Timer integration
- **Voice Assistant** — Tap the mic button to ask questions about your recipe
  - "What step am I on?"
  - "How much butter do I need?"
  - "What temperature should the oven be?"
  - Expert cooking technique knowledge built-in

## Building for Production

```bash
# Build for iOS TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios

# Build for Android
eas build --platform android --profile production
```

## API Keys Setup

### Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Set in Convex: `npx convex env set GEMINI_API_KEY your_key`

### YouTube Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable YouTube Data API v3
3. Create an API key
4. Set in Convex: `npx convex env set YOUTUBE_API_KEY your_key`

### Clerk Authentication

1. Create a project at [Clerk](https://clerk.com/)
2. Enable email/password, Apple, and Google sign-in
3. Copy the publishable key to `.env.local`
4. Configure webhooks pointing to your Convex deployment

### RevenueCat

1. Create a project at [RevenueCat](https://www.revenuecat.com/)
2. Add your iOS app with bundle ID
3. Create products:
   - `digero_plus_monthly` — $4.99/month
   - `digero_plus_annual` — $49.99/year
   - `digero_creator_monthly` — $9.99/month
   - `digero_creator_annual` — $99.99/year
4. Create entitlements: `plus`, `creator`
5. Copy the API key to `.env.local`

### Speechmatics Flow (Voice Assistant)

1. Create an account at [Speechmatics Portal](https://portal.speechmatics.com/)
2. Generate an API key
3. Set in Convex: `npx convex env set SPEECHMATICS_API_KEY your_key`

### Instacart (Shopping Integration)

1. Create an account at [Instacart Developer Platform](https://developer.instacart.com/)
2. Create a new application and get your API key
3. Set in Convex: `npx convex env set INSTACART_API_KEY your_key`

## Contributing

This project was built for the RevenueCat Shipyard 2026 Hackathon.

## License

MIT

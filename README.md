# Digero

> Your personal recipe assistant — save, organize, and cook with confidence.

## Overview

Digero is a mobile recipe app that helps home cooks save recipes from YouTube videos, websites, or physical cookbooks, organize them into collections, plan weekly meals, and generate shopping lists. Built for the **RevenueCat Shipyard 2026 Hackathon**.

### Key Features

- **Import from Anywhere** — Paste a URL from any recipe website or YouTube cooking video
- **iOS Share Extension** — Share recipes directly from Safari or YouTube to Digero
- **YouTube Discovery** — Browse trending cooking channels and import video recipes
- **AI-Powered Extraction** — Gemini AI extracts ingredients and instructions automatically
- **Dietary Conversions** — Convert any recipe to vegan, vegetarian, or gluten-free with AI
- **Cookbook Organization** — Create custom collections to organize your recipes
- **Meal Planning** — Plan your weekly meals with a drag-and-drop calendar
- **Smart Shopping Lists** — Auto-generate shopping lists from your meal plan
- **Cook Mode** — Hands-free step-by-step cooking guidance with voice assistant
- **Voice Assistant** — Ask questions while cooking using Speechmatics Flow AI
- **Dark Mode** — Full dark theme support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Navigation | expo-router (file-based routing) |
| Backend | Convex (real-time database) |
| Auth | Clerk (email, Apple, Google) |
| Payments | RevenueCat |
| AI | Google Gemini API, Speechmatics Flow |
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
│   │   ├── add-recipe/     # Recipe import flows
│   │   ├── discover/       # YouTube channel discovery
│   │   ├── meal-plan/      # Meal planning calendar
│   │   ├── shopping/       # Shopping lists
│   │   └── settings.tsx    # App settings
│   ├── (auth)/             # Authentication screens
│   └── _layout.tsx         # Root layout with providers
├── components/             # Shared UI components
│   ├── recipes/            # Recipe-related components
│   ├── cookbooks/          # Cookbook components
│   └── navigation/         # Navigation components
├── contexts/               # React contexts
│   ├── ThemeContext.tsx    # Dark mode management
│   └── SubscriptionContext.tsx
├── convex/                 # Convex backend
│   ├── actions/            # Server actions (AI, external APIs)
│   ├── recipes.ts          # Recipe queries/mutations
│   ├── users.ts            # User management
│   └── schema.ts           # Database schema
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and helpers
└── ios/                    # Native iOS code + Share Extension
```

## Features in Detail

### Recipe Import

Import recipes from:
- **URLs** — Paste any recipe website URL
- **YouTube** — Import from cooking videos with transcript extraction
- **Share Extension** — Share directly from Safari or YouTube app
- **Manual Entry** — Create recipes from scratch

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
3. Create products and entitlements
4. Copy the API key to `.env.local`

### Speechmatics Flow (Voice Assistant)

1. Create an account at [Speechmatics Portal](https://portal.speechmatics.com/)
2. Generate an API key
3. Set in Convex: `npx convex env set SPEECHMATICS_API_KEY your_key`

## Contributing

This project was built for the RevenueCat Shipyard 2026 Hackathon.

## License

MIT

# Tech Stack

## Overview

Digero is built as a mobile-first iOS application using React Native and Expo, with a serverless backend powered by Convex. This stack is optimized for rapid development, real-time data synchronization, and seamless deployment to TestFlight.

---

## Framework and Runtime

### React Native with Expo
- **Purpose:** Cross-platform mobile application framework
- **Version:** Expo SDK 52+ (latest stable)
- **Rationale:** Expo provides managed workflow with over-the-air updates, simplified native module handling, and streamlined TestFlight deployment via EAS. React Native enables code reuse for future Android support.
- **Key Packages:**
  - `expo` - Core Expo SDK
  - `expo-camera` - Camera access for cookbook scanning
  - `expo-image-picker` - Photo library access
  - `expo-router` - File-based navigation

### TypeScript
- **Purpose:** Type-safe JavaScript development
- **Rationale:** Catches errors at compile time, improves IDE support, and provides better documentation through types. Essential for maintaining code quality in a fast-paced hackathon environment.

---

## Backend and Database

### Convex
- **Purpose:** Backend-as-a-service with real-time database
- **Rationale:** Zero-config backend with automatic real-time sync, serverless functions, and TypeScript-first development. Eliminates need for separate API layer and database setup. Perfect for rapid prototyping with production-ready infrastructure.
- **Key Features Used:**
  - Real-time queries and mutations
  - File storage for recipe images
  - Serverless functions for AI integrations
  - Built-in authentication integration with Clerk
- **Key Packages:**
  - `convex` - Convex client and CLI
  - `convex-react-native` - React Native bindings

---

## Authentication

### Clerk
- **Purpose:** User authentication and identity management
- **Rationale:** Drop-in authentication with pre-built UI components, social login support, and native Convex integration. Handles session management, secure token storage, and user metadata without custom implementation.
- **Key Features Used:**
  - Email/password authentication
  - Social login (Google, Apple)
  - Session management
  - User metadata storage
- **Key Packages:**
  - `@clerk/clerk-expo` - Expo SDK integration
- **Integration Notes:** Clerk syncs user data to Convex automatically via webhook, enabling user-scoped queries without additional setup.

---

## Monetization

### RevenueCat
- **Purpose:** In-app subscription management
- **Rationale:** Required for RevenueCat Shipyard hackathon. Provides unified subscription infrastructure, receipt validation, analytics, and cross-platform support. Simplifies App Store Connect integration.
- **Key Features Used:**
  - Product configuration (monthly/annual subscriptions)
  - Entitlement management
  - Purchase flow handling
  - Restore purchases
- **Key Packages:**
  - `react-native-purchases` - RevenueCat React Native SDK
- **Integration Notes:** Subscription status synced to Convex user record for server-side entitlement checks.

---

## AI and Machine Learning

### Google Gemini API
- **Purpose:** OCR and recipe extraction from cookbook photos
- **Rationale:** Multimodal AI model capable of understanding images and extracting structured text. Superior accuracy for recipe extraction compared to traditional OCR solutions. Handles varied cookbook layouts and handwritten notes.
- **Key Features Used:**
  - Vision API for image analysis
  - Structured output for recipe parsing
  - Text extraction with formatting preservation
- **Integration Notes:** Called from Convex serverless function to keep API keys secure. Image sent as base64, response parsed into recipe schema.

### YouTube Data API v3
- **Purpose:** Extract recipe information from YouTube cooking videos
- **Rationale:** Enables importing recipes from popular food content creators. Users can paste a YouTube URL and the app extracts recipe details from video descriptions, titles, and metadata.
- **Key Features Used:**
  - Videos.list - Fetch video metadata (title, description, thumbnails)
  - Captions.list - Access video captions for recipe extraction (if available)
- **Free Tier:** 10,000 quota units/day (sufficient for recipe app usage)
- **Integration Notes:** Called from Convex serverless function. Video ID extracted from URL, metadata fetched via API, then Gemini processes the description to extract structured recipe data.

### Edamam API (Post-MVP)
- **Purpose:** Nutrition analysis for recipes
- **Rationale:** Industry-standard nutrition database with ingredient parsing. Provides accurate macro and micronutrient data from ingredient lists.
- **Integration Notes:** Deferred to post-hackathon phase. Will be called from Convex function with ingredient list input.

---

## Third-Party Integrations

### Instacart API (Post-MVP)
- **Purpose:** Grocery delivery integration
- **Rationale:** Allows users to send shopping lists directly to Instacart for delivery or pickup, completing the inspiration-to-table workflow.
- **Integration Notes:** Deferred to post-hackathon phase. Requires Instacart partner API access and OAuth flow implementation.

---

## Development Tools

### Package Manager
- **npm** - Node package manager (default for Expo projects)

### Linting and Formatting
- **ESLint** - JavaScript/TypeScript linting with Expo preset
- **Prettier** - Code formatting with consistent style

### Testing
- **Jest** - Unit testing framework (Expo default)
- **React Native Testing Library** - Component testing

---

## Deployment and Infrastructure

### Expo Application Services (EAS)
- **Purpose:** Build and deployment pipeline
- **Components:**
  - **EAS Build** - Cloud builds for iOS and Android
  - **EAS Submit** - Automated App Store and TestFlight submission
  - **EAS Update** - Over-the-air JavaScript updates
- **Rationale:** Managed CI/CD specifically designed for Expo apps. Handles code signing, provisioning profiles, and App Store Connect integration.

### TestFlight
- **Purpose:** iOS beta distribution for hackathon submission
- **Deployment Command:** `npx testflight` or `eas build --platform ios && eas submit --platform ios`

---

## Architecture Summary

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   React Native   |<--->|     Convex       |<--->|   Gemini API     |
|   (Expo)         |     |   (Backend)      |     |   (OCR)          |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |
        v                        v
+------------------+     +------------------+
|                  |     |                  |
|     Clerk        |     |   RevenueCat     |
|   (Auth)         |     |   (Payments)     |
|                  |     |                  |
+------------------+     +------------------+
```

---

## Environment Variables

The following environment variables are required:

```
# Convex
CONVEX_DEPLOYMENT=<deployment-url>

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-key>

# RevenueCat
REVENUECAT_API_KEY=<revenuecat-key>

# Gemini (server-side only, stored in Convex)
GEMINI_API_KEY=<gemini-key>

# YouTube Data API (server-side only, stored in Convex)
YOUTUBE_API_KEY=<youtube-data-api-key>
```

> **Note:** All sensitive keys should be stored in Convex environment variables for server-side functions, not in the mobile app bundle.

# Digero — Claude Code Instructions

## Project Overview

Digero is a mobile recipe app built with **React Native + Expo** and **Convex** backend. It helps home cooks save recipes from YouTube, websites, or physical cookbooks, organize them into collections, plan weekly meals, and generate shopping lists.

**Hackathon:** RevenueCat Shipyard 2026 (2-week timeline)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 52+ |
| Navigation | expo-router (file-based) |
| Backend | Convex (real-time database) |
| Auth | Clerk (email, Apple, Google) |
| Payments | RevenueCat |
| AI | Google Gemini API |
| Styling | NativeWind (Tailwind for RN) |

## MCP Servers

This project uses MCP servers to accelerate development. **Always use these tools** instead of searching the web or guessing.

### Expo MCP (`expo-mcp`)

Use the Expo MCP for all Expo/React Native questions and library installation.

```
# Search Expo documentation
mcp__expo-mcp__search_documentation(query: "push notifications setup")

# Add libraries with proper linking
mcp__expo-mcp__add_library(projectRoot: "/path/to/digero", libraryName: "expo-camera")

# Learn Expo patterns
mcp__expo-mcp__learn(topic: "expo-router")

# EAS Build workflows
mcp__expo-mcp__workflow(action: "learn")
mcp__expo-mcp__workflow(action: "create", projectRoot: "...", fileName: "build.yml", workflowYaml: "...")
```

**When to use:**
- Installing any npm package for Expo → `add_library` (handles native linking)
- Questions about Expo APIs → `search_documentation`
- Setting up EAS Build/Submit → `workflow`
- expo-router patterns → `learn`

### Convex MCP (`convex`)

Use the Convex MCP to inspect and interact with the database.

```
# Get deployment info (run this first)
mcp__convex__status(projectDir: "/path/to/digero")

# List all tables and schemas
mcp__convex__tables(deploymentSelector: "...")

# Get function specs (queries, mutations, actions)
mcp__convex__functionSpec(deploymentSelector: "...")

# Read data from a table
mcp__convex__data(deploymentSelector: "...", tableName: "recipes", order: "desc")

# Run a function
mcp__convex__run(deploymentSelector: "...", functionName: "recipes:list", args: "{}")
```

**When to use:**
- Before writing Convex functions → check existing `functionSpec`
- Debugging data issues → `data` to inspect tables
- Understanding schema → `tables`
- Testing mutations → `run`

## Design System

**Colors:**
- Primary: `orange-500` (#f97316) — buttons, links, accents
- Secondary: `green-500` — success states, checkmarks
- Neutral: `stone-*` — backgrounds, text, borders

**Typography:** Nunito Sans (headings + body), IBM Plex Mono (code)

**Spacing:** 4px base unit (p-1 = 4px, p-2 = 8px, etc.)

## Project Structure

```
digero/
├── app/                    # expo-router screens (create this)
├── components/             # Shared UI components (create this)
├── convex/                 # Convex backend functions (create this)
├── hooks/                  # Custom React hooks (create this)
├── lib/                    # Utilities and helpers (create this)
├── product-plan/           # UI mockups and type definitions (reference)
│   ├── data-model/types.ts # Core TypeScript types
│   └── sections/           # Section-specific components and data
└── agent-os/
    └── specs/              # Feature specifications and tasks
```

## Specs & Tasks

All 13 feature specs are in `agent-os/specs/2026-02-02-*/`:

| Priority | Spec | Description |
|----------|------|-------------|
| 1 | user-authentication | Clerk auth (email, Apple, Google) |
| 2 | recipe-data-model | Convex schema and types |
| 3 | manual-recipe-creation | Form-based recipe entry |
| 4 | recipe-list-detail-views | List, search, filter, Cook Mode |
| 5 | web-recipe-import | URL paste with Gemini extraction |
| 6 | cookbook-organization | Custom collections |
| 7 | cookbook-photo-scanning | Camera OCR with Gemini |
| 8 | meal-planner-calendar | Weekly calendar with drag-drop |
| 9 | shopping-list-generation | Auto-generated shopping lists |
| 10 | revenuecat-subscription | Payment integration |
| 11 | paywall-feature-gating | Freemium limits and upgrades |
| 12 | youtube-recipe-import | YouTube Data API + Discover tab |
| 13 | testflight-deployment | EAS Build + TestFlight |

Each spec folder contains:
- `spec.md` — Detailed requirements
- `tasks.md` — Actionable task checklist
- `planning/requirements.md` — Original requirements

## Coding Conventions

### Convex Functions

```typescript
// convex/recipes.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
```

### React Native Components

```typescript
// components/RecipeCard.tsx
import { View, Text, Pressable } from "react-native";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-xl p-4 shadow-sm">
      {/* ... */}
    </Pressable>
  );
}
```

### expo-router Screens

```typescript
// app/(tabs)/recipes/index.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function RecipesScreen() {
  const recipes = useQuery(api.recipes.list, { userId: user.id });
  // ...
}
```

## Critical Reminders

1. **Apple Developer Enrollment** — Start immediately, 24-48 hour approval wait
2. **Use MCP tools** — Don't guess, query Expo docs and Convex schema
3. **Check product-plan/** — Reference existing UI mockups and types
4. **Test on device** — Use Expo Go during development
5. **RevenueCat sandbox** — Test purchases in sandbox mode only

## Convex Deployments

| Environment | URL | Deployment Selector |
|-------------|-----|---------------------|
| Development | https://energetic-fish-994.convex.cloud | `dev:energetic-fish-994` |

**Always deploy to dev during development:**
```bash
npx convex dev
```

## Quick Commands

```bash
# Start development
npx expo start

# Run on iOS simulator
npx expo run:ios

# Deploy Convex functions (interactive, watches for changes)
npx convex dev

# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

## Reference Files

- Types: `product-plan/data-model/types.ts`
- UI Patterns: `product-plan/sections/*/components/`
- Mock Data: `product-plan/sections/*/data.json`
- Visual Mockups: `product-plan/sections/*/images/`

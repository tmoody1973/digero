# Digero — Product Overview

## Summary

Digero is a mobile recipe app that helps home cooks turn culinary inspiration into home-cooked meals. Save recipes from YouTube, websites, or physical cookbooks using your camera, organize them into custom collections, plan your weekly meals, and generate shopping lists automatically.

## Problems Solved

1. **The Inspiration-to-Action Gap** — Save recipes from any source with one tap or snap
2. **Recipes Scattered Everywhere** — Organize into custom cookbooks by theme, cuisine, or occasion
3. **Meal Planning is Tedious** — Drag and drop recipes onto a weekly calendar
4. **Shopping Lists Take Too Long** — Auto-generate categorized shopping lists from meal plans
5. **Physical Cookbook Recipes Are Trapped** — Scan any cookbook page with AI extraction

## Planned Sections

1. **Recipe Library** — Save, view, and manage recipes from YouTube, websites, and physical cookbooks via camera scanning
2. **Discover** — Follow YouTube cooking channels, browse their latest videos, and save recipes with one tap
3. **Cookbooks** — Organize recipes into custom collections by theme, cuisine, or occasion
4. **Meal Planner** — Plan weekly meals with a visual calendar using drag-and-drop from your recipe library
5. **Shopping Lists** — Auto-generate categorized shopping lists from meal plans with item tracking

## Data Model

**Entities:**
- Recipe — Saved recipes with title, ingredients, instructions, source metadata
- Channel — YouTube cooking channels users follow
- Cookbook — Custom recipe collections
- MealPlan — Weekly meal schedules with recipes assigned to slots
- ShoppingList — Generated ingredient lists from meal plans
- ShoppingItem — Individual items with quantity, unit, and category

## Design System

**Colors:**
- Primary: `orange` — Used for buttons, links, key accents
- Secondary: `green` — Used for success states, checkmarks, completed items
- Neutral: `stone` — Used for backgrounds, text, borders

**Typography:**
- Heading: Nunito Sans
- Body: Nunito Sans
- Mono: IBM Plex Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **Recipe Library** — Core recipe management with multi-source import
3. **Discover** — YouTube channel browsing and following
4. **Cookbooks** — Recipe organization into collections
5. **Meal Planner** — Weekly calendar with drag-and-drop planning
6. **Shopping Lists** — Auto-generated shopping lists with item tracking

Each milestone has a dedicated instruction document in `product-plan/instructions/`.

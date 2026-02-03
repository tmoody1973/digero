# Data Model

## Overview

Digero uses a straightforward data model centered around recipes, with supporting entities for organization, planning, and shopping.

## Entities

### Recipe
A saved recipe containing title, ingredients, instructions, and metadata about its source. Recipes can be imported from YouTube videos, websites, or scanned from physical cookbooks using the camera.

### Channel
A YouTube cooking channel that users follow to discover new recipes. Channels display their latest videos and make it easy to save recipes with one tap.

### Cookbook
A custom collection of recipes organized by the user. Cookbooks can be themed around cuisines, occasions, dietary preferences, or any category the user chooses.

### MealPlan
A weekly plan where users assign recipes to specific days and meal slots (breakfast, lunch, dinner, snacks). Provides a visual calendar view for planning ahead.

### ShoppingList
A generated list of ingredients derived from a meal plan. Items are automatically grouped by category (produce, dairy, meat, etc.) for efficient shopping.

### ShoppingItem
An individual ingredient on a shopping list with quantity, unit, and category. Can be checked off as the user shops.

## Relationships

- Cookbook has many Recipes (a recipe can belong to multiple cookbooks)
- Channel has many Recipes (recipes saved from that channel link back to their source)
- MealPlan has many Recipes (assigned to specific days and meal slots)
- ShoppingList belongs to MealPlan (generated from the plan's recipes)
- ShoppingList has many ShoppingItems

## Type Definitions

See `types.ts` for complete TypeScript interfaces.

## Sample Data

See `sample-data.json` for example data to use during development.

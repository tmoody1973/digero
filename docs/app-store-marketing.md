# Digero - App Store Marketing Assets

## App Information

**App Name:** Digero

**Subtitle (30 characters max):**
```
Smart Recipe Management
```

**Promotional Text (170 characters max - can be updated anytime):**
```
Save recipes from anywhere, plan meals for the week, and generate smart shopping lists. Scan physical cookbooks or import from YouTube and websites with AI-powered extraction.
```

## App Description (4000 characters max)

```
Digero transforms the way you cook at home. Stop losing track of recipes and start enjoying organized meal planning with the smartest recipe app on iOS.

SAVE RECIPES FROM ANYWHERE
• Scan physical cookbook pages with your camera - AI extracts ingredients and instructions automatically
• Import recipes from any website with one tap
• Save YouTube cooking videos and extract recipe details from video descriptions
• Follow your favorite cooking channels and discover new creators

ORGANIZE YOUR RECIPE COLLECTION
• Create custom cookbooks like "Weeknight Dinners", "Italian Favorites", or "Holiday Baking"
• Search and filter your entire collection instantly
• Tag recipes with dietary preferences (vegetarian, gluten-free, dairy-free)
• Rate and favorite your go-to recipes

PLAN YOUR MEALS EFFORTLESSLY
• Visual weekly calendar for meal planning
• Assign recipes to breakfast, lunch, or dinner
• Drag and drop to rearrange your week
• Never wonder "what's for dinner?" again

SMART SHOPPING LISTS
• Auto-generate grocery lists from your meal plan
• Ingredients organized by store section (produce, dairy, pantry, meat)
• Duplicate ingredients combined automatically
• Check off items as you shop

DISCOVER NEW RECIPES
• Browse curated cooking channels from top creators
• Follow channels to build your personalized video feed
• Save recipes directly from videos with one tap
• Explore categories like Italian, Asian, Quick Meals, and Healthy

PREMIUM FEATURES
Upgrade to Digero Pro for:
• Unlimited recipe storage (free tier: 10 recipes)
• Unlimited cookbook photo scans (free tier: 3/month)
• Advanced meal planning features
• Priority support

Built for home cooks who love to cook but need help staying organized. Whether you're a beginner following YouTube tutorials or a seasoned chef digitizing your grandmother's cookbook, Digero helps you go from inspiration to dinner table.

Download Digero today and transform your cooking routine.
```

## Keywords (100 characters max, comma-separated)

```
recipes,meal planning,grocery list,cooking,food scanner,cookbook,meal prep,shopping list,kitchen
```

## App Category

**Primary:** Food & Drink
**Secondary:** Lifestyle (optional)

## Age Rating

**Expected Rating:** 4+ (No objectionable content)

Answer "No" to all content questions - the app contains only recipes and cooking content.

## Privacy Policy URL

You'll need to host a privacy policy. Options:
1. Create a simple page on Vercel/Netlify
2. Use a free privacy policy generator
3. Host on GitHub Pages

**Required content:**
- What data you collect (user accounts, recipes, usage data)
- How you use the data (app functionality, no selling to third parties)
- RevenueCat for subscription management
- Clerk for authentication
- Contact information

## Support URL

Create a simple support page with:
- FAQ section
- Contact email: support@digero.app (or your email)
- Link to documentation

---

## Screenshot Descriptions

Capture these 5-10 screens at **1290 x 2796 pixels** (iPhone 15 Pro Max):

### Screenshot 1: Recipe Library
- Show home screen with recipe cards
- Overlay text: "All your recipes in one place"

### Screenshot 2: Recipe Detail
- Full recipe view with ingredients and instructions
- Overlay text: "Beautiful, easy-to-follow recipes"

### Screenshot 3: Cookbook Scanning
- Camera interface scanning a cookbook page
- Overlay text: "Scan any cookbook with your camera"

### Screenshot 4: Meal Planner
- Weekly calendar with meals assigned
- Overlay text: "Plan your week in seconds"

### Screenshot 5: Shopping List
- Organized grocery list by category
- Overlay text: "Smart shopping lists, auto-generated"

### Screenshot 6: Discover Tab (Channels)
- Channel browsing interface with featured creators
- Overlay text: "Discover recipes from top creators"

### Screenshot 7: YouTube Import
- Recipe extraction from YouTube video
- Overlay text: "Import from YouTube instantly"

### Screenshot 8: Cookbooks Organization
- Multiple cookbooks with recipe counts
- Overlay text: "Organize by cuisine, occasion, or mood"

---

## App Store Icon

**Requirements:**
- 1024 x 1024 pixels
- PNG format
- No transparency
- No rounded corners (Apple applies them)
- sRGB color space

**Source file:** `/digero_logo.svg`

Export commands:
```bash
# Using ImageMagick (if installed)
convert -background "#0c0a09" -flatten digero_logo.svg -resize 1024x1024 AppIcon.png

# Or use Figma/Sketch to export from the SVG
```

---

## What's New (for updates)

**Version 1.0.0:**
```
Welcome to Digero! Your smart recipe companion.

• Save recipes from websites, YouTube, and physical cookbooks
• AI-powered cookbook scanning extracts recipes automatically
• Plan your weekly meals with our visual calendar
• Generate smart shopping lists organized by store section
• Discover and follow your favorite cooking channels

We can't wait to hear what you think!
```

---

## Review Notes for Apple

```
Digero is a recipe management app that helps users save, organize, and plan meals.

Key features to test:
1. Sign up/Login (via Clerk - email or social sign-in)
2. Manual recipe creation
3. Web URL import (paste any recipe URL)
4. Cookbook photo scanning (uses camera to scan physical recipes)
5. Meal planner calendar
6. Shopping list generation
7. Subscription upgrade via RevenueCat

Test account credentials (if needed):
Email: [provide test account]
Password: [provide test password]

The app requires network connectivity for full functionality.
```

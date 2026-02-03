# Product Roadmap

## Timeline: 2-Week Hackathon Sprint

This roadmap is designed for a compressed 2-week timeline targeting the RevenueCat Shipyard 2026 hackathon. Features are ordered by technical dependencies and criticality to achieving a functional, demonstrable MVP.

---

## Ordered Feature Checklist

### Week 1: Foundation and Core Flow

1. [x] **User Authentication** — Implement Clerk authentication with email/social sign-in, session management, and protected routes. Users can create accounts and securely access their data. `S`

2. [x] **Recipe Data Model** — Create Convex schema for recipes with fields for title, source, sourceUrl, imageUrl, ingredients, instructions, servings, and notes. Include user relationship for multi-tenancy. `S`

3. [x] **Manual Recipe Creation** — Build recipe creation form allowing users to manually enter recipe title, ingredients list, and step-by-step instructions. Recipes save to user's account in Convex. `S`

4. [x] **Recipe List and Detail Views** — Display user's saved recipes in a scrollable list with search/filter. Tapping a recipe opens a detail view showing full ingredients and instructions in a cook-friendly format. `M`

5. [x] **Web Recipe Import** — Allow users to paste a URL from a recipe website. Parse the page to extract recipe title, ingredients, and instructions using structured data or AI extraction. `M`

6. [x] **Cookbook Organization** — Users can create named cookbooks (e.g., "Weeknight Dinners", "Italian") and assign recipes to one or more cookbooks. Include cookbook list view and filtering. `S`

### Week 2: Scanning, Planning, and Monetization

7. [x] **Cookbook Photo Scanning** — Implement camera capture for cookbook pages. Send image to Gemini API for OCR extraction of recipe title, ingredients, and instructions. Display extracted content for user review and editing before saving. `L`

8. [x] **Meal Planner Calendar** — Create weekly calendar view where users can assign recipes to specific days and meals (breakfast, lunch, dinner). Support drag-and-drop or tap-to-assign interaction. `M`

9. [x] **Shopping List Generation** — Generate aggregated shopping list from selected meal plan dates. Combine duplicate ingredients, organize by category (produce, dairy, meat, pantry), and allow manual additions. `M`

10. [x] **RevenueCat Subscription Integration** — Implement freemium model with RevenueCat. Free tier: 10 recipes, 3 scans/month. Premium tier: unlimited recipes and scans. Handle purchase flow, restore purchases, and entitlement checks. `M`

11. [x] **Paywall and Feature Gating** — Enforce free tier limits on recipe count and scan usage. Display upgrade prompts when limits reached. Gate premium features behind subscription check. `S`

12. [x] **YouTube Recipe Import** — Parse YouTube video descriptions and use AI to extract recipe information from video content. Support direct YouTube URL input via YouTube Data API v3. `M`

13. [ ] **TestFlight Deployment** — Configure EAS Build for iOS production builds. Set up App Store Connect, generate certificates, and deploy to TestFlight for hackathon submission. `S`

---

## Post-Hackathon Enhancements

These features are valuable but not critical for the 2-week MVP. They should be prioritized after successful hackathon submission.

14. [ ] **Instacart Integration** — Connect shopping lists to Instacart API. Allow users to send their generated grocery list directly to Instacart for delivery or pickup scheduling. `L`

15. [ ] **Nutrition Analysis** — Integrate Edamam API to calculate and display nutritional information (calories, macros, vitamins) for recipes. Show per-serving breakdown. `M`

16. [ ] **Recipe Sharing** — Allow users to share individual recipes or entire cookbooks via link. Recipients can view and optionally import shared recipes to their own account. `M`

17. [ ] **Android Support** — Extend Expo build configuration for Android. Test on Android devices and deploy to Google Play Store beta. `L`

18. [ ] **Dietary Filters** — Add dietary preference tags (vegetarian, vegan, gluten-free, dairy-free) to recipes. Enable filtering meal suggestions and recipes by dietary requirements. `S`

---

> **Notes**
> - Order reflects technical dependencies: auth before data, data before features, features before monetization
> - Week 1 focuses on core recipe management; Week 2 adds differentiating features and monetization
> - Cookbook scanning (item 7) is the key differentiator and must be functional for hackathon demo
> - RevenueCat integration (items 10-11) is required for hackathon eligibility
> - Post-hackathon items (13-18) are ordered by user value and technical complexity
> - Effort estimates assume a single developer working full-time

### Effort Scale Reference
- `XS`: 1 day
- `S`: 2-3 days
- `M`: 1 week
- `L`: 2 weeks
- `XL`: 3+ weeks

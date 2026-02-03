# Specification: TestFlight Deployment

## Goal
Configure EAS Build for iOS production builds, set up App Store Connect, generate certificates via EAS managed signing, and deploy Digero to TestFlight for RevenueCat Shipyard 2026 hackathon submission.

## User Stories
- As a developer, I want to deploy my app to TestFlight so that hackathon judges can evaluate the submission
- As a tester, I want to install the app via TestFlight so that I can verify functionality before hackathon deadline

## Specific Requirements

**Apple Developer Program Enrollment**
- Enroll at https://developer.apple.com/programs/enroll/ with Individual account type ($99/year)
- Complete identity verification process (may require government ID)
- Pay enrollment fee and wait for approval (typically 24-48 hours)
- Accept Apple Developer Program License Agreement after approval
- Start enrollment immediately as it is a blocking dependency for all subsequent steps

**Bundle ID Registration**
- Register explicit App ID in Apple Developer Portal under Certificates, Identifiers & Profiles
- Use Bundle ID: `com.digero.app` (must match app.json bundleIdentifier)
- Platform: iOS
- Enable capabilities: Push Notifications, In-App Purchase (required for RevenueCat)
- Description: "Digero Recipe App"

**App Store Connect App Record**
- Create new app in App Store Connect (https://appstoreconnect.apple.com)
- App Name: "Digero"
- Primary Language: English (U.S.)
- Bundle ID: Select the registered `com.digero.app`
- SKU: `digero-ios-001`
- Primary Category: Food & Drink
- Complete Age Rating questionnaire (select appropriate options for recipe content)

**EAS Build Configuration**
- Create `eas.json` at project root with cli version requirement `>= 5.0.0`
- Configure `development` profile with `developmentClient: true` and `distribution: internal`
- Configure `preview` profile with `distribution: internal` for internal testing
- Configure `production` profile with `autoIncrement: true` for build number management
- Add `submit.production.ios` section with `appleId`, `ascAppId`, and `appleTeamId` placeholders

**EAS Managed Code Signing**
- Use EAS managed signing (default) to automatically handle provisioning profiles and certificates
- EAS will prompt for Apple credentials during first build and manage all signing assets
- No manual certificate generation or profile management required
- Credentials are securely stored in Expo's infrastructure

**App Metadata and Marketing Assets**
- Generate AI marketing copy: app subtitle, description (up to 4000 chars), keywords, promotional text
- Create App Store screenshots at required resolutions: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
- Use existing Digero logo files (digero_logo_black.png, digero_logo_white.png) for App Store icon (1024x1024)
- Prepare privacy policy URL (required field - can use placeholder page initially)
- Screenshots should showcase: Home screen, Recipe detail, Scan feature, Meal planner, Shopping list

**Environment Secrets Configuration**
- Configure EAS secrets for build-time environment variables via `eas secret:create`
- Required secrets: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, EXPO_PUBLIC_CONVEX_URL
- RevenueCat API key should be configured via EXPO_PUBLIC_REVENUECAT_API_KEY
- Server-side keys (GEMINI_API_KEY, YOUTUBE_API_KEY) remain in Convex dashboard, not needed for mobile build

**TestFlight Internal Testing Setup**
- Internal testing allows up to 100 testers with no Apple review required
- Add testers via App Store Connect Users and Access or TestFlight tab
- Testers must have Apple ID and TestFlight app installed
- Builds available immediately after successful upload
- Create test notes describing hackathon submission and key features to evaluate

## Existing Code to Leverage

**Digero Logo Assets**
- `/Users/tarikmoody/Documents/Projects/digero/digero_logo_black.png` - Black version of logo for light backgrounds
- `/Users/tarikmoody/Documents/Projects/digero/digero_logo_white.png` - White version for dark backgrounds
- `/Users/tarikmoody/Documents/Projects/digero/digero_logo.svg` - Vector source for scaling to 1024x1024 App Store icon
- Use these existing brand assets for consistent App Store presence

**Product Documentation**
- `/Users/tarikmoody/Documents/Projects/digero/Comprehensive Product Documentation_ Mobile Recipe Application.md` contains app description, feature list, and user personas
- Leverage Section 3.3 Pricing Strategy for App Store subscription metadata
- Use Section 4 Feature List for marketing copy bullet points
- Reference Section 2.1 Color Palette for screenshot styling consistency

## Out of Scope
- Full App Store production release (this spec covers TestFlight beta only)
- External TestFlight testing with Apple beta review
- Android deployment (covered in separate post-hackathon roadmap item #17)
- App Store Optimization (ASO) research and keyword analysis
- App Preview videos for App Store listing
- Custom provisioning profiles or manual certificate management
- CI/CD pipeline automation (builds will be triggered manually via CLI)
- TestFlight public link distribution
- App Store pricing and availability configuration
- In-App Purchase product configuration in App Store Connect (covered by RevenueCat spec)

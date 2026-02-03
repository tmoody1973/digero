# Spec Requirements: TestFlight Deployment

## Initial Description

Configure EAS Build for iOS production builds. Set up App Store Connect, generate certificates, and deploy to TestFlight for hackathon submission.

**Source:** Product Roadmap - Week 2: Scanning, Planning, and Monetization (Feature #13)

**Effort Estimate:** Small (S) - 2-3 days

**Priority:** Critical - Required for hackathon submission

---

## Requirements Discussion

### First Round Questions

**Q1:** I assume you already have an Apple Developer account (individual or organization) enrolled in the Apple Developer Program ($99/year). Is that correct, or do we need to factor in account setup time?

**Answer:** Not yet enrolled - need to include account setup steps for hackathon.

**Q2:** I assume we need to create a new app record in App Store Connect for Digero. Have you already created the App Store Connect app entry, or should the spec include steps for initial app setup (bundle ID registration, app record creation)?

**Answer:** Include steps for initial setup (bundle ID registration, app record creation).

**Q3:** I'm thinking we should use EAS's managed code signing, which automatically handles provisioning profiles and certificates. This is the recommended approach for Expo apps. Should we use managed signing, or do you have existing certificates/profiles you want to use instead?

**Answer:** Use EAS managed signing as recommended (default accepted).

**Q4:** I assume we'll create an `eas.json` configuration with a `production` profile for TestFlight builds. The default EAS Submit flow will handle App Store Connect credentials. Is there any specific build configuration you need (e.g., specific iOS version targets, custom native modules)?

**Answer:** Yes - standard eas.json production profile.

**Q5:** For TestFlight submission, Apple requires basic metadata (app name, description, category). Do you have specific marketing copy, screenshots, or an app icon ready, or should we use placeholder content for the hackathon submission?

**Answer:** Have Claude Code generate marketing copy and screenshots.

**Q6:** I assume for the hackathon we only need internal testing (up to 100 internal testers, no Apple review required). Is that correct, or do you need external TestFlight testing (requires Apple beta review)?

**Answer:** Yes - internal testing only (up to 100 testers, no Apple review).

**Q7:** I'm thinking we should use a simple versioning scheme: `1.0.0` for the initial build with auto-incrementing build numbers managed by EAS. Is this acceptable, or do you have a specific versioning strategy in mind?

**Answer:** Yes - simple 1.0.0 with EAS auto-incrementing build numbers.

**Q8:** Is there anything that should explicitly be OUT of scope for this TestFlight deployment spec?

**Answer:** No exclusions - include all deployment steps.

---

### Existing Code to Reference

No similar existing features identified for reference. This is initial TestFlight/EAS configuration for the project.

**Files to create/configure:**
- `eas.json` - EAS Build configuration
- `app.json` or `app.config.js` - Expo app configuration (may already exist)

---

### Follow-up Questions

No follow-up questions required. All requirements are clear.

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

- App icon, screenshots, and marketing assets will be AI-generated as part of implementation
- No existing design mockups to reference for App Store presence

---

## Requirements Summary

### Functional Requirements

**Apple Developer Program Enrollment:**
- Enroll in Apple Developer Program ($99/year individual account)
- Complete identity verification process
- Accept Apple Developer Program License Agreement
- Wait for enrollment approval (typically 24-48 hours)

**App Store Connect Setup:**
- Register Bundle ID (e.g., `com.digero.app`) in Apple Developer Portal
- Create new app record in App Store Connect
- Configure app name: "Digero"
- Set primary category: Food & Drink
- Set up App Store Connect API key for EAS Submit (optional but recommended)

**EAS Build Configuration:**
- Create `eas.json` with production profile for iOS
- Configure EAS managed code signing (automatic provisioning profiles and certificates)
- Set up build versioning: version `1.0.0` with auto-incrementing build numbers
- Configure iOS-specific build settings (minimum iOS version, etc.)

**App Metadata Preparation:**
- AI-generated app description/marketing copy
- AI-generated App Store screenshots from app screens
- App icon (1024x1024 for App Store)
- Privacy policy URL (required for App Store)

**TestFlight Deployment:**
- Build iOS production binary via `eas build --platform ios`
- Submit to App Store Connect via `eas submit --platform ios`
- Configure internal TestFlight testing group
- Add internal testers (up to 100, no Apple review required)
- Distribute TestFlight build to testers

---

### Apple Developer Enrollment Checklist

1. [ ] Go to https://developer.apple.com/programs/enroll/
2. [ ] Sign in with Apple ID (or create one)
3. [ ] Choose "Individual" enrollment type
4. [ ] Complete identity verification
5. [ ] Pay $99 annual fee
6. [ ] Wait for enrollment approval (24-48 hours typical)
7. [ ] Accept Apple Developer Program License Agreement

---

### App Store Connect Setup Checklist

1. [ ] Log in to Apple Developer Portal (https://developer.apple.com)
2. [ ] Navigate to Certificates, Identifiers & Profiles
3. [ ] Register new Bundle ID (Explicit App ID)
   - Platform: iOS
   - Description: Digero Recipe App
   - Bundle ID: `com.digero.app` (or chosen identifier)
   - Enable capabilities: Push Notifications, In-App Purchase
4. [ ] Log in to App Store Connect (https://appstoreconnect.apple.com)
5. [ ] Create new app record
   - Platform: iOS
   - Name: Digero
   - Primary Language: English (U.S.)
   - Bundle ID: Select registered bundle ID
   - SKU: digero-ios-001 (unique identifier)
6. [ ] Configure app information
   - Category: Food & Drink
   - Content Rights: Does not contain third-party content
   - Age Rating: Complete questionnaire
7. [ ] (Optional) Create App Store Connect API key for automated submissions
   - Navigate to Users and Access > Keys
   - Generate new key with "App Manager" role
   - Download .p8 key file (save securely - only downloadable once)

---

### Reusability Opportunities

- EAS configuration patterns can be reused for future Android deployment (post-hackathon item #17)
- App Store Connect setup establishes foundation for production App Store release
- Build versioning strategy applies to all future releases

---

### Scope Boundaries

**In Scope:**
- Apple Developer Program enrollment guidance
- Bundle ID registration
- App Store Connect app record creation
- EAS Build configuration (`eas.json`)
- EAS managed code signing setup
- Production build for iOS
- TestFlight submission via EAS Submit
- Internal testing group configuration
- AI-generated marketing copy and screenshots
- Build versioning (1.0.0 with auto-increment)
- All necessary metadata for TestFlight (not full App Store release)

**Out of Scope:**
- None specified - all deployment steps included
- Note: Full App Store production release is naturally separate from TestFlight beta

---

### Technical Considerations

**Integration Points:**
- EAS Build cloud service for iOS builds
- EAS Submit for App Store Connect submission
- Apple Developer Portal for certificates/profiles (managed by EAS)
- App Store Connect for TestFlight distribution
- RevenueCat products must be configured in App Store Connect for in-app purchases

**Technology Stack:**
- Expo SDK 52+ with EAS Build
- EAS CLI (`eas-cli` npm package)
- React Native with TypeScript

**Environment Variables for Builds:**
- Existing env vars (CONVEX_DEPLOYMENT, EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, REVENUECAT_API_KEY) must be configured in EAS secrets
- Server-side keys (GEMINI_API_KEY, YOUTUBE_API_KEY) remain in Convex, not needed for mobile build

**Timeline Constraint:**
- 2-week hackathon deadline (RevenueCat Shipyard 2026)
- Apple Developer enrollment may take 24-48 hours for approval
- TestFlight builds available immediately after upload (no review for internal testing)

**Dependencies:**
- RevenueCat Subscription Integration (roadmap item #10) should be complete before TestFlight submission to demonstrate monetization
- App must be functional for hackathon judges to evaluate

---

### EAS Configuration Reference

```json
// eas.json structure (to be created)
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "<apple-id-email>",
        "ascAppId": "<app-store-connect-app-id>",
        "appleTeamId": "<apple-team-id>"
      }
    }
  }
}
```

---

### Deployment Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project for EAS Build
eas build:configure

# Build for iOS production
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --profile production

# Or combined build and submit
eas build --platform ios --profile production --auto-submit
```

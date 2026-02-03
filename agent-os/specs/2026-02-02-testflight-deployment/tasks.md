# Task Breakdown: TestFlight Deployment

## Overview
Total Tasks: 35
Priority: **CRITICAL** - Required for RevenueCat Shipyard 2026 hackathon submission

## CRITICAL TIMELINE WARNING

**Apple Developer Program enrollment requires 24-48 hours for approval.** This is a blocking dependency for ALL subsequent tasks. Start Task Group 1 IMMEDIATELY to avoid delays that could jeopardize hackathon submission.

---

## Task List

### Apple Developer Account Setup

#### Task Group 1: Apple Developer Program Enrollment
**Dependencies:** None
**Estimated Time:** 24-48 hours (mostly wait time)
**PRIORITY:** Start immediately - blocking dependency

- [ ] 1.0 Complete Apple Developer Program enrollment
  - [ ] 1.1 Navigate to https://developer.apple.com/programs/enroll/
  - [ ] 1.2 Sign in with Apple ID (or create new Apple ID if needed)
  - [ ] 1.3 Select "Individual" enrollment type ($99/year)
  - [ ] 1.4 Complete identity verification process
    - Have government-issued ID ready
    - Follow on-screen verification steps
    - May require phone verification or additional documentation
  - [ ] 1.5 Pay $99 annual enrollment fee
  - [ ] 1.6 Wait for enrollment approval (typically 24-48 hours)
    - Check email for approval notification
    - Can proceed with Task Group 3 (marketing assets) during wait
  - [ ] 1.7 Accept Apple Developer Program License Agreement after approval

**Acceptance Criteria:**
- Enrollment status shows "Active" in Apple Developer account
- Access to Apple Developer Portal (Certificates, Identifiers & Profiles)
- Access to App Store Connect

---

### App Store Connect Configuration

#### Task Group 2: Bundle ID and App Record Setup
**Dependencies:** Task Group 1 (requires active Apple Developer account)
**Estimated Time:** 30 minutes

- [ ] 2.0 Complete App Store Connect configuration
  - [ ] 2.1 Register Bundle ID in Apple Developer Portal
    - Navigate to https://developer.apple.com/account/resources/identifiers/list
    - Click "+" to register new identifier
    - Select "App IDs" then "App"
    - Platform: iOS
    - Description: "Digero Recipe App"
    - Bundle ID (Explicit): `com.digero.app`
    - Verify this matches `bundleIdentifier` in app.json
  - [ ] 2.2 Enable required capabilities for Bundle ID
    - Check "Push Notifications" capability
    - Check "In-App Purchase" capability (required for RevenueCat)
    - Click "Continue" and "Register"
  - [ ] 2.3 Create new app record in App Store Connect
    - Navigate to https://appstoreconnect.apple.com
    - Click "+" and select "New App"
    - Platform: iOS
    - Name: "Digero"
    - Primary Language: English (U.S.)
    - Bundle ID: Select `com.digero.app` from dropdown
    - SKU: `digero-ios-001`
    - User Access: Full Access
  - [ ] 2.4 Configure app information
    - Primary Category: Food & Drink
    - Secondary Category: (optional - leave blank or select Lifestyle)
  - [ ] 2.5 Complete Age Rating questionnaire
    - Navigate to App Information > Age Rating
    - Answer questions appropriately for recipe/food content
    - Expected rating: 4+ (no objectionable content)
  - [ ] 2.6 Record App Store Connect App ID (ascAppId)
    - Find App ID in App Information section
    - Save for EAS configuration (Task 4.4)
  - [ ] 2.7 Record Apple Team ID
    - Navigate to https://developer.apple.com/account
    - Find Team ID in Membership details
    - Save for EAS configuration (Task 4.4)

**Acceptance Criteria:**
- Bundle ID `com.digero.app` registered with Push Notifications and In-App Purchase enabled
- App record "Digero" visible in App Store Connect
- App Store Connect App ID and Apple Team ID recorded for EAS config

---

### Marketing Assets Preparation

#### Task Group 3: App Metadata and Screenshots
**Dependencies:** None (can work in parallel with Task Group 1 wait time)
**Estimated Time:** 2-3 hours

- [x] 3.0 Complete marketing assets preparation (PARTIAL - copy generated, screenshots needed)
  - [ ] 3.1 Prepare App Store icon (1024x1024 PNG)
    - Source: `/Users/tarikmoody/Documents/Projects/digero/digero_logo.svg`
    - Export at 1024x1024 pixels
    - Ensure no transparency (App Store requirement)
    - Ensure no rounded corners (Apple applies them)
    - Save to project assets folder
  - [x] 3.2 Generate AI marketing copy (DONE - see docs/app-store-marketing.md)
    - Reference: `/Users/tarikmoody/Documents/Projects/digero/Comprehensive Product Documentation_ Mobile Recipe Application.md`
    - Create app subtitle (max 30 characters)
      - Example: "Smart Recipe Management"
    - Create promotional text (max 170 characters, can be updated without review)
    - Create app description (max 4000 characters)
      - Use Section 4 Feature List for bullet points
      - Highlight: AI recipe extraction, meal planning, smart shopping lists
    - Create keywords (max 100 characters, comma-separated)
      - Examples: recipes,meal planning,grocery list,cooking,food scanner
  - [ ] 3.3 Create App Store screenshots (6.7" iPhone 15 Pro Max - required)
    - Resolution: 1290 x 2796 pixels (portrait)
    - Minimum 1 screenshot, recommended 5-10
    - Capture these key screens:
      - Home screen / Recipe library
      - Recipe detail view
      - Scan/import feature
      - Meal planner calendar
      - Shopping list
    - Add marketing overlay text if desired
    - Use simulator or physical device for captures
  - [ ] 3.4 Create App Store screenshots (6.5" iPhone 14 Plus - optional)
    - Resolution: 1284 x 2778 pixels (portrait)
    - Can reuse 6.7" screenshots (App Store allows scaling)
  - [ ] 3.5 Create App Store screenshots (5.5" iPhone 8 Plus - optional for older devices)
    - Resolution: 1242 x 2208 pixels (portrait)
    - Can reuse larger screenshots
  - [x] 3.6 Create or identify privacy policy URL (DONE - see docs/privacy-policy.html)
    - Required field for App Store submission
    - Options:
      - Create simple privacy policy page hosted on project website
      - Use placeholder URL (can update before full App Store release)
      - Example hosting: GitHub Pages, Vercel, or any web host
    - Must be publicly accessible HTTPS URL
  - [x] 3.7 Prepare support URL (DONE - see docs/support.html)
    - Required field for App Store
    - Can use same domain as privacy policy
    - Options: contact page, email link page, or GitHub repo

**Acceptance Criteria:**
- 1024x1024 App Store icon ready (no transparency, no rounded corners)
- Marketing copy written: subtitle, description, keywords, promotional text
- At least 5 screenshots at 1290x2796 resolution
- Privacy policy URL accessible
- Support URL accessible

---

### EAS Build Configuration

#### Task Group 4: EAS Project Setup
**Dependencies:** Task Group 2 (needs Bundle ID and App IDs)
**Estimated Time:** 1 hour

- [x] 4.0 Complete EAS Build configuration (PARTIAL - eas.json created, needs Apple IDs after enrollment)
  - [ ] 4.1 Install EAS CLI globally
    ```bash
    npm install -g eas-cli
    ```
  - [ ] 4.2 Login to Expo account
    ```bash
    eas login
    ```
    - Create Expo account at https://expo.dev if needed
  - [ ] 4.3 Initialize EAS in project
    ```bash
    cd /Users/tarikmoody/Documents/Projects/digero
    eas build:configure
    ```
    - This creates initial eas.json if not exists
  - [x] 4.4 Create/update eas.json configuration (DONE - needs Apple IDs filled in)
    - File: `/Users/tarikmoody/Documents/Projects/digero/eas.json`
    - Configure with recorded App Store Connect values from Task 2.6 and 2.7
    ```json
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
            "appleId": "<your-apple-id-email>",
            "ascAppId": "<app-store-connect-app-id>",
            "appleTeamId": "<apple-team-id>"
          }
        }
      }
    }
    ```
  - [x] 4.5 Verify app.json bundleIdentifier matches registered Bundle ID (DONE - com.digero.app)
    - Check `expo.ios.bundleIdentifier` equals `com.digero.app`
    - Update if necessary
  - [x] 4.6 Verify app.json version is set (DONE - 1.0.0)
    - Set `expo.version` to `1.0.0`
    - EAS will auto-increment build number

**Acceptance Criteria:**
- EAS CLI installed and logged in
- eas.json created with development, preview, and production profiles
- Submit configuration contains correct Apple credentials
- app.json bundleIdentifier matches registered Bundle ID
- Version set to 1.0.0

---

### Environment Secrets

#### Task Group 5: EAS Secrets Configuration
**Dependencies:** Task Group 4 (requires EAS project setup)
**Estimated Time:** 15 minutes

- [ ] 5.0 Configure EAS build secrets
  - [ ] 5.1 Create secret for Clerk publishable key
    ```bash
    eas secret:create --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "<your-clerk-key>" --scope project
    ```
  - [ ] 5.2 Create secret for Convex URL
    ```bash
    eas secret:create --name EXPO_PUBLIC_CONVEX_URL --value "<your-convex-url>" --scope project
    ```
  - [ ] 5.3 Create secret for RevenueCat API key
    ```bash
    eas secret:create --name EXPO_PUBLIC_REVENUECAT_API_KEY --value "<your-revenuecat-key>" --scope project
    ```
  - [ ] 5.4 Verify secrets are configured
    ```bash
    eas secret:list
    ```
    - Confirm all three secrets appear in list

**Acceptance Criteria:**
- All three EXPO_PUBLIC secrets created in EAS
- Secrets verified via `eas secret:list`
- Server-side keys (GEMINI_API_KEY, YOUTUBE_API_KEY) remain in Convex dashboard only

---

### Build and Submit

#### Task Group 6: iOS Production Build
**Dependencies:** Task Groups 4, 5 (EAS config and secrets)
**Estimated Time:** 20-40 minutes (build time)

- [ ] 6.0 Complete iOS production build
  - [ ] 6.1 Run production build
    ```bash
    cd /Users/tarikmoody/Documents/Projects/digero
    eas build --platform ios --profile production
    ```
  - [ ] 6.2 Complete EAS managed signing prompts
    - EAS will prompt for Apple Developer credentials on first build
    - Enter Apple ID email and password when prompted
    - EAS automatically creates/manages provisioning profiles and certificates
    - No manual certificate management required
  - [ ] 6.3 Monitor build progress
    - Build runs in Expo cloud infrastructure
    - Track progress at https://expo.dev/builds
    - Typical build time: 15-30 minutes
  - [ ] 6.4 Verify build success
    - Check build status shows "Finished"
    - Download .ipa artifact link available
    - Note build number for TestFlight reference

**Acceptance Criteria:**
- iOS production build completes successfully
- .ipa file generated and available in Expo dashboard
- Build number recorded

---

### TestFlight Submission

#### Task Group 7: App Store Connect Submission
**Dependencies:** Task Groups 3, 6 (marketing assets and successful build)
**Estimated Time:** 30 minutes

- [ ] 7.0 Complete TestFlight submission
  - [ ] 7.1 Submit build to App Store Connect
    ```bash
    eas submit --platform ios --profile production
    ```
    - Or use combined command for future builds:
    ```bash
    eas build --platform ios --profile production --auto-submit
    ```
  - [ ] 7.2 Wait for App Store Connect processing
    - Processing typically takes 5-15 minutes
    - Check status in App Store Connect > TestFlight tab
  - [ ] 7.3 Upload marketing assets to App Store Connect
    - Navigate to App Store > App Information
    - Upload 1024x1024 app icon
    - Add privacy policy URL
    - Add support URL
    - Navigate to App Store > Prepare for Submission
    - Upload screenshots for each device size
    - Add promotional text
    - Add description
    - Add keywords
    - Add subtitle
  - [ ] 7.4 Complete export compliance
    - App Store Connect will prompt about encryption
    - Digero uses HTTPS only (standard encryption)
    - Select "No" for custom encryption unless using additional encryption
  - [ ] 7.5 Verify build appears in TestFlight
    - Navigate to App Store Connect > TestFlight
    - Confirm build shows with correct version and build number
    - Status should show "Ready to Submit" or "Processing"

**Acceptance Criteria:**
- Build successfully submitted to App Store Connect
- Build visible in TestFlight tab
- All metadata uploaded
- Export compliance completed

---

### Internal Testing Distribution

#### Task Group 8: TestFlight Tester Setup
**Dependencies:** Task Group 7 (build in TestFlight)
**Estimated Time:** 15 minutes

- [ ] 8.0 Complete internal testing setup
  - [ ] 8.1 Add internal testers
    - Navigate to App Store Connect > Users and Access
    - Or use TestFlight > Internal Testing > App Store Connect Users
    - Add testers by Apple ID email
    - Internal testing allows up to 100 testers
    - Testers must have Apple ID
  - [ ] 8.2 Create test notes for hackathon submission
    - Navigate to TestFlight > Build > Test Details
    - Add "What to Test" notes:
      ```
      RevenueCat Shipyard 2026 Hackathon Submission

      Key features to evaluate:
      - AI-powered recipe extraction from URLs and images
      - Smart meal planning with calendar integration
      - Automatic shopping list generation
      - RevenueCat subscription integration

      Test Account: [provide if needed]
      ```
  - [ ] 8.3 Enable build for testing
    - Ensure build status is "Ready for Testing"
    - If expired, may need to resubmit
  - [ ] 8.4 Notify testers
    - TestFlight automatically sends email invitations
    - Testers install TestFlight app from App Store
    - Testers accept invitation and install build
  - [ ] 8.5 Verify tester access
    - Confirm at least one tester can successfully install
    - Test core app functionality on physical device

**Acceptance Criteria:**
- Internal testers added to TestFlight
- Test notes describe hackathon submission
- Build is available for testing
- At least one tester successfully installed and launched app

---

## Execution Order

### Recommended Implementation Sequence:

```
Day 1 (IMMEDIATELY):
1. Task Group 1: Apple Developer Enrollment (START NOW - 24-48 hour wait)
   |
   v (in parallel during wait)
   Task Group 3: Marketing Assets Preparation

Day 2-3 (after enrollment approval):
2. Task Group 2: Bundle ID and App Record Setup
   |
   v
3. Task Group 4: EAS Project Setup
   |
   v
4. Task Group 5: EAS Secrets Configuration
   |
   v
5. Task Group 6: iOS Production Build
   |
   v
6. Task Group 7: App Store Connect Submission
   |
   v
7. Task Group 8: TestFlight Tester Setup
```

### Critical Path Timeline:
- **Hours 0-48:** Apple Developer enrollment (blocking)
- **Hours 48-50:** App Store Connect setup
- **Hours 50-52:** EAS configuration and secrets
- **Hours 52-53:** Production build
- **Hours 53-54:** TestFlight submission and tester setup

**Total estimated time:** 2-3 days (mostly waiting for Apple Developer approval)

---

## Quick Reference: Key Values to Record

| Item | Value | Where Used |
|------|-------|------------|
| Bundle ID | `com.digero.app` | app.json, Apple Developer Portal, App Store Connect |
| SKU | `digero-ios-001` | App Store Connect |
| Apple ID | (your email) | eas.json submit.production.ios.appleId |
| App Store Connect App ID | (from ASC) | eas.json submit.production.ios.ascAppId |
| Apple Team ID | (from Developer Portal) | eas.json submit.production.ios.appleTeamId |
| Version | `1.0.0` | app.json |

---

## Hackathon Submission Notes

This TestFlight deployment is **required** for RevenueCat Shipyard 2026 hackathon submission. Ensure:

1. App is installable via TestFlight before deadline
2. RevenueCat subscription integration is functional
3. Core features (recipe scanning, meal planning, shopping lists) work correctly
4. Test notes clearly identify this as a hackathon submission

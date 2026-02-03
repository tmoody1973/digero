# Local Testing Guide (Without Apple Developer Enrollment)

This guide helps you test Digero locally while waiting for Apple Developer Program approval.

## Testing Options

| Method | What You Can Test | Limitations |
|--------|------------------|-------------|
| **iOS Simulator** | Full app UI, Convex, Clerk | No camera, no real RevenueCat purchases |
| **Expo Go** | Basic UI and navigation | No native modules (camera, RevenueCat broken) |
| **Local Device via Xcode** | Full app including camera | Requires Mac + Xcode + cable |

## Option 1: iOS Simulator (Recommended)

### Step 1: Set up environment variables

Create `.env.local` in project root:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
EXPO_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
EXPO_PUBLIC_REVENUECAT_API_KEY=test_JLISJBCUFjETcUUgjjBrzQCDRXW
```

### Step 2: Start Convex backend
```bash
npx convex dev
```

### Step 3: Seed featured channels (one time)
```bash
npx convex run seedFeaturedChannels:seedFeaturedChannels
```

### Step 4: Run the app
```bash
npx expo start --ios
```

Press `i` to open in iOS Simulator.

### What works in Simulator:
- ✅ User authentication (Clerk)
- ✅ Recipe CRUD operations
- ✅ Meal planning
- ✅ Shopping lists
- ✅ Web URL import
- ✅ YouTube recipe import
- ✅ Discover tab / channels
- ✅ Subscription UI (paywall displays)
- ⚠️ RevenueCat purchases (test mode only, no real transactions)
- ❌ Camera scanning (use image picker instead)

---

## Option 2: EAS Development Build (Simulator)

Build a development client with all native modules:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Build for simulator
```bash
eas build --profile development --platform ios
```

This builds in Expo's cloud (free tier: ~30 builds/month).

### Step 3: Download and install
- Download the `.tar.gz` from the build link
- Extract and drag the `.app` to your simulator
- Or use: `tar -xzf build.tar.gz && xcrun simctl install booted Digero.app`

### Step 4: Run with development server
```bash
npx expo start --dev-client
```

---

## Option 3: Physical Device (Requires Mac + Xcode)

Run on your own iPhone without Apple Developer enrollment:

### Step 1: Open in Xcode
```bash
npx expo prebuild --platform ios
open ios/digero.xcworkspace
```

### Step 2: Configure signing
1. Select the project in Xcode
2. Go to "Signing & Capabilities"
3. Select your personal Apple ID team (free)
4. Connect your iPhone via USB
5. Trust the developer on your phone: Settings > General > Device Management

### Step 3: Build and run
- Select your device as the target
- Press Cmd+R to build and run

**Limitation:** Free provisioning expires after 7 days, requiring rebuild.

---

## Testing RevenueCat Subscriptions

RevenueCat's test API key (`test_JLISJBCUFjETcUUgjjBrzQCDRXW`) allows you to:

1. **View paywall UI** - The paywall modal will display correctly
2. **Test purchase flow** - Simulated purchases work in sandbox
3. **Check entitlements** - Test premium state changes

### To test the full purchase flow:
1. The app will show the paywall when limits are reached
2. In sandbox mode, purchases complete without real charges
3. Subscription state updates in the app

### RevenueCat Sandbox Testing:
- Use a sandbox Apple ID (create at appleid.apple.com)
- Real App Store Connect setup needed for full sandbox testing
- Until then, you can test the UI and mock the purchase success

---

## Testing Cookbook Scanning (Without Camera)

In the simulator, camera doesn't work. The app should fall back to image picker:

1. Tap "Scan Recipe"
2. If camera unavailable, select "Choose from Library"
3. Use a sample cookbook page image for testing

### Sample test images:
You can screenshot recipe pages from the web and add to simulator photos:
```bash
# Drag and drop images onto simulator, or:
xcrun simctl addmedia booted /path/to/image.jpg
```

---

## Quick Start Commands

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start Expo
npx expo start --ios

# One-time setup
npx convex run seedFeaturedChannels:seedFeaturedChannels
```

---

## After Apple Developer Approval

Once approved, you can:

1. Build for TestFlight:
   ```bash
   eas build --profile production --platform ios --auto-submit
   ```

2. Test on real devices via TestFlight

3. Test real RevenueCat purchases in sandbox mode

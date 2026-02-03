# OAuth Setup Guide for Digero

This document outlines the steps required to configure OAuth providers (Apple and Google) for Digero's authentication system.

## Prerequisites

- Clerk account with active project
- Apple Developer account ($99/year) for Apple Sign-In
- Google Cloud Platform account for Google Sign-In

## Apple Sign-In Setup

### Step 1: Apple Developer Console

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Under **Identifiers**, click the **+** button
4. Select **App IDs** and click **Continue**
5. Select **App** type and click **Continue**
6. Fill in:
   - Description: "Digero"
   - Bundle ID: Your app bundle ID (e.g., `com.yourteam.digero`)
7. Under Capabilities, enable **Sign In with Apple**
8. Click **Continue** then **Register**

### Step 2: Create Services ID

1. Under **Identifiers**, click the **+** button again
2. Select **Services IDs** and click **Continue**
3. Fill in:
   - Description: "Digero Web Auth"
   - Identifier: `com.yourteam.digero.auth` (must be different from App ID)
4. Click **Continue** then **Register**
5. Select the newly created Services ID
6. Enable **Sign In with Apple**
7. Click **Configure**:
   - Primary App ID: Select your app
   - Domains: Add your Clerk domain (e.g., `clerk.yourapp.com`)
   - Return URLs: Add Clerk's callback URL (from Clerk Dashboard)
8. Click **Save**

### Step 3: Create Key for Sign In with Apple

1. Navigate to **Keys** section
2. Click the **+** button
3. Key Name: "Digero Sign In Key"
4. Enable **Sign In with Apple**
5. Configure: Select your primary App ID
6. Click **Continue** then **Register**
7. Download the `.p8` key file (you can only download once!)
8. Note down the Key ID shown

### Step 4: Configure in Clerk Dashboard

1. Go to your Clerk Dashboard
2. Navigate to **Configure** > **Social connections**
3. Enable **Apple**
4. Enter:
   - Services ID: `com.yourteam.digero.auth`
   - Apple Team ID: Found in Apple Developer account (top right)
   - Key ID: From step 3
   - Private Key: Contents of the `.p8` file

## Google Sign-In Setup

### Step 1: Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **OAuth consent screen**
4. Select **External** user type
5. Fill in:
   - App name: "Digero"
   - User support email: Your email
   - Developer contact: Your email
6. Click **Save and Continue**
7. Add scopes: `email`, `profile`, `openid`
8. Add test users if in testing mode

### Step 2: Create OAuth Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. For iOS app:
   - Application type: **iOS**
   - Name: "Digero iOS"
   - Bundle ID: Your app bundle ID
4. For Android app (if needed):
   - Application type: **Android**
   - Name: "Digero Android"
   - Package name: Your app package name
   - SHA-1 certificate fingerprint: Get from your keystore
5. For Web (required for Clerk):
   - Application type: **Web application**
   - Name: "Digero Web"
   - Authorized redirect URIs: Add Clerk's callback URL

### Step 3: Configure in Clerk Dashboard

1. Go to your Clerk Dashboard
2. Navigate to **Configure** > **Social connections**
3. Enable **Google**
4. Enter:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console

## Testing OAuth

### Development Testing

1. Start the Expo development server: `npx expo start`
2. Run on iOS Simulator or physical device
3. Tap "Continue with Apple" or "Continue with Google"
4. Complete the OAuth flow
5. Verify user appears in both Clerk Dashboard and Convex

### Common Issues

**Apple Sign-In not working:**
- Ensure Services ID matches exactly
- Verify return URL is configured correctly
- Check that .p8 key content is complete (includes BEGIN/END lines)

**Google Sign-In not working:**
- Ensure OAuth consent screen is configured
- Verify bundle ID matches exactly
- Check that authorized redirect URIs include Clerk's callback

## Webhook Configuration

After OAuth is working, configure the Clerk webhook to sync users to Convex:

1. In Clerk Dashboard, go to **Configure** > **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `https://your-convex-deployment.convex.site/clerk-webhook`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret**
6. Add to Convex environment variables as `CLERK_WEBHOOK_SECRET`

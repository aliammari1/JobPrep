# Google OAuth Setup Guide for JobPrep

This guide will walk you through setting up Google OAuth authentication for your JobPrep application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "JobPrep")
5. Click **"Create"**

## Step 2: Enable Google+ API

1. In your Google Cloud project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** (or **"Google Identity"**)
3. Click on it and press **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: JobPrep
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Add these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Click **"Update"** and then **"Save and Continue"**
9. On **Test users**, you can add test users if you want (optional for development)
10. Click **"Save and Continue"**
11. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. Choose application type: **"Web application"**
5. Give it a name: **"JobPrep Web Client"**
6. Add **Authorized JavaScript origins**:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
7. Add **Authorized redirect URIs**:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
8. Click **"Create"**
9. A popup will appear with your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value

## Step 5: Configure Your Application

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Make sure these are also set:
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secure-random-secret-min-32-chars"
```

3. To generate a secure `BETTER_AUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

## Step 6: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/sign-in`
3. Click **"Continue with Google"**
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your app's dashboard

## Important Notes

### Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** in Google Console:
   - Add your production domain (e.g., `https://yourdomain.com`)

2. Update **Authorized redirect URIs**:
   - Add `https://yourdomain.com/api/auth/callback/google`

3. Update your `.env.production` or environment variables in your hosting platform:
```bash
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
BETTER_AUTH_SECRET="your-production-secret"
```

### Security Best Practices

1. **Never commit** `.env.local` or `.env.production` to version control
2. **Rotate secrets** regularly in production
3. **Use different credentials** for development and production
4. **Restrict redirect URIs** to only your actual domains
5. **Enable Google Cloud Console monitoring** to track OAuth usage

### Troubleshooting

#### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in your Google Console exactly matches:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://yourdomain.com/api/auth/callback/google` (production)
- No trailing slashes
- Correct protocol (http vs https)

#### Error: "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Make sure you've added the required scopes
- Add yourself as a test user if the app is not yet verified

#### Users Can't Sign In (Unverified App Warning)
- During development, users will see an "unverified app" warning
- Click **"Advanced"** and then **"Go to [App Name] (unsafe)"**
- For production, you should submit your app for verification

#### Email Not Being Returned
- Ensure you've added the `userinfo.email` scope
- Check that email is not null in your database schema

### OAuth Consent Screen Verification

For production apps with external users:
1. Your app will initially be in "Testing" mode (100 users max)
2. To remove limits, submit for verification:
   - Go to OAuth consent screen
   - Click **"Publish App"**
   - Submit for verification (may require domain verification)
   - Verification can take several days to weeks

### Multiple Environments

For managing multiple environments:

```bash
# .env.local (development)
GOOGLE_CLIENT_ID="dev-client-id"
GOOGLE_CLIENT_SECRET="dev-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# .env.production
GOOGLE_CLIENT_ID="prod-client-id"
GOOGLE_CLIENT_SECRET="prod-secret"
NEXT_PUBLIC_APP_URL="https://jobprep.com"
```

## Support

If you encounter issues:
1. Check the [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review [Better Auth Documentation](https://www.better-auth.com/docs)
3. Check browser console for detailed error messages
4. Verify all environment variables are set correctly

## Additional Resources

- [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) - Test OAuth flows
- [Better Auth Social Providers](https://www.better-auth.com/docs/authentication/social) - Framework documentation
- [Google Identity Platform](https://developers.google.com/identity) - Official documentation

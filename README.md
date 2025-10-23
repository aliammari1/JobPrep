This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 📱 PWA Support

This application is configured as a **Progressive Web App (PWA)** with full offline support!

### Features

- ✅ **Install on any device** (desktop, mobile, tablet)
- ✅ **Works offline** - access cached content without internet
- ✅ **Fast loading** - service worker caches assets
- ✅ **Network-first strategy** - always tries to fetch fresh content
- ✅ **Auto-sync** - changes sync when back online

### Quick PWA Setup

The PWA is already configured! Just run:

```bash
npm run dev
# or
npm run build && npm start
```

For detailed PWA documentation, see [docs/PWA_SETUP.md](docs/PWA_SETUP.md)

## 🔐 Authentication

This application uses **Better Auth** with the following authentication methods:

- ✅ **Email & Password** - Traditional authentication with email verification
- ✅ **Google OAuth** - Sign in with Google account
- ✅ **Magic Link** - Passwordless email authentication
- ✅ **Email OTP** - One-time password via email
- ✅ **Phone Number** - SMS-based authentication
- ✅ **Two-Factor Authentication (2FA)** - Additional security layer
- ✅ **Passkey (WebAuthn)** - Biometric authentication
- ✅ **Username** - Username-based login support

### Setting Up Google OAuth

To enable Google Sign-In, follow the detailed setup guide:

📖 **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Complete step-by-step instructions

Quick start:
1. Create a Google Cloud project
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add credentials to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Android Trusted Web Activity (TWA) Setup

JobPrep ships with a TWA-ready Web App Manifest (`src/app/manifest.ts`), Serwist service worker (`public/sw.js`), maskable PNG icons, and a Digital Asset Links file (`public/.well-known/assetlinks.json`).

## Prerequisites
- Production HTTPS deployment of JobPrep (e.g. `https://jobprep.example.com`)
- Node.js 18+ and Bubblewrap CLI (`npm i -g @bubblewrap/cli`)
- JDK 17+ & Android SDK (Bubblewrap can install both automatically)

## 1. Initialize the Android TWA Project
```bash
mkdir -p android-twa && cd android-twa
bubblewrap init --manifest="https://<your-domain>/manifest.webmanifest"
```

Suggested values:
- **Package ID**: `app.jobprep.twa`
- **Theme Color**: `#2563eb`
- **Background Color**: `#fcfdff`
- **Start URL**: `/dashboard`

## 2. Configure Digital Asset Links (Removes the Browser Address Bar)
Extract your signing key's SHA-256 fingerprint:
```bash
keytool -list -v -keystore android.keystore -alias android | grep SHA256
```
(If publishing via Google Play App Signing, copy the **App signing key certificate** SHA-256 from Google Play Console → *Setup* → *App signing*.)

Update `public/.well-known/assetlinks.json` with your `package_name` and `sha256_cert_fingerprints`, redeploy, and verify:
```bash
curl -s https://<your-domain>/.well-known/assetlinks.json
```

## 3. Build & Test
```bash
bubblewrap build
# Produces app-release-bundle.aab (Play Store) and app-release-signed.apk (sideload test)
```

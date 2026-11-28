# Chrome Web Store Listing — JobPrep Career & LinkedIn Companion

**Last Updated**: 2026-11-25  
**Version**: 2.0.0  
**Manifest**: V3

## Short Description (<= 132 chars)
Import your LinkedIn profile into JobPrep CV Builder via official OAuth, LinkedIn PDF upload, or one-click active-tab capture.

## Detailed Description
JobPrep Career Companion connects your browser to your hosted or self-hosted JobPrep workspace so you can build ATS-readable resumes faster.

Features:
- Quick links to connect your account via official LinkedIn OpenID OAuth or upload your official LinkedIn "Save to PDF" resume export.
- One-click, user-initiated capture of your currently open LinkedIn profile tab into your JobPrep CV Builder.
- Configurable instance URL for self-hosted or local Docker JobPrep deployments.
- Local-first storage: captured data stays in your browser until you explicitly open JobPrep CV Builder or click Clear.

## Permissions Justifications

| Permission | Plain-English Justification |
|---|---|
| `activeTab` | Grants temporary access to the currently active tab only when the user clicks the extension icon and triggers capture. |
| `scripting` | Reads structured profile sections on the active LinkedIn profile page when requested by the user. |
| `storage` | Stores the user's configured JobPrep instance URL and temporarily holds captured profile fields until imported or cleared. |
| `tabs` | Checks whether the active tab is a LinkedIn profile page and opens the user's JobPrep CV Builder or Connected Accounts page in a new tab. |
| `https://www.linkedin.com/in/*` | Limits profile capture strictly to LinkedIn profile pages. |
| `http://localhost:*/*`, `http://127.0.0.1:*/*` | Allows local self-hosted JobPrep instances to receive imported profile data. |
| `optional_host_permissions: https://*/*` | Allows users who self-host JobPrep on a custom HTTPS domain to connect their own instance on demand. |

## Privacy & Data Use
- No analytics, tracking, ads, or third-party data resale.
- Data is never captured in the background; capture only runs on explicit user click.
- Users can clear stored data at any time from the extension popup.

## Pre-Publish Packaging Checklist
- [x] `manifest_version: 3`
- [x] Real PNG icons at `16x16`, `48x48`, and `128x128` in `chrome-extension/icons/`
- [x] Zero inline `<script>` or inline event handlers in `popup.html`
- [x] Stateless service worker (`background.js`) using `async/await`
- [ ] Add 1280×800 promotional screenshot before Chrome Web Store upload
- [ ] Exclude `CHROMEWEBSTORE.md` and `README.md` when zipping for upload

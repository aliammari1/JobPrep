# Publishing the Chrome extension

The LinkedIn → CV importer lives in [`chrome-extension/`](../chrome-extension)
(Manifest V3, no build step). This documents how to publish it to the Chrome Web
Store and how the repo packages it automatically on a release tag.

## Automated packaging (zip-on-tag)

When a `v*` tag is pushed, `.github/workflows/release.yml` (`chrome-extension-zip`
job) zips the `chrome-extension/` folder and attaches
`jobprep-chrome-extension-<manifest.version>.zip` to the GitHub Release. The
version is read from `chrome-extension/manifest.json`, so **bump
`manifest.json`'s `version` before tagging.**

```bash
# bump chrome-extension/manifest.json "version", commit, then:
git tag v1.2.0
git push origin v1.2.0
# → CI builds the release and uploads the extension zip
```

## One-time setup

1. Create a **Chrome Web Store developer account** at
   https://chrome.google.com/webstore/devconsole (one-time $5 USD fee).
2. Prepare store assets:
   - Extension **icons** at 16/48/128 px (add a `chrome-extension/icons/` folder
     and reference them in `manifest.json` — currently marked "coming soon").
   - A 128×128 store icon, at least one 1280×800 (or 640×400) screenshot, and a
     short + detailed description.
   - A **privacy policy URL** (the extension scrapes LinkedIn locally — disclose
     exactly what is read and that nothing leaves the browser until the user
     clicks "Send to JobPrep").

## Publish a new version

1. Download the `jobprep-chrome-extension-*.zip` from the GitHub Release (or zip
   `chrome-extension/` locally).
2. In the [Developer Dashboard](https://chrome.google.com/webstore/devconsole),
   select the item → **Package** → upload the new zip.
3. Fill in the listing (description, screenshots, category = *Productivity*,
   single purpose = "import a LinkedIn profile into a CV builder").
4. Complete the **privacy / permissions justification** (`activeTab`,
   `scripting`, `storage`, and the LinkedIn + app host permissions).
5. **Submit for review.** Manifest V3 reviews typically take a few business days.

## Notes

- Default app target URL is user-configurable in the popup; update the production
  host in `manifest.json` / `background.js` / `content.js` once the Cloudflare
  domain is final.
- For an automated store upload you can add the
  [`chrome-webstore-upload-cli`](https://github.com/fregante/chrome-webstore-upload)
  to the release workflow with `CLIENT_ID`/`CLIENT_SECRET`/`REFRESH_TOKEN`
  secrets — left manual for now to keep the review human-gated.

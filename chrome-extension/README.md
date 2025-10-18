# JobPrep LinkedIn CV Importer - Chrome Extension

A Chrome extension that extracts LinkedIn profile data and imports it directly into JobPrep CV Builder.

## Features

- 🚀 **One-Click Extract**: Extract LinkedIn profile data with a single click
- 🔒 **Privacy-First**: Runs entirely in your browser - no data leaves your machine until you choose to send it
- 📥 **Auto-Import**: Sends extracted data directly to JobPrep CV Builder
- 💾 **Smart Caching**: Saves extracted data so you can import later
- ✨ **Beautiful UI**: Modern, gradient popup interface

## Installation

### Option 1: Load Unpacked (Development)

1. **Download/Clone the Extension**
   ```bash
   cd /home/aliammari/jobprep/chrome-extension
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - OR: Click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to `/home/aliammari/jobprep/chrome-extension/`
   - Select the folder and click "Select Folder"

5. **Pin the Extension** (Optional but Recommended)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "JobPrep LinkedIn CV Importer"
   - Click the pin icon to keep it visible

### Option 2: Chrome Web Store (Coming Soon)

Extension will be published to Chrome Web Store after testing phase.

## Usage

### Step 1: Navigate to a LinkedIn Profile

1. Log in to your LinkedIn account
2. Navigate to any LinkedIn profile page (e.g., `https://linkedin.com/in/username`)
3. Make sure the profile is fully loaded

### Step 2: Extract Profile Data

1. Click the JobPrep extension icon in your Chrome toolbar
2. Click the "📥 Extract Profile Data" button
3. Wait for extraction (usually 1-2 seconds)
4. Review the extracted data preview

### Step 3: Send to JobPrep

1. Make sure JobPrep is running (default: `http://localhost:3000`)
2. Update the target URL if needed (e.g., production URL)
3. Click "⬆️ Send to JobPrep" button
4. Extension will automatically open CV Builder with your data

## Configuration

### Change JobPrep URL

Default URL: `http://localhost:3000`

To use a different URL (e.g., production):
1. Open extension popup
2. Edit the "JobPrep URL" input field
3. URL is automatically saved for future use

Supported URLs:
- Local development: `http://localhost:3000`
- Production: `https://yourapp.com`

## What Data is Extracted?

The extension extracts the following from LinkedIn profiles:

### ✅ Personal Information
- Full name
- Professional title
- Location
- Profile photo
- About/Summary section
- LinkedIn profile URL

### ✅ Experience
- Job title
- Company name
- Employment dates (start/end)
- Job description
- Current position flag

### ✅ Education
- Degree/Field of study
- Institution name
- Graduation dates
- GPA (if available)

### ✅ Skills
- All listed skills
- Endorsement counts (coming soon)

### ✅ Certifications & Licenses
- Certification name
- Issuing organization
- Issue date
- Credential URL

### ✅ Projects
- Project name
- Description
- Technologies used

### ✅ Languages
- Language name
- Proficiency level (native, professional, conversational, basic)

### ✅ Awards & Honors
- Award title
- Issuer
- Date received
- Description

## Technical Details

### Architecture

```
chrome-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # LinkedIn DOM scraper
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── background.js       # Service worker
└── icons/              # Extension icons (coming soon)
```

### Permissions Explained

- **activeTab**: Access current tab's content when you click the extension
- **scripting**: Inject content script into LinkedIn pages
- **storage**: Save extracted data and settings locally
- **host_permissions (LinkedIn)**: Run content script on LinkedIn profile pages
- **host_permissions (localhost)**: Send data to local JobPrep instance

### Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave (Chromium-based)
- ✅ Opera (Chromium-based)
- ❌ Firefox (requires different manifest format)
- ❌ Safari (requires different extension format)

## Troubleshooting

### Extension Doesn't Appear

**Solution:**
1. Make sure Developer Mode is enabled in `chrome://extensions/`
2. Verify the extension folder contains `manifest.json`
3. Check for errors in the Extensions page
4. Reload the extension after making changes

### "Not a LinkedIn Profile Page" Error

**Solution:**
1. Make sure you're on a profile page: `https://linkedin.com/in/username`
2. Company pages, job postings, and feed pages are not supported
3. Profile must be fully loaded (wait for page to finish loading)

### No Data Extracted

**Possible causes:**
1. LinkedIn changed their HTML structure (report this as an issue)
2. Profile sections are collapsed - expand them manually
3. Private/restricted profile - some sections may not be visible
4. Ad blockers interfering - try disabling temporarily

**Solutions:**
- Scroll through the profile to load all sections
- Expand collapsed sections manually
- Check browser console for errors (F12 → Console)

### "Failed to Send Data" Error

**Solutions:**
1. Make sure JobPrep is running: `npm run dev`
2. Check the URL is correct (default: `http://localhost:3000`)
3. Verify CORS is enabled for localhost in JobPrep backend
4. Check browser console for network errors

### Content Script Not Loading

**Solutions:**
1. Reload the extension: `chrome://extensions/` → Click reload icon
2. Reload the LinkedIn page
3. Check for JavaScript errors in the page console (F12 → Console)

### Extension Popup is Blank

**Solutions:**
1. Check `popup.html` and `popup.js` are in the extension folder
2. Right-click extension icon → Inspect popup → Check for errors
3. Reload the extension

## Development

### File Structure

**manifest.json** - Extension configuration
- Defines permissions, content scripts, popup, background worker
- Manifest V3 format (latest standard)

**content.js** - LinkedIn scraper
- Runs on `linkedin.com/in/*` pages
- Extracts data from LinkedIn's DOM
- Uses CSS selectors to find profile elements
- Handles different LinkedIn layouts (mobile, desktop, languages)

**popup.html + popup.js** - Extension UI
- Beautiful gradient interface
- Shows current page, extraction status, data preview
- Configuration for target URL
- Send button to POST data to JobPrep

**background.js** - Service worker
- Manages storage
- Shows badge count when data is extracted
- Handles extension lifecycle events

### Making Changes

1. Edit the relevant file
2. Go to `chrome://extensions/`
3. Click the reload icon on JobPrep extension card
4. Reload LinkedIn page if testing content script
5. Close and reopen popup if testing popup

### Testing

**Test Profiles:**
- Your own profile (full access to all sections)
- Public profiles (may have limited sections visible)
- Profiles in different languages (fr, en, es, etc.)

**Test Cases:**
1. Profile with all sections (experience, education, skills, etc.)
2. Profile with missing sections
3. Profile with long descriptions
4. Profile with special characters in names/titles
5. Private profiles (connection required)

### Debugging

**Content Script:**
```bash
# Open LinkedIn profile page
# Press F12 → Console
# Check for "JobPrep LinkedIn Scraper - Content script loaded"
# Check for extraction logs
```

**Popup:**
```bash
# Click extension icon
# Right-click popup → Inspect
# Check Console for errors
```

**Background Worker:**
```bash
# Go to chrome://extensions/
# Find JobPrep extension
# Click "service worker" link
# Check Console
```

## Privacy & Security

### Data Handling
- ✅ All extraction happens **locally in your browser**
- ✅ No data sent to external servers (except JobPrep if you choose)
- ✅ Data stored only in Chrome's local storage (not synced)
- ✅ You control when data is extracted and sent

### Permissions
- Extension only has access to LinkedIn pages when you activate it
- No background tracking or data collection
- No analytics or telemetry
- Open source - you can review all code

### LinkedIn Terms of Service
- This extension is for **personal use only**
- Only extract your own profile or profiles you have permission to access
- Do not use for mass scraping or commercial purposes
- Respect LinkedIn's terms of service and rate limits

## Roadmap

### Version 1.1
- [ ] Add extension icons (16x16, 48x48, 128x128)
- [ ] Support for LinkedIn company pages
- [ ] Support for LinkedIn school pages
- [ ] Export to JSON file
- [ ] Dark mode toggle

### Version 1.2
- [ ] Support for multiple profiles (batch import)
- [ ] Compare current CV with LinkedIn (show diff)
- [ ] Auto-update CV when LinkedIn changes
- [ ] Skill endorsement counts
- [ ] Recommendations extraction

### Version 2.0
- [ ] Firefox support (WebExtension manifest)
- [ ] Safari support
- [ ] Publish to Chrome Web Store
- [ ] One-click update CV feature

## Support

### Reporting Issues

Found a bug or issue? Please report:

1. Extension version
2. Chrome version
3. LinkedIn page URL (if not private)
4. Steps to reproduce
5. Console errors (F12 → Console)
6. Screenshots (if helpful)

### Contributing

Contributions welcome! Areas that need help:
- Testing with different LinkedIn profiles
- Internationalization (non-English profiles)
- UI/UX improvements
- Icon design
- Documentation

## License

Same license as JobPrep project (see root LICENSE file).

## Credits

Built with ❤️ for the JobPrep CV Builder project.

---

**Made with Chrome Extension Manifest V3** | **Privacy-First** | **Open Source**

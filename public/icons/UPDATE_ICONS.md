# Icon Update Guide

The new JobPrep logo (blue J with arrow) has been added as `logo.svg` and `icon.svg`.

## To Generate PNG Icons

You can generate all required PNG icons from the SVG using one of these methods:

### Method 1: Using ImageMagick (Linux/Mac)
```bash
cd public/icons
bash generate-icons.sh
```

### Method 2: Using Node.js (Cross-platform)
```bash
npm install -g sharp-cli
cd public/icons

sharp -i icon.svg -o icon-72x72.png resize 72 72
sharp -i icon.svg -o icon-96x96.png resize 96 96
sharp -i icon.svg -o icon-128x128.png resize 128 128
sharp -i icon.svg -o icon-144x144.png resize 144 144
sharp -i icon.svg -o icon-152x152.png resize 152 152
sharp -i icon.svg -o icon-192x192.png resize 192 192
sharp -i icon.svg -o icon-384x384.png resize 384 384
sharp -i icon.svg -o icon-512x512.png resize 512 512
sharp -i icon.svg -o favicon-16x16.png resize 16 16
sharp -i icon.svg -o favicon-32x32.png resize 32 32
sharp -i icon.svg -o apple-touch-icon.png resize 180 180
```

### Method 3: Using Online Tools
1. Upload `icon.svg` to https://realfavicongenerator.net/
2. Download the generated icons
3. Replace the files in the `public/icons` directory

## Logo Usage in Code

The logo has been updated in:
- ✅ Landing Navbar (`src/components/landing/landing-navbar.tsx`)
- ✅ Sidebar (`src/components/layout/sidebar.tsx`)
- ✅ Mock Interview Page (`src/app/mock-interview/page.tsx`)
- ✅ Icon files (`public/icons/icon.svg` and `public/icons/logo.svg`)
- ✅ Manifest (`public/manifest.json` - references the icon files)

The logo is displayed using Next.js Image component with the SVG source at `/icons/logo.svg`.

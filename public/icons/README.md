# PWA Icons

Please generate PNG icons from the icon.svg file or create custom icons.

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Required sizes:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

Or use ImageMagick locally:
```bash
cd public/icons
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

For now, the app will use the SVG as fallback.

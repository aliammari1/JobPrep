#!/bin/bash
# Simple icon generation script
# Note: This requires ImageMagick to be installed
# If not available, manually create PNG files from the SVG

cd /home/aliammari/jobprep/public/icons

for size in 72 96 128 144 152 192 384 512; do
  if command -v convert &> /dev/null; then
    convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
    echo "Created icon-${size}x${size}.png"
  else
    # Create a simple placeholder file
    cp icon.svg icon-${size}x${size}.png.temp
    echo "Note: Install ImageMagick to generate icon-${size}x${size}.png properly"
  fi
done

echo "Icon generation complete!"

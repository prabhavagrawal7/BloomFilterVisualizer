#!/bin/bash

# Script to run the Bloom Filter Visualizer with the fastest available runtime

cd "$(dirname "$0")"

# Check if Bun is available
if command -v bun &> /dev/null; then
    echo "🚀 Using Bun for faster performance"
    bun install && bun run dev
# Fallback to npm
else
    echo "ℹ️ Bun not found, using npm instead"
    echo "ℹ️ For faster performance, consider installing Bun: https://bun.sh/"
    npm install && npm run dev
fi

# Build and deploy to GitHub Pages
npm run build
npx gh-pages -d dist -b gh-pages
#!/bin/bash

# Deployment verification script for Bloom Filter Visualizer

echo "🚀 Bloom Filter Visualizer Deployment Script"
echo "=============================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: This is not a git repository"
    exit 1
fi

# Check if we have a remote origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote origin found"
    exit 1
fi

echo "✅ Git repository detected"
echo "📍 Remote: $(git remote get-url origin)"

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Error: Bun is not installed"
    echo "Please install Bun: https://bun.sh"
    exit 1
fi

echo "✅ Bun detected: $(bun --version)"

# Install dependencies
echo "📦 Installing dependencies..."
if ! bun install; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building project..."
if ! bun run build; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found"
    exit 1
fi

echo "✅ Build output verified"

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
if ! bun run deploy; then
    echo "❌ Error: Deployment failed"
    echo "💡 Make sure you have push access to the repository"
    exit 1
fi

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your site should be available at:"
echo "   https://prabhavagrawal7.github.io/BloomFilterVisualizer"
echo ""
echo "⏰ It may take a few minutes for the changes to appear."
echo "   You can check the deployment status in your GitHub repository under 'Actions' tab."

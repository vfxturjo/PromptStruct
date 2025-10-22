#!/bin/bash

# PWA Development Server Script
# This script helps with PWA development and testing

echo "🚀 Starting PWA Development Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the project first
echo "📦 Building project..."
bun run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start the preview server
    echo "🌐 Starting preview server on http://localhost:4173"
    echo "📱 PWA Update Helper available at: http://localhost:4173/pwa-update.html"
    echo ""
    echo "💡 Tips for PWA testing:"
    echo "   • Open Chrome DevTools > Application > Service Workers"
    echo "   • Use the PWA Update Helper page to force updates"
    echo "   • Check 'Update on reload' in DevTools for faster testing"
    echo ""
    
    # Start the preview server
    bun run preview
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

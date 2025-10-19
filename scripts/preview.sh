#!/bin/bash

# Party Tribe™ Preview Deployment Script
# Creates a preview deployment for testing before production

set -e

echo "🌍 Party Tribe™ Preview Deployment"
echo "================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed."
    echo "Please install it with: npm install -g vercel"
    exit 1
fi

echo "🚀 Creating preview deployment..."

# Deploy to preview
if vercel --yes; then
    echo "✅ Preview deployment successful!"
    
    # Get the preview URL
    PREVIEW_URL=$(vercel ls --scope axaiinovation | head -n 4 | tail -n 1 | awk '{print $1}')
    
    if [ ! -z "$PREVIEW_URL" ]; then
        echo "🔗 Preview URL: $PREVIEW_URL"
        echo "👀 Test your changes before promoting to production!"
    else
        echo "⚠️  Warning: Could not retrieve preview URL."
    fi
else
    echo "❌ Preview deployment failed!"
    exit 1
fi

echo ""
echo "🎭 Ready to test your tribe updates!"
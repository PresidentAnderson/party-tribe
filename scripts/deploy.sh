#!/bin/bash

# Party Tribe™ Deployment Script
# Deploys the static website to Vercel with proper configuration

set -e

echo "🌍 Party Tribe™ Deployment Script"
echo "=================================="

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

echo "📝 Checking git status..."
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

echo "🚀 Starting deployment to Vercel..."

# Deploy to production
if vercel --prod --yes; then
    echo "✅ Deployment successful!"
    
    # Set up custom domain alias
    echo "🌐 Setting up custom domain alias..."
    
    # Get the latest deployment URL
    DEPLOYMENT_URL=$(vercel ls --scope axaiinovation | head -n 4 | tail -n 1 | awk '{print $1}')
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        if vercel alias "$DEPLOYMENT_URL" partytribe.vercel.app; then
            echo "✅ Custom domain configured successfully!"
            echo "🎉 Your site is live at: https://partytribe.vercel.app"
        else
            echo "⚠️  Warning: Custom domain setup failed, but deployment was successful."
            echo "🌐 Your site is live at: $DEPLOYMENT_URL"
        fi
    else
        echo "⚠️  Warning: Could not retrieve deployment URL."
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "🎊 Party Tribe™ is ready to bring fun back into fun!"
echo "🔗 Live site: https://partytribe.vercel.app"
echo "📊 Vercel dashboard: https://vercel.com/axaiinovation/party-tribe"
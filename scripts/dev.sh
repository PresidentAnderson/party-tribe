#!/bin/bash

# Party Tribe™ Local Development Server
# Starts a local development server for testing

set -e

echo "🌍 Party Tribe™ Local Development"
echo "================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the project root."
    exit 1
fi

PORT=${1:-8000}

echo "🚀 Starting local development server on port $PORT..."
echo "🔗 Open http://localhost:$PORT in your browser"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start local server (try different methods based on what's available)
if command -v python3 &> /dev/null; then
    echo "Using Python 3 server..."
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "Using Python 2 server..."
    python -m SimpleHTTPServer $PORT
elif command -v npx &> /dev/null; then
    echo "Using npx serve..."
    npx serve . -p $PORT
elif command -v php &> /dev/null; then
    echo "Using PHP server..."
    php -S localhost:$PORT
else
    echo "❌ Error: No suitable server found."
    echo "Please install Python, Node.js, or PHP to run a local server."
    exit 1
fi
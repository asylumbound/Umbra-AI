#!/bin/bash
cd "$(dirname "$0")/../backend"

echo "🚀 Starting Scriptor Umbra AI Backend..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "DreamHost VPS: Install Node.js using their panel or contact support"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the server
echo "🔥 Starting server on port 3001..."
npm start

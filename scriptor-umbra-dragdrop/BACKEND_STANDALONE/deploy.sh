#!/bin/bash

# Scriptor Umbra AI - One-Click Backend Deployment
# This script sets up and starts your backend automatically

echo "🚀 Scriptor Umbra AI Backend - One-Click Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js 18+ from: https://nodejs.org"
    echo "Or use your system package manager:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  CentOS/RHEL: sudo yum install nodejs npm"
    echo "  macOS: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm found: $NPM_VERSION"

# Set working directory to script location
cd "$(dirname "$0")"

# Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    if [ -f ".env.production" ]; then
        print_status "Copying .env.production to .env"
        cp .env.production .env
        print_success ".env file created"
    else
        print_error "No environment configuration found!"
        echo "Please create a .env file with your OpenAI credentials:"
        echo "OPENAI_API_KEY=your_api_key_here"
        echo "ASSISTANT_ID=your_assistant_id_here"
        exit 1
    fi
fi

# Verify environment variables
print_status "Checking environment configuration..."
source .env

if [ -z "$OPENAI_API_KEY" ]; then
    print_error "OPENAI_API_KEY not set in .env file"
    exit 1
fi

if [ -z "$ASSISTANT_ID" ]; then
    print_error "ASSISTANT_ID not set in .env file"
    exit 1
fi

print_success "Environment configuration verified"

# Get port from environment or use default
PORT=${PORT:-3001}

# Check if port is available
print_status "Checking if port $PORT is available..."
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    print_warning "Port $PORT is already in use"
    print_status "Attempting to find available port..."
    for port in {3001..3010}; do
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            PORT=$port
            export PORT=$port
            print_success "Using port $PORT"
            break
        fi
    done
fi

# Start the server
print_status "Starting Scriptor Umbra AI Backend on port $PORT..."
echo ""
echo "🎉 Backend will be available at:"
echo "   Local: http://localhost:$PORT"
echo "   Health Check: http://localhost:$PORT/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start with npm start
npm start


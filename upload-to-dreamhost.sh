#!/bin/bash

# Quick DreamHost Upload Script
# Run this after configuring deploy-dreamhost.sh

echo "🚀 Uploading to DreamHost..."

# Load configuration from .env file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

source .env

# Extract domain from DREAMHOST_HOST URL if needed
DREAMHOST_DOMAIN=${DREAMHOST_DOMAIN:-$(echo $DREAMHOST_HOST | sed 's|http[s]*://||')}
DREAMHOST_PATH="/home/$DREAMHOST_USER/$DREAMHOST_DOMAIN"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if deployment package exists
if [ ! -d "dreamhost-deployment" ]; then
    print_error "Deployment package not found. Run deploy-dreamhost.sh first!"
    exit 1
fi

# Verify configuration
echo "Upload Configuration:"
echo "User: $DREAMHOST_USER"
echo "Host: $DREAMHOST_HOST"
echo "Path: $DREAMHOST_PATH"
echo ""

read -p "Is this configuration correct? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Please update the configuration in this script"
    exit 1
fi

# Test SSH connection
print_status "Testing SSH connection..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 $DREAMHOST_USER@$DREAMHOST_HOST exit 2>/dev/null; then
    print_success "SSH connection successful"
else
    print_error "SSH connection failed. Check your credentials and SSH key setup."
    echo "Setup SSH key with: ssh-copy-id $DREAMHOST_USER@$DREAMHOST_HOST"
    exit 1
fi

# Upload frontend files
print_status "Uploading frontend files..."
rsync -avz --progress --delete dreamhost-deployment/public_html/ $DREAMHOST_USER@$DREAMHOST_HOST:$DREAMHOST_PATH/

if [ $? -eq 0 ]; then
    print_success "Frontend files uploaded successfully"
else
    print_error "Frontend upload failed"
    exit 1
fi

# Ask about backend upload
echo ""
read -p "Do you want to upload the backend files? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating backend directory..."
    ssh $DREAMHOST_USER@$DREAMHOST_HOST "mkdir -p /home/$DREAMHOST_USER/scriptor-backend"
    
    print_status "Uploading backend files..."
    rsync -avz --progress --delete dreamhost-deployment/backend/ $DREAMHOST_USER@$DREAMHOST_HOST:/home/$DREAMHOST_USER/scriptor-backend/
    
    print_status "Uploading scripts..."
    rsync -avz --progress dreamhost-deployment/scripts/ $DREAMHOST_USER@$DREAMHOST_HOST:/home/$DREAMHOST_USER/scriptor-scripts/
    rsync -avz --progress dreamhost-deployment/config/ $DREAMHOST_USER@$DREAMHOST_HOST:/home/$DREAMHOST_USER/scriptor-config/
    
    print_success "Backend files uploaded"
    
    # Set executable permissions
    print_status "Setting permissions..."
    ssh $DREAMHOST_USER@$DREAMHOST_HOST "chmod +x /home/$DREAMHOST_USER/scriptor-scripts/*.sh"
    ssh $DREAMHOST_USER@$DREAMHOST_HOST "chmod 600 /home/$DREAMHOST_USER/scriptor-backend/.env"
    
    print_success "Permissions set"
fi

echo ""
print_success "Upload completed!"
echo ""
echo "Next steps:"
echo "1. Visit your domain to test the frontend"
echo "2. If you uploaded backend files, SSH in and run:"
echo "   cd /home/$DREAMHOST_USER/scriptor-backend"
echo "   npm install --production"
echo "   npm start"
echo ""
echo "For detailed setup instructions, see dreamhost-deployment/DREAMHOST_INSTALL.md"
#!/bin/bash

# Scriptor Umbra AI - DreamHost Deployment Script
# Deploys both frontend and backend to DreamHost hosting

echo "🚀 Scriptor Umbra AI - DreamHost Deployment"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${CYAN}$1${NC}"
}

# Load configuration from .env file
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    exit 1
fi

source .env

# Extract domain from DREAMHOST_HOST URL if needed
DREAMHOST_DOMAIN=${DREAMHOST_DOMAIN:-$(echo $DREAMHOST_HOST | sed 's|http[s]*://||')}
DREAMHOST_PATH="/home/$DREAMHOST_USER/$DREAMHOST_DOMAIN"

print_header "DreamHost Configuration"
echo "Host: $DREAMHOST_HOST"
echo "User: $DREAMHOST_USER" 
echo "Domain: $DREAMHOST_DOMAIN"
echo "Path: $DREAMHOST_PATH"
echo ""

print_success "Configuration loaded from .env file"

# Check if required tools are installed
print_status "Checking required tools..."

if ! command -v rsync &> /dev/null; then
    print_error "rsync is not installed!"
    echo "Install with: brew install rsync (macOS) or apt-get install rsync (Linux)"
    exit 1
fi

if ! command -v ssh &> /dev/null; then
    print_error "ssh is not installed!"
    exit 1
fi

print_success "Required tools found"

# Set working directory to script location
cd "$(dirname "$0")"

# Create deployment directory structure
DEPLOY_DIR="dreamhost-deployment"
print_status "Creating deployment package..."

# Clean previous deployment
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/{public_html,backend,scripts,config}

print_header "Step 1: Preparing Frontend Files"

# Copy frontend files
if [ -d "DRAG_TO_DOMAIN" ]; then
    cp -r DRAG_TO_DOMAIN/* $DEPLOY_DIR/public_html/
    print_success "Frontend files copied"
else
    print_error "DRAG_TO_DOMAIN directory not found!"
    exit 1
fi

# Create .htaccess for SPA routing
cat > $DEPLOY_DIR/public_html/.htaccess << 'EOF'
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# SPA routing - redirect all requests to index.html
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
EOF

print_success ".htaccess created with SPA routing and security headers"

print_header "Step 2: Preparing Backend Files"

# Copy backend files (excluding node_modules)
cp server.js $DEPLOY_DIR/backend/
cp package.json $DEPLOY_DIR/backend/
cp package-lock.json $DEPLOY_DIR/backend/
cp -r routes $DEPLOY_DIR/backend/

# Create production .env file
cat > $DEPLOY_DIR/backend/.env << EOF
# OpenAI Configuration
OPENAI_API_KEY=$OPENAI_API_KEY
ASSISTANT_ID=$ASSISTANT_ID

# DreamHost Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://$DREAMHOST_DOMAIN

# Supabase Configuration (if used)
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

print_success "Backend files prepared with production configuration"

print_header "Step 3: Creating Deployment Scripts"

# Create backend startup script
cat > $DEPLOY_DIR/scripts/start-backend.sh << 'EOF'
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
EOF

chmod +x $DEPLOY_DIR/scripts/start-backend.sh

# Create PM2 ecosystem file for process management
cat > $DEPLOY_DIR/config/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'scriptor-umbra-backend',
    script: '../backend/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

print_success "Deployment scripts created"

print_header "Step 4: Creating Installation Guide"

# Create detailed installation guide
cat > $DEPLOY_DIR/DREAMHOST_INSTALL.md << EOF
# DreamHost Deployment Guide

## Pre-Requirements

### 1. DreamHost Account Setup
- Ensure you have a VPS or Dedicated hosting plan (required for Node.js)
- Shared hosting does NOT support Node.js backend

### 2. Enable SSH Access
- Log into DreamHost panel
- Go to Users > Manage Users
- Enable SSH access for your user

### 3. Install Node.js (VPS Only)
- SSH into your server: \`ssh $DREAMHOST_USER@$DREAMHOST_HOST\`
- Install Node.js 18+:
  \`\`\`bash
  # Using Node Version Manager (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  source ~/.bashrc
  nvm install 18
  nvm use 18
  \`\`\`

## Deployment Steps

### Step 1: Upload Files

**Upload Frontend:**
\`\`\`bash
# From your local machine
rsync -avz --delete public_html/ $DREAMHOST_USER@$DREAMHOST_HOST:$DREAMHOST_PATH/
\`\`\`

**Upload Backend (if VPS):**
\`\`\`bash
# Create backend directory outside web root
ssh $DREAMHOST_USER@$DREAMHOST_HOST "mkdir -p /home/$DREAMHOST_USER/scriptor-backend"

# Upload backend files
rsync -avz --delete backend/ $DREAMHOST_USER@$DREAMHOST_HOST:/home/$DREAMHOST_USER/scriptor-backend/
rsync -avz scripts/ $DREAMHOST_USER@$DREAMHOST_HOST:/home/$DREAMHOST_USER/scriptor-scripts/
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
# SSH into your server
ssh $DREAMHOST_USER@$DREAMHOST_HOST

# Navigate to backend directory
cd /home/$DREAMHOST_USER/scriptor-backend

# Install dependencies
npm install --production
\`\`\`

### Step 3: Start Backend

**Option A: Direct Start (for testing)**
\`\`\`bash
cd /home/$DREAMHOST_USER/scriptor-backend
npm start
\`\`\`

**Option B: Using PM2 (recommended for production)**
\`\`\`bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd /home/$DREAMHOST_USER
pm2 start scriptor-scripts/config/ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

### Step 4: Configure Proxy (VPS with cPanel/Apache)

Create \`.htaccess\` in your domain root to proxy API requests:

\`\`\`apache
# API Proxy for backend
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/\$1 [P,L]
\`\`\`

## Alternative: External Backend

If you're on shared hosting, deploy the backend to a service like:
- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com

Then update the frontend API endpoint in your deployed files.

## Testing

1. **Frontend**: Visit https://$DREAMHOST_DOMAIN
2. **Backend Health**: https://$DREAMHOST_DOMAIN/api/health (if proxied)
3. **Direct Backend**: http://$DREAMHOST_HOST:3001/health (if VPS)

## Troubleshooting

### Common Issues

1. **Node.js not available**: Contact DreamHost support or upgrade to VPS
2. **Port 3001 blocked**: Use DreamHost's firewall settings to allow it
3. **CORS errors**: Update FRONTEND_URL in backend/.env
4. **Permission errors**: Check file permissions (755 for directories, 644 for files)

### Logs

Check application logs:
\`\`\`bash
# PM2 logs
pm2 logs scriptor-umbra-backend

# Direct logs (if not using PM2)
cd /home/$DREAMHOST_USER/scriptor-backend
npm start > app.log 2>&1 &
tail -f app.log
\`\`\`

## Security Notes

- Your API keys are configured in backend/.env
- Ensure .env file has restricted permissions: \`chmod 600 .env\`
- Enable HTTPS through DreamHost panel
- Consider using a separate database for production data
EOF

print_success "Installation guide created"

print_header "Step 5: Deployment Package Summary"

echo ""
echo "📦 Deployment package created in: $DEPLOY_DIR/"
echo ""
echo "Contents:"
echo "├── public_html/              # Frontend files (upload to domain root)"
echo "├── backend/                  # Node.js backend application"
echo "├── scripts/                  # Management scripts"
echo "├── config/                   # Configuration files"
echo "└── DREAMHOST_INSTALL.md     # Detailed installation guide"
echo ""

print_header "Next Steps:"
echo "1. Review and update the DREAMHOST_INSTALL.md file"
echo "2. Upload public_html/ contents to your domain's web directory"
echo "3. If you have VPS hosting, upload and configure the backend"
echo "4. If you have shared hosting, consider external backend hosting"
echo ""

print_success "DreamHost deployment package ready!"
print_warning "Remember to update your domain and credentials in the configuration files"

echo ""
echo "🎉 Your Scriptor Umbra AI is ready for DreamHost deployment!"
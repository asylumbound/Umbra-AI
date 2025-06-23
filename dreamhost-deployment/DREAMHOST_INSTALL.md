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
- SSH into your server: `ssh scriptorumbra@http://vps64698.dreamhostps.com`
- Install Node.js 18+:
  ```bash
  # Using Node Version Manager (recommended)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  source ~/.bashrc
  nvm install 18
  nvm use 18
  ```

## Deployment Steps

### Step 1: Upload Files

**Upload Frontend:**
```bash
# From your local machine
rsync -avz --delete public_html/ scriptorumbra@http://vps64698.dreamhostps.com:/home/scriptorumbra/scriptorumbra.ai/
```

**Upload Backend (if VPS):**
```bash
# Create backend directory outside web root
ssh scriptorumbra@http://vps64698.dreamhostps.com "mkdir -p /home/scriptorumbra/scriptor-backend"

# Upload backend files
rsync -avz --delete backend/ scriptorumbra@http://vps64698.dreamhostps.com:/home/scriptorumbra/scriptor-backend/
rsync -avz scripts/ scriptorumbra@http://vps64698.dreamhostps.com:/home/scriptorumbra/scriptor-scripts/
```

### Step 2: Install Dependencies

```bash
# SSH into your server
ssh scriptorumbra@http://vps64698.dreamhostps.com

# Navigate to backend directory
cd /home/scriptorumbra/scriptor-backend

# Install dependencies
npm install --production
```

### Step 3: Start Backend

**Option A: Direct Start (for testing)**
```bash
cd /home/scriptorumbra/scriptor-backend
npm start
```

**Option B: Using PM2 (recommended for production)**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd /home/scriptorumbra
pm2 start scriptor-scripts/config/ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 4: Configure Proxy (VPS with cPanel/Apache)

Create `.htaccess` in your domain root to proxy API requests:

```apache
# API Proxy for backend
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]
```

## Alternative: External Backend

If you're on shared hosting, deploy the backend to a service like:
- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com

Then update the frontend API endpoint in your deployed files.

## Testing

1. **Frontend**: Visit https://scriptorumbra.ai
2. **Backend Health**: https://scriptorumbra.ai/api/health (if proxied)
3. **Direct Backend**: http://http://vps64698.dreamhostps.com:3001/health (if VPS)

## Troubleshooting

### Common Issues

1. **Node.js not available**: Contact DreamHost support or upgrade to VPS
2. **Port 3001 blocked**: Use DreamHost's firewall settings to allow it
3. **CORS errors**: Update FRONTEND_URL in backend/.env
4. **Permission errors**: Check file permissions (755 for directories, 644 for files)

### Logs

Check application logs:
```bash
# PM2 logs
pm2 logs scriptor-umbra-backend

# Direct logs (if not using PM2)
cd /home/scriptorumbra/scriptor-backend
npm start > app.log 2>&1 &
tail -f app.log
```

## Security Notes

- Your API keys are configured in backend/.env
- Ensure .env file has restricted permissions: `chmod 600 .env`
- Enable HTTPS through DreamHost panel
- Consider using a separate database for production data

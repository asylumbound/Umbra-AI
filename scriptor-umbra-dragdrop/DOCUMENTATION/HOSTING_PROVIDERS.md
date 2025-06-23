# Hosting Provider Specific Instructions

## 🌐 Popular Hosting Providers

### DreamHost

**Frontend Deployment:**
1. Login to DreamHost Panel
2. Go to Files → File Manager
3. Navigate to your domain folder
4. Upload all files from `public_html/` directory
5. Ensure `.htaccess` is uploaded

**Backend Options:**
- DreamHost shared hosting doesn't support Node.js
- Use DreamHost VPS or deploy backend to external service
- Recommended: Use Railway or Render for backend

**Domain Configuration:**
- Update `backend/.env` with your DreamHost domain
- Enable SSL in DreamHost panel (free Let's Encrypt)

### cPanel Hosting

**Frontend Deployment:**
1. Login to cPanel
2. Open File Manager
3. Navigate to `public_html/`
4. Upload all files from package `public_html/` directory
5. Extract if uploaded as zip

**Backend Deployment:**
- Check if your host supports Node.js (many cPanel hosts now do)
- Look for "Node.js" or "Node.js Selector" in cPanel
- If available, upload backend files and follow host instructions
- If not available, use external backend service

### Hostinger

**Frontend:**
1. Use File Manager in hPanel
2. Upload to `public_html/`
3. Enable SSL in hPanel

**Backend:**
- Hostinger Business/Premium plans support Node.js
- Use their Node.js setup guide
- For shared plans, use external backend service

### SiteGround

**Frontend:**
1. Use Site Tools → File Manager
2. Upload to `public_html/`
3. Enable SSL via Site Tools

**Backend:**
- SiteGround supports Node.js on higher plans
- Check their Node.js documentation
- Alternative: External backend deployment

### Bluehost

**Frontend:**
1. Login to Bluehost cPanel
2. Use File Manager
3. Upload to `public_html/`

**Backend:**
- Bluehost supports Node.js on VPS plans
- Shared hosting: Use external service
- Enable SSL through Bluehost panel

## 🚀 External Backend Services

### Railway (Recommended)

1. **Sign up**: https://railway.app
2. **Deploy**: 
   - Connect GitHub or upload `backend/` folder
   - Railway auto-detects Node.js
   - Environment variables auto-configured
3. **Get URL**: Copy your Railway app URL
4. **Update Frontend**: Change API endpoint to Railway URL

### Render

1. **Sign up**: https://render.com
2. **Create Web Service**:
   - Upload `backend/` folder
   - Build command: `npm install`
   - Start command: `npm start`
3. **Environment Variables**: Already configured in `.env`
4. **Get URL**: Use provided Render URL

### Vercel

1. **Sign up**: https://vercel.com
2. **Deploy**:
   - Upload `backend/` folder
   - Vercel handles Node.js automatically
3. **Configure**: Environment variables from `.env`
4. **Get URL**: Use Vercel app URL

### Netlify Functions

1. **Convert to Functions**: Requires code modification
2. **Alternative**: Use Netlify for frontend, external service for backend

## 🔧 Configuration Updates

### Update Frontend API Endpoint

If using external backend service:

1. **Find the configuration**:
   - Look for API endpoint in frontend code
   - Usually in a config file or environment variable

2. **Update the URL**:
   - Change from `http://localhost:3001` 
   - To your external service URL (e.g., `https://your-app.railway.app`)

3. **Rebuild if necessary**:
   - Some hosting providers require rebuilding
   - Others update automatically

### SSL Configuration

**All Providers:**
1. Enable SSL/HTTPS in hosting panel
2. Update all URLs to use `https://`
3. Test that mixed content warnings don't appear

## 🛠️ Provider-Specific Tips

### Shared Hosting Limitations

**What Works:**
- Static frontend files
- .htaccess configuration
- SSL certificates

**What Doesn't Work:**
- Node.js backend (usually)
- Server-side processing
- Custom server configurations

**Solutions:**
- Use external backend service
- Consider upgrading to VPS
- Use serverless functions where available

### VPS/Dedicated Server

**Full Control:**
- Install Node.js 18+
- Configure reverse proxy (Nginx/Apache)
- Set up PM2 for process management
- Configure firewall and security

**Recommended Setup:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Deploy application
cd /path/to/backend
npm install
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## 📞 Provider Support

### Getting Help

**DreamHost:**
- Support: https://help.dreamhost.com
- Node.js: Available on VPS plans

**cPanel Hosts:**
- Check host documentation for Node.js support
- Contact support for specific requirements

**SiteGround:**
- Support: https://www.siteground.com/support
- Node.js: Available on higher plans

**Hostinger:**
- Support: https://support.hostinger.com
- Node.js: Business/Premium plans

**Bluehost:**
- Support: https://www.bluehost.com/help
- Node.js: VPS plans only

---

**Choose the method that works best for your hosting setup!**


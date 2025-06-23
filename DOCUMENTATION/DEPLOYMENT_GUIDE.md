# Scriptor Umbra AI - SFTP Deployment Guide

## 📦 Package Contents

This deployment package contains everything needed to deploy Scriptor Umbra AI to your web hosting provider via SFTP. The application is pre-configured with your OpenAI API credentials and ready for immediate deployment.

### Directory Structure

```
scriptor-umbra-deployment/
├── public_html/              # Frontend files (upload to your domain's public folder)
│   ├── index.html           # Main application entry point
│   ├── assets/              # CSS, JS, and other static assets
│   └── .htaccess           # Apache configuration for SPA routing
├── backend/                 # Node.js backend application
│   ├── server.js           # Main server file
│   ├── routes/             # API route handlers
│   ├── package.json        # Dependencies and scripts
│   ├── .env                # Pre-configured environment variables
│   └── node_modules/       # (will be created after npm install)
├── scripts/                # Deployment and management scripts
│   └── start-backend.sh    # Backend startup script
├── config/                 # Configuration files
│   └── ecosystem.config.js # PM2 process manager configuration
├── docs/                   # Documentation
├── logs/                   # Application logs (created automatically)
└── ssl/                    # SSL certificate storage (if needed)
```

## 🚀 Quick Deployment Steps

### Step 1: Upload Frontend Files

1. **Connect to your hosting provider via SFTP**
   - Use your preferred SFTP client (FileZilla, WinSCP, etc.)
   - Connect using your hosting provider's SFTP credentials

2. **Upload public_html contents**
   - Navigate to your domain's public folder (usually `public_html/` or `www/`)
   - Upload ALL contents from the `public_html/` directory
   - Ensure `.htaccess` file is uploaded (may be hidden)

3. **Set proper permissions**
   - Set directories to 755
   - Set files to 644
   - Ensure `.htaccess` is readable (644)

### Step 2: Deploy Backend (if supported)

**For VPS/Dedicated Servers:**

1. **Upload backend files**
   - Create a directory outside public_html (e.g., `/home/username/scriptor-backend/`)
   - Upload entire `backend/` directory contents

2. **Install dependencies**
   ```bash
   cd /path/to/backend
   npm install
   ```

3. **Start the backend**
   ```bash
   # Using the provided script
   ../scripts/start-backend.sh
   
   # Or manually
   npm start
   
   # For production with PM2
   pm2 start ../config/ecosystem.config.js
   ```

**For Shared Hosting:**
- Most shared hosting providers do not support Node.js
- Consider using a separate service like Railway, Render, or Vercel for the backend
- Update the frontend's API endpoint to point to your deployed backend

### Step 3: Configure Domain Settings

1. **Update environment variables**
   - Edit `backend/.env` file
   - Change `FRONTEND_URL=https://yourdomain.com` to your actual domain

2. **SSL Certificate (Recommended)**
   - Enable SSL through your hosting provider
   - Ensure HTTPS is enforced for security

3. **Test the deployment**
   - Visit your domain to see the frontend
   - Test the chat functionality to ensure backend connectivity

## 🔧 Configuration Details

### Pre-Configured Settings

Your deployment package is already configured with:

- **OpenAI API Key**: `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`
- **Assistant ID**: `asst_SIM27MLhW3jL4xRG6SyNzFzc`
- **Production optimizations**: Compression, caching, security headers
- **Rate limiting**: 100 requests per 15 minutes
- **CORS configuration**: Ready for cross-origin requests

### Environment Variables Reference

```env
# OpenAI Configuration (Pre-configured)
OPENAI_API_KEY=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
ASSISTANT_ID=asst_SIM27MLhW3jL4xRG6SyNzFzc

# Update these for your domain
FRONTEND_URL=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

## 🌐 Hosting Provider Specific Instructions

### Shared Hosting (cPanel, etc.)

1. **Frontend Deployment**
   - Upload `public_html/` contents to your domain's public folder
   - Ensure `.htaccess` is uploaded for proper routing

2. **Backend Options**
   - **Option A**: Use external backend service (Recommended)
     - Deploy backend to Railway, Render, or Vercel
     - Update frontend API endpoint
   - **Option B**: Check if your host supports Node.js
     - Some shared hosts offer Node.js support
     - Follow their specific deployment instructions

### VPS/Dedicated Servers

1. **Full Deployment**
   - Upload both frontend and backend
   - Install Node.js 18+ if not available
   - Use PM2 for process management
   - Configure reverse proxy (Nginx/Apache)

2. **Reverse Proxy Configuration (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /path/to/public_html;
           try_files $uri $uri/ /index.html;
       }
       
       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Cloud Hosting (AWS, DigitalOcean, etc.)

1. **Frontend**: Deploy to S3 + CloudFront or similar CDN
2. **Backend**: Deploy to EC2, App Platform, or container service
3. **Database**: Not required for this application
4. **SSL**: Use Let's Encrypt or cloud provider SSL

## 🔒 Security Considerations

### Production Security Checklist

- ✅ **HTTPS Enabled**: Ensure SSL certificate is active
- ✅ **Environment Variables**: API keys stored securely
- ✅ **Rate Limiting**: Configured to prevent abuse
- ✅ **CORS**: Properly configured for your domain
- ✅ **Security Headers**: Implemented via .htaccess
- ✅ **File Permissions**: Set correctly (755/644)

### Additional Security Measures

1. **Firewall Configuration**
   - Only allow necessary ports (80, 443, 22)
   - Block direct access to backend port if possible

2. **Regular Updates**
   - Keep Node.js and dependencies updated
   - Monitor for security vulnerabilities

3. **Monitoring**
   - Set up log monitoring
   - Monitor API usage and costs
   - Set up uptime monitoring

## 🛠️ Maintenance and Updates

### Regular Maintenance Tasks

1. **Monitor API Usage**
   - Check OpenAI usage at https://platform.openai.com/usage
   - Set up billing alerts

2. **Update Dependencies**
   ```bash
   cd backend/
   npm audit
   npm update
   ```

3. **Log Management**
   - Regularly check application logs
   - Rotate logs to prevent disk space issues

4. **Backup**
   - Backup configuration files
   - Keep a copy of your deployment package

### Updating the Application

1. **Frontend Updates**
   - Replace files in public_html/
   - Clear browser cache

2. **Backend Updates**
   - Stop the backend service
   - Update files
   - Install new dependencies if needed
   - Restart the service

## 🆘 Troubleshooting

### Common Issues

1. **Frontend not loading**
   - Check if all files uploaded correctly
   - Verify .htaccess file is present
   - Check file permissions

2. **API errors**
   - Verify backend is running
   - Check environment variables
   - Confirm API key is valid

3. **CORS errors**
   - Update FRONTEND_URL in backend .env
   - Check CORS configuration

4. **SSL issues**
   - Ensure SSL certificate is properly configured
   - Update all URLs to use HTTPS

### Getting Help

- **OpenAI API Issues**: Check https://platform.openai.com/docs
- **Hosting Issues**: Contact your hosting provider
- **Application Issues**: Check the logs in the `logs/` directory

## 📞 Support Information

- **Application**: Scriptor Umbra AI v1.0
- **Built by**: Manus AI
- **OpenAI Assistant**: Pre-configured for ghostwriting
- **Last Updated**: June 2025

---

**Your Scriptor Umbra AI is ready for deployment!**

Follow the steps above to get your intelligent ghostwriting assistant live on your domain.


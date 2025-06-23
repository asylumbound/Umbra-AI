# 🛠️ Quick Troubleshooting

## 🌐 Frontend Issues

### Website not loading
- ✅ **Check**: All files uploaded from `DRAG_TO_DOMAIN` folder?
- ✅ **Check**: `.htaccess` file uploaded? (might be hidden)
- ✅ **Check**: File permissions set to 644 for files, 755 for folders?
- ✅ **Fix**: Re-upload all files, ensure `.htaccess` is included

### Blank page or errors
- ✅ **Check**: Browser console for JavaScript errors (F12)
- ✅ **Check**: Is HTTPS enabled on your domain?
- ✅ **Fix**: Enable SSL certificate in your hosting panel

## 🚀 Backend Issues

### "API not responding"
- ✅ **Check**: Is backend running? Visit `your-backend-url/health`
- ✅ **Check**: CORS errors in browser console?
- ✅ **Fix**: Update `FRONTEND_URL` in backend `.env` file

### Backend won't start
- ✅ **Check**: Node.js 18+ installed? Run `node --version`
- ✅ **Check**: Dependencies installed? Run `npm install`
- ✅ **Fix**: Use the deployment scripts (`deploy.sh` or `deploy.bat`)

### OpenAI API errors
- ✅ **Check**: API key valid? Test at https://platform.openai.com
- ✅ **Check**: Assistant ID correct? `asst_SIM27MLhW3jL4xRG6SyNzFzc`
- ✅ **Check**: Billing account active? Check usage limits

## 🔧 Common Fixes

### 1. Re-upload Frontend
```bash
# Delete everything in your domain's public folder
# Re-upload ALL files from DRAG_TO_DOMAIN folder
# Include hidden .htaccess file
```

### 2. Reset Backend
```bash
cd BACKEND_STANDALONE
rm -rf node_modules
npm install
./deploy.sh
```

### 3. Check Environment
```bash
# Verify .env file contains:
OPENAI_API_KEY=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
ASSISTANT_ID=asst_SIM27MLhW3jL4xRG6SyNzFzc
```

## 🌐 Hosting-Specific Issues

### Shared Hosting (cPanel, DreamHost)
- **Problem**: Backend not supported
- **Solution**: Use Railway/Render for backend, keep frontend on shared hosting

### VPS/Dedicated Server
- **Problem**: Port 3001 blocked
- **Solution**: Configure firewall to allow port 3001 or use reverse proxy

### Cloud Services
- **Problem**: Environment variables not set
- **Solution**: Add variables in service dashboard, not just .env file

## 📞 Still Need Help?

### Quick Tests
```bash
# Test frontend
curl -I https://yourdomain.com

# Test backend
curl https://your-backend-url/health

# Test API
curl -X POST https://your-backend-url/api/chat/completion \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### Check These URLs
- **OpenAI Platform**: https://platform.openai.com
- **Your Domain**: https://yourdomain.com
- **Backend Health**: https://your-backend-url/health

### Log Files
- **Frontend**: Browser console (F12)
- **Backend**: Check terminal output or service logs

---

**Most issues are solved by re-uploading files or restarting the backend!** 🎯


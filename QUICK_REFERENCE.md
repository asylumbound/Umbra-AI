# ⚡ Quick Reference Card

## 🎯 Deploy in 2 Steps

### 1️⃣ Frontend (30 seconds)
```
📁 DRAG_TO_DOMAIN/ → Your domain's public folder
```
- Select ALL files (Ctrl+A / Cmd+A)
- Drag to your website via SFTP/File Manager
- Include .htaccess file (might be hidden)

### 2️⃣ Backend (30 seconds)
**Option A: Cloud (Recommended)**
```
📁 BACKEND_STANDALONE/ → Railway/Render/Vercel
```
- Upload folder to cloud service
- They handle everything automatically

**Option B: Your Server**
```bash
./deploy.sh    # Linux/Mac
deploy.bat     # Windows
```

## ✅ Pre-Configured
- **API Key**: `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`
- **Assistant**: `asst_SIM27MLhW3jL4xRG6SyNzFzc`
- **Security**: HTTPS, CORS, Rate Limiting
- **Performance**: Optimized & Compressed

## 🧪 Test Success
1. **Frontend**: Visit `https://yourdomain.com`
2. **Backend**: Visit `https://your-backend-url/health`
3. **Integration**: Send a test message

## 🆘 Quick Fixes
- **Not loading**: Re-upload all files, include .htaccess
- **API errors**: Check backend is running
- **CORS errors**: Update FRONTEND_URL in .env

## 📚 Need Help?
- `DOCUMENTATION/TROUBLESHOOTING.md` - Common issues
- `DOCUMENTATION/VISUAL_GUIDE.md` - Step-by-step screenshots
- `DOCUMENTATION/COMPLETE_GUIDE.md` - Full instructions

---
**Built by Manus AI** | Ready to write amazing content! 🎉


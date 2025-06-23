# 🚀 BACKEND STANDALONE

## 📁 What's in this folder?

This folder contains the **complete backend** of your Scriptor Umbra AI application, ready for one-click deployment anywhere.

## ⚡ One-Click Deployment

### For Linux/Mac:
```bash
./deploy.sh
```

### For Windows:
```cmd
deploy.bat
```

**That's it!** The script handles everything automatically.

## 🔧 What the deployment script does:

1. ✅ **Checks Node.js** (installs if missing)
2. ✅ **Installs dependencies** (npm install)
3. ✅ **Configures environment** (sets up .env)
4. ✅ **Finds available port** (3001 or next available)
5. ✅ **Starts the server** (ready to use)

## 🌐 Deploy to Cloud Services

### Railway (Recommended)
1. Upload this entire folder to Railway
2. Railway auto-detects Node.js and runs `npm start`
3. Your API is live instantly!

### Render
1. Upload this folder to Render
2. Build command: `npm install`
3. Start command: `npm start`
4. Done!

### Vercel
1. Upload this folder to Vercel
2. Vercel handles everything automatically
3. Your API is deployed!

## ✅ Pre-Configured Features

- **OpenAI API Key**: `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`
- **Assistant ID**: `asst_SIM27MLhW3jL4xRG6SyNzFzc`
- **CORS**: Enabled for all origins
- **Rate Limiting**: 100 requests per 15 minutes
- **Security**: Helmet.js protection
- **Health Checks**: `/health` endpoint

## 📂 Files Included

- `server.js` - Main application server
- `routes/` - API endpoint handlers
- `package.json` - Dependencies and scripts
- `.env` - Your configured environment variables
- `deploy.sh` - Linux/Mac deployment script
- `deploy.bat` - Windows deployment script
- `node_modules/` - All dependencies included

## 🔗 API Endpoints

- `GET /health` - Health check
- `POST /api/chat/completion` - Chat with AI
- `POST /api/chat/thread/new` - Create new conversation
- `GET /api/chat/thread/:id/messages` - Get conversation history

## 🛠️ Manual Deployment

If you prefer manual setup:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for production
npm run production
```

## 🌍 Environment Variables

Already configured in `.env`:

```env
OPENAI_API_KEY=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
ASSISTANT_ID=asst_SIM27MLhW3jL4xRG6SyNzFzc
PORT=3001
NODE_ENV=production
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin protection
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Secure API endpoints
- **Environment Variables**: Secure credential storage

---

**Just run the script and you're live!** 🎉


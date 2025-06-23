# Netlify Deployment Guide

## 🚀 Quick Deploy from GitHub

### Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Netlify Account**: Sign up at https://netlify.com
3. **Environment Variables**: Your OpenAI API credentials

### Option 1: Netlify Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://app.netlify.com/
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Set Environment Variables**
   Go to Site Settings > Environment variables and add:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ASSISTANT_ID=your_assistant_id
   SUPABASE_URL=your_supabase_url (if using)
   SUPABASE_ANON_KEY=your_supabase_anon_key (if using)
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key (if using)
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy site"
   - Your site will be available at a generated .netlify.app URL
   - You can add a custom domain later

### Option 2: GitHub Actions (Automated)

1. **Set GitHub Secrets**
   Go to your GitHub repo > Settings > Secrets and variables > Actions:
   ```
   NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
   NETLIFY_SITE_ID=your_netlify_site_id
   ```

2. **Get Netlify Tokens**
   - Auth Token: https://app.netlify.com/user/applications#personal-access-tokens
   - Site ID: Site Settings > General > Site details

3. **Push to GitHub**
   - Every push to main branch will trigger automatic deployment
   - Check Actions tab for deployment status

### Option 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   # Build and deploy
   npm run build
   netlify deploy --prod --dir=dist
   ```

## 🔧 Configuration Files

### netlify.toml
- Build settings and redirects
- Serverless function configuration
- Headers and caching rules

### Functions
- `/netlify/functions/chat.js` - Main chat API endpoint
- `/netlify/functions/health.js` - Health check endpoint

## 🌐 API Endpoints

After deployment, your API will be available at:
- `https://your-site.netlify.app/api/chat` - Chat endpoint
- `https://your-site.netlify.app/api/health` - Health check

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- CORS properly configured
- Security headers included
- Environment variables secured
- Content Security Policy enabled

## 📊 Monitoring

- Check function logs in Netlify dashboard
- Monitor usage and performance
- Set up alerts for errors

## 🛠️ Development

### Local Development with Netlify Dev

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

This will:
- Serve your frontend at http://localhost:8888
- Run serverless functions locally
- Use your environment variables

### Testing Functions Locally

```bash
# Test health endpoint
curl http://localhost:8888/api/health

# Test chat endpoint
curl -X POST http://localhost:8888/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test message"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are listed in package.json
   - Check build logs in Netlify dashboard

2. **Function Errors**
   - Verify environment variables are set
   - Check function logs in Netlify dashboard
   - Test functions locally with `netlify dev`

3. **CORS Issues**
   - Functions include CORS headers
   - Check if your domain is properly configured

4. **OpenAI API Errors**
   - Verify API key is valid and has credits
   - Check Assistant ID is correct
   - Monitor API usage in OpenAI dashboard

### Debugging Steps

1. **Check Build Logs**
   - Go to Netlify dashboard > Deploys
   - Click on failed deploy to see logs

2. **Check Function Logs**
   - Netlify dashboard > Functions > View logs
   - Real-time logs available during development

3. **Test Locally**
   ```bash
   netlify dev
   ```

## 📈 Performance Optimization

- Static assets are cached for 1 year
- Functions run on-demand (serverless)
- Consider upgrading to Pro for better performance
- Use Netlify Analytics for insights

## 💰 Cost Considerations

**Free Tier Includes:**
- 100GB bandwidth per month
- 125,000 function invocations per month
- 100 hours build time per month

**Paid Plans:**
- Pro: $19/month for increased limits
- Business: $99/month for teams

Monitor usage in Netlify dashboard to avoid overages.

## 🔄 Updates and Maintenance

1. **Automatic Updates**
   - Connected to GitHub for automatic deployments
   - Every push to main branch deploys automatically

2. **Manual Updates**
   ```bash
   # Update dependencies
   npm update
   
   # Test locally
   netlify dev
   
   # Commit and push
   git add .
   git commit -m "Update dependencies"
   git push origin main
   ```

3. **Rollbacks**
   - Use Netlify dashboard to rollback to previous deployment
   - Or revert Git commit and push

---

## 📞 Support

- **Netlify Docs**: https://docs.netlify.com/
- **OpenAI API Docs**: https://platform.openai.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions

Your Scriptor Umbra AI is now ready for Netlify deployment! 🎉

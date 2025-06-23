# How to Run Backend and Frontend Servers

## Quick Start

### Option 1: Manual Start (Recommended for Development)

1. **Start Backend Server**
   ```bash
   npm run dev
   ```
   - Runs on port 3001 with auto-restart
   - Access health check: http://localhost:3001/health

2. **Start Frontend Server** (in a new terminal)
   ```bash
   cd DRAG_TO_DOMAIN
   python3 -m http.server 5173
   ```
   - Runs on port 5173
   - Access frontend: http://localhost:5173

### Option 2: Background Start (Both at Once)

```bash
# Kill any existing processes on the ports
pkill -f "node.*server.js"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start backend in background
npm run dev > backend.log 2>&1 &

# Start frontend in background
cd DRAG_TO_DOMAIN && python3 -m http.server 5173 > ../frontend.log 2>&1 &
```

## Troubleshooting

### Port Already in Use Error

If you get `EADDRINUSE` error:

```bash
# Find and kill processes using the ports
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Or kill all node server processes
pkill -f "node.*server.js"
```

### Check if Servers are Running

```bash
# Check running processes
ps aux | grep -E "(node.*server.js|python.*http.server)" | grep -v grep

# Test backend health
curl http://localhost:3001/health

# Check frontend
curl -I http://localhost:5173
```

## Server Details

- **Backend**: Node.js Express server with nodemon
  - Port: 3001 (configurable via .env PORT variable)
  - Auto-restarts on file changes
  - Includes CORS, rate limiting, and error handling

- **Frontend**: Static file server
  - Port: 5173 (matches FRONTEND_URL in backend CORS config)
  - Serves built React/HTML files from DRAG_TO_DOMAIN directory

## Environment Variables

Make sure your `.env` file contains:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_key_here
ASSISTANT_ID=your_assistant_id
```
@echo off
REM Scriptor Umbra AI - One-Click Backend Deployment (Windows)
REM This script sets up and starts your backend automatically

echo.
echo 🚀 Scriptor Umbra AI Backend - One-Click Deployment
echo ==================================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js found: %NODE_VERSION%

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm found: %NPM_VERSION%

REM Change to script directory
cd /d "%~dp0"

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.production" (
        echo [INFO] Copying .env.production to .env
        copy ".env.production" ".env"
        echo [SUCCESS] .env file created
    ) else (
        echo [ERROR] No environment configuration found!
        echo Please create a .env file with your OpenAI credentials:
        echo OPENAI_API_KEY=your_api_key_here
        echo ASSISTANT_ID=your_assistant_id_here
        pause
        exit /b 1
    )
)

echo [SUCCESS] Environment configuration verified

REM Set default port
if "%PORT%"=="" set PORT=3001

REM Start the server
echo [INFO] Starting Scriptor Umbra AI Backend on port %PORT%...
echo.
echo 🎉 Backend will be available at:
echo    Local: http://localhost:%PORT%
echo    Health Check: http://localhost:%PORT%/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start with npm start
npm start

pause


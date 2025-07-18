@echo off
echo ========================================
echo  Starting Aura MCP Test Execution Servers
echo ========================================
echo.

echo 🛑 Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo.
echo ⏳ Waiting for processes to close...
timeout /t 3 /nobreak > nul

echo.
echo 📁 Setting up environment...
if not exist .env (
    copy env.template .env
    echo Environment file created from template. Please update with your API keys.
) else (
    echo Environment file already exists.
)

echo.
echo 📁 Creating screenshots directory...
if not exist screenshots mkdir screenshots

echo.
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo.
echo 📦 Installing Playwright MCP server...
npm install -g @playwright/mcp@latest

echo.
echo 🎭 Starting Playwright MCP Server (VISIBLE browser)...
echo Browser will be VISIBLE during test execution!
echo.

start "Playwright MCP Server" cmd /k "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo ⏳ Waiting for Playwright server to initialize...
timeout /t 8 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Test Execution Server...
echo This server will handle test case execution requests from Aura
echo.

python mcp_server.py

pause 
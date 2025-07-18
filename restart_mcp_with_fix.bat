@echo off
echo ========================================
echo  Restarting MCP with Official Package Fix
echo ========================================
echo.

echo 🛑 Stopping all existing servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM msedge.exe >nul 2>&1

echo ⏳ Waiting for processes to close...
timeout /t 5 /nobreak > nul

echo.
echo 🔧 Starting servers with official Playwright MCP package...
echo.

cd mcp
echo 📦 Installing official Playwright MCP package...
npm install -g @playwright/mcp@latest

echo.
echo 🎭 Starting Playwright MCP Server (VISIBLE browser)...
start "Playwright MCP Server" cmd /k "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo.
echo ⏳ Waiting for Playwright server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Test Execution Server...
start "Aura MCP Server" cmd /k "python mcp_server.py"

echo.
echo ✅ Servers restarted with official Playwright MCP package!
echo.
echo 🎭 The browser should now be VISIBLE during test execution
echo 📋 Try running a test in the Aura interface to verify
echo.
pause
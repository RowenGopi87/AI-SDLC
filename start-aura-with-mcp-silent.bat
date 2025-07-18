@echo off
echo ========================================
echo  Starting Aura with MCP Test Execution
echo ========================================
echo.

echo 🔍 Checking setup...
if not exist mcp\.env (
    echo ❌ MCP environment not configured!
    echo.
    echo Please run scripts/setup-mcp.bat first to configure the environment.
    echo.
    pause
    exit /b 1
)

echo ✅ MCP environment configured
echo.

echo 🛑 Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo ✅ Closed existing server processes.

echo.
echo ⏳ Waiting for processes to close...
timeout /t 3 /nobreak > nul

echo.
echo 🎭 Starting Playwright MCP Server (background)...
cd mcp
start /min "" cmd /c "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo.
echo ⏳ Waiting for Playwright server to initialize...
timeout /t 8 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Test Execution Server (background)...
start /min "" cmd /c "python mcp_server.py"

echo.
echo ⏳ Waiting for MCP server to initialize...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 Starting Aura Development Server (background)...
cd ..
start /min "" cmd /c "npm run dev"

echo.
echo ========================================
echo  All servers started silently!
echo ========================================
echo.
echo 🎭 Playwright MCP Server: http://localhost:8931
echo 🐍 Aura MCP Server: http://localhost:8000
echo 🌐 Aura Development Server: http://localhost:3000
echo.
echo ✅ You can now use the play button in Aura to execute test cases!
echo.
echo Use stop-all-servers.bat to close all background processes.
echo.
exit 
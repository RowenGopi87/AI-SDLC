@echo off
echo ========================================
echo  Starting Aura with MCP Test Execution
echo ========================================
echo.

echo 🔍 Checking setup...
if not exist mcp\.env (
    echo ❌ MCP environment not configured!
    echo.
    echo Please run setup-mcp.bat first to configure the environment.
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
echo 🎭 Starting Playwright MCP Server...
echo Browser will be VISIBLE during test execution!
cd mcp
start "Playwright MCP Server" cmd /k "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo.
echo ⏳ Waiting for Playwright server to initialize...
timeout /t 8 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Test Execution Server...
start "Aura MCP Server" cmd /k "python mcp_server.py"

echo.
echo ⏳ Waiting for MCP server to initialize...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 Starting Aura Development Server...
cd ..
start "Aura Dev Server" cmd /k "npm run dev"

echo.
echo ✨ All servers are starting up in separate windows.
echo Please wait for all servers to initialize.
echo.
pause 
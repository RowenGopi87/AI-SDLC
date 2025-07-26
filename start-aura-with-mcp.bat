@echo off
echo ========================================
echo  Starting Aura with MCP Integration
echo  (Playwright + Jira Cloud)
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
echo 🎭 Starting Playwright MCP Server (Port 8931)...
echo Browser will be VISIBLE during test execution!
cd mcp
start "Playwright MCP Server" cmd /k "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo.
echo ⏳ Waiting for Playwright server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🔗 Starting Jira MCP Server...
echo This will open your browser for Jira authentication
start "Jira MCP Server" cmd /k "npx -y mcp-remote https://mcp.atlassian.com/v1/sse"

echo.
echo ⏳ Waiting for Jira server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Bridge Server (Port 8000)...
start "Aura MCP Bridge" cmd /k "python mcp_server.py"

echo.
echo ⏳ Waiting for MCP bridge server to initialize...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 Starting Aura Development Server...
cd ..
start "Aura Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo  🎉 ALL SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 📋 Server Status:
echo   🎭 Playwright MCP: http://localhost:8931
echo   🔗 Jira MCP: Browser authentication required
echo   🐍 Aura MCP Bridge: http://localhost:8000
echo   🌐 Aura Dev Server: http://localhost:3000
echo.
echo 📝 Ready to use:
echo   ✅ Test Case Execution (Playwright MCP)
echo   ✅ Jira Integration (Click Jira icons on initiatives)
echo   ✅ Requirements Management (Full Aura functionality)
echo.
echo 🔧 Important: Complete Jira authentication in browser
echo 📖 Visit: http://localhost:3000/requirements to start
echo.
pause 
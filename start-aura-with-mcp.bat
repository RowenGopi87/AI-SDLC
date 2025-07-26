@echo off
echo ========================================
echo  Starting Aura with MCP Integration
echo ========================================
echo.

echo 🛑 Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8931"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8932"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ⏳ Waiting for processes to close...
timeout /t 3 /nobreak > nul

echo.
echo 📁 Checking MCP environment...
cd /d "%~dp0\mcp"
if not exist .env (
    copy env.template .env
    echo Environment file created. Please update .env with your API keys.
    pause
)

echo.
echo 🎭 Starting Playwright MCP Server (Port 8931)...
start "Playwright MCP Server" cmd /c "cd /d \"%~dp0\mcp\" && npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo ⏳ Waiting for Playwright server...
timeout /t 5 /nobreak > nul

echo.
echo 🔗 Starting Jira MCP Server (Port 8932)...
echo This will open browser for authentication
start "Jira MCP Server" cmd /c "cd /d \"%~dp0\mcp\" && npx -y mcp-remote https://mcp.atlassian.com/v1/sse"

echo ⏳ Waiting for Jira server...
timeout /t 5 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Bridge Server (Port 8000)...
start "Aura MCP Bridge" cmd /c "cd /d \"%~dp0\mcp\" && python mcp_server.py"

echo ⏳ Waiting for bridge server...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Starting Aura Dev Server (Port 3000)...
start "Aura Dev Server" cmd /c "cd /d \"%~dp0\" && npm run dev"

echo.
echo ========================================
echo  🎉 ALL SERVERS STARTED!
echo ========================================
echo.
echo 📋 Server Status:
echo   🎭 Playwright MCP: http://localhost:8931
echo   🔗 Jira MCP: Browser authentication required
echo   🐍 Bridge Server: http://localhost:8000
echo   🌐 Aura Dev: http://localhost:3000
echo.
echo 📝 Next Steps:
echo   1. Complete Jira authentication in browser
echo   2. Wait for all servers to initialize
echo   3. Visit: http://localhost:3000/design
echo   4. Upload design images for AI code generation
echo.
echo 📊 Each server runs in its own window for easy debugging
echo 📊 Close individual windows or press Ctrl+C to stop servers
echo.
echo 🚀 Opening Aura Design tab...
timeout /t 10 /nobreak > nul
start http://localhost:3000/design

echo.
echo Press any key to exit this window...
pause > nul 
@echo off
echo ========================================
echo  Starting All Aura MCP Servers
echo ========================================
echo.

echo 🛑 Stopping all existing MCP servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8931"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8932"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ⏳ Waiting for processes to close...
timeout /t 3 /nobreak > nul

echo.
echo 📁 Setting up environment...
if not exist .env (
    copy env.template .env
    echo Environment file created from template. Please update with your API keys and Jira settings.
    echo.
    echo ⚠️  IMPORTANT: Update the .env file with your:
    echo    - Google API Key (required for LLM)
    echo    - Jira Cloud ID (get from: https://your-domain.atlassian.net/_edge/tenant_info)
    echo    - Jira Project Key (default: AURA)
    echo.
    pause
) else (
    echo Environment file already exists.
)

echo.
echo 📁 Creating screenshots directory...
if not exist screenshots mkdir screenshots

echo.
echo 📦 Installing dependencies...
pip install -r requirements.txt
npm install -g mcp-remote @playwright/mcp@latest

echo.
echo 🎭 Starting Playwright MCP Server (Port 8931)...
start "Playwright MCP Server" cmd /k "npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots"

echo ⏳ Waiting for Playwright server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🔗 Starting Jira MCP Server (Port 8932)...
echo This will open your browser for Jira authentication
start "Jira MCP Server" cmd /k "npx -y mcp-remote https://mcp.atlassian.com/v1/sse"

echo ⏳ Waiting for Jira server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Bridge Server (Port 8000)...
echo This server bridges Aura with both Playwright and Jira MCP servers
start "Aura MCP Bridge" cmd /k "python mcp_server.py"

echo ⏳ Waiting for bridge server to initialize...
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo  🎉 ALL MCP SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 📋 Server Status:
echo   🎭 Playwright MCP Server: http://localhost:8931
echo   🔗 Jira MCP Server: Browser authentication required
echo   🐍 Aura MCP Bridge: http://localhost:8000
echo.
echo 📝 Next Steps:
echo   1. Complete Jira authentication in the browser window
echo   2. Update your .env file with correct Jira Cloud ID
echo   3. Start your Aura development server: npm run dev
echo   4. Go to Work Items → Requirements page
echo   5. Click the Jira icon next to any initiative
echo.
echo 🔧 Available Endpoints:
echo   - Test Case Execution: POST /execute-test-case
echo   - Create Jira Issue: POST /create-jira-issue
echo   - Health Check: GET /health
echo   - Available Tools: GET /tools
echo.
echo Press any key to open the Aura application...
pause > nul

echo.
echo 🚀 Opening Aura in browser...
start http://localhost:3000/requirements

echo.
echo 📊 Server logs will appear in their respective windows.
echo 📊 Close this window to stop all servers or use Ctrl+C in individual windows.
echo.
pause 
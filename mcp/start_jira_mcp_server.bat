@echo off
echo ========================================
echo  Starting Aura Jira MCP Server
echo ========================================
echo.

echo 🛑 Stopping existing Jira MCP servers...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8932"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ⏳ Waiting for processes to close...
timeout /t 2 /nobreak > nul

echo.
echo 📁 Setting up environment...
if not exist .env (
    copy env.template .env
    echo Environment file created from template. Please update with your Jira settings.
) else (
    echo Environment file already exists.
)

echo.
echo 📦 Installing mcp-remote (if not already installed)...
npm install -g mcp-remote

echo.
echo 🔗 Starting Jira MCP Server...
echo This will open your browser for Jira authentication
echo Server will be available on port 8932
echo.

start "Jira MCP Server" cmd /k "npx -y mcp-remote https://mcp.atlassian.com/v1/sse"

echo ⏳ Waiting for Jira MCP server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo ✅ Jira MCP Server started successfully!
echo 📝 Browser should open for Jira authentication
echo 🔗 Server endpoint: http://localhost:8932
echo 📋 Available tools: Create Issues, Update Issues, Get Projects, etc.
echo.

pause 
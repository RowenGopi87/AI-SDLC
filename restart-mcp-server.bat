@echo off
echo ========================================
echo  Restarting MCP Server with SSL Fixes
echo ========================================
echo.

echo 🛑 Stopping MCP server...
taskkill /F /IM python.exe >nul 2>&1

echo.
echo ⏳ Waiting for process to close...
timeout /t 2 /nobreak > nul

echo.
echo 🐍 Starting Aura MCP Test Execution Server...
echo (SSL certificate fixes have been applied)
cd mcp
start "Aura MCP Server" cmd /k "python mcp_server.py"

echo.
echo ✅ MCP server restarted with SSL fixes
echo ✅ Try executing a test case now
echo.
pause 
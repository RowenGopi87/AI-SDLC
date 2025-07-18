@echo off
echo ========================================
echo  Stopping All Aura MCP Servers
echo ========================================
echo.

echo 🛑 Stopping all servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo.
echo ⏳ Waiting for processes to close...
timeout /t 2 /nobreak > nul

echo.
echo ✅ All servers have been stopped
echo.
echo Press any key to exit...
pause 
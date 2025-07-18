@echo off
echo ========================================
echo  Clearing Stuck Browser Processes
echo ========================================
echo.

echo 🛑 Stopping all Chrome processes...
taskkill /F /IM chrome.exe >nul 2>&1
taskkill /F /IM msedge.exe >nul 2>&1
taskkill /F /IM firefox.exe >nul 2>&1

echo.
echo 🛑 Stopping Node.js processes (MCP servers)...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo 🛑 Stopping Python processes (MCP servers)...
taskkill /F /IM python.exe >nul 2>&1

echo.
echo 🧹 Cleaning up Playwright browser profiles...
rmdir /s /q "%USERPROFILE%\.cache\ms-playwright" >nul 2>&1
rmdir /s /q "%LOCALAPPDATA%\ms-playwright" >nul 2>&1

echo.
echo ⏳ Waiting for processes to fully close...
timeout /t 3 /nobreak > nul

echo.
echo ✅ All browser processes cleared
echo ✅ MCP servers stopped
echo ✅ Playwright browser profiles cleaned
echo.
echo 💡 You can now restart the servers with: start-aura-with-mcp.bat
echo.
pause 
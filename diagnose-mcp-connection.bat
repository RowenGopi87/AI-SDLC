@echo off
echo ========================================
echo  Diagnosing MCP Connection Issues
echo ========================================
echo.

echo 🔍 Checking installed packages...
npm list -g | findstr playwright

echo.
echo 🔍 Checking for running processes...
tasklist | findstr "node.exe" | findstr "8931"
tasklist | findstr "python.exe" | findstr "8000"

echo.
echo 🔍 Checking port availability...
netstat -an | findstr "8931"
netstat -an | findstr "8000"

echo.
echo 🔍 Testing Python MCP client...
cd mcp
python test-mcp-connection.py

echo.
echo 🔍 Testing HTTP endpoint...
curl -s -o nul -w "HTTP Status: %%{http_code}" http://localhost:8931/sse || echo "Connection failed"

echo.
echo ========================================
echo  Diagnosis Complete
echo ========================================
pause 
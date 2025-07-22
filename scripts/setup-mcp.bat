@echo off
echo ========================================
echo  Aura MCP Integration - One-Time Setup
echo  (Playwright + Jira Cloud)
echo ========================================
echo.

echo 📁 Setting up MCP environment...
cd mcp
if not exist .env (
    copy env.template .env
    echo.
    echo ✅ Environment file created: mcp\.env
    echo.
    echo ⚠️  IMPORTANT: Please update mcp\.env with your API keys!
    echo    - Add your Google API key (required for LLM)
    echo    - Add your Jira Cloud ID (get from: https://your-domain.atlassian.net/_edge/tenant_info)
    echo    - Add your Jira Project Key (default: AURA)
    echo    - Add your OpenAI/Anthropic API keys (optional)
    echo.
    echo Opening the .env file for you to edit...
    start notepad .env
    echo.
    echo Please update your API keys in the opened file, then save and close it.
    echo.
    pause
) else (
    echo ✅ Environment file already exists: mcp\.env
)

echo.
echo 📁 Creating screenshots directory...
if not exist screenshots (
    mkdir screenshots
    echo ✅ Screenshots directory created: mcp\screenshots\
) else (
    echo ✅ Screenshots directory already exists: mcp\screenshots\
)

echo.
echo 📦 Installing Python dependencies...
echo This may take a few minutes...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Error installing Python dependencies
    pause
    exit /b 1
)
echo ✅ Python dependencies installed successfully

echo.
echo 🔧 Installing SSL certificate support...
pip install certifi
echo ✅ SSL certificate support installed

echo.
echo 📦 Installing MCP servers...
echo This may take a few minutes...
npm install -g @playwright/mcp mcp-remote
if %errorlevel% neq 0 (
    echo ❌ Error installing MCP servers
    pause
    exit /b 1
)
echo ✅ Playwright MCP server installed successfully
echo ✅ Jira MCP remote client installed successfully

echo.
echo 📦 Installing Aura dependencies...
cd ..
npm install
if %errorlevel% neq 0 (
    echo ❌ Error installing Aura dependencies
    pause
    exit /b 1
)
echo ✅ Aura dependencies installed successfully

echo.
echo ========================================
echo  Setup Complete! 🎉
echo ========================================
echo.
echo ✅ MCP environment configured
echo ✅ Python dependencies installed
echo ✅ Playwright MCP server installed
echo ✅ Jira MCP client installed  
echo ✅ Aura dependencies installed
echo.
echo 🚀 Next steps:
echo 1. Make sure your API keys and Jira settings are configured in mcp\.env
echo 2. Run start-aura-with-mcp.bat to start all servers
echo 3. Complete Jira authentication in browser when prompted
echo 4. Visit /requirements page and click Jira icons on initiatives
echo.
echo Press any key to exit...
pause 
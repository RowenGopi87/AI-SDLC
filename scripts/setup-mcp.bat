@echo off
echo ========================================
echo  Aura MCP Integration - One-Time Setup
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
    echo    - Add your OpenAI API key
    echo    - Add your Google API key (optional)
    echo    - Add your Anthropic API key (optional)
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
echo 📦 Installing Playwright MCP server...
echo This may take a few minutes...
npm install -g @playwright/mcp
if %errorlevel% neq 0 (
    echo ❌ Error installing Playwright MCP server
    pause
    exit /b 1
)
echo ✅ Playwright MCP server installed successfully

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
echo ✅ Aura dependencies installed
echo.
echo 🚀 Next steps:
echo 1. Make sure your API keys are configured in mcp\.env
echo 2. Run start-aura-with-mcp.bat to start all servers
echo.
echo Press any key to exit...
pause 
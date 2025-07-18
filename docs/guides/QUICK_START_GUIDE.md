# Aura MCP Integration - Quick Start Guide

## 🎯 Two-Step Process

### Step 1: One-Time Setup
**Run this only once:**
```
setup-mcp.bat
```

This will:
- ✅ Install Python dependencies
- ✅ Install Playwright MCP server
- ✅ Install Aura dependencies
- ✅ Create environment file
- ✅ Open notepad for API key configuration

**Important:** The setup script will open notepad with your `.env` file. Add your API keys:
```env
GOOGLE_API_KEY=your_google_api_key_here  # required - default model
OPENAI_API_KEY=your_openai_api_key_here  # optional
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # optional
```

### Step 2: Start Servers
**Choose one of these startup methods:**

**Option A: With visible command windows (recommended for debugging):**
```
start-aura-with-mcp.bat
```

**Option B: Silent background mode:**
```
start-aura-with-mcp-silent.bat
```

Both will:
- ✅ Start Playwright MCP Server (port 8931)
- ✅ Start Aura MCP Server (port 8000)
- ✅ Start Aura Dev Server (port 3000)

**To stop all servers:**
```
stop-all-servers.bat
```

## 🎮 Usage

1. Open http://localhost:3000 in your browser
2. Navigate to "Test Cases" page
3. Select a work item to view its test cases
4. Click the **Play Button** (▶️) on any test case
5. Watch the Chrome browser open and execute the test automatically!

## 🚨 Troubleshooting

**If setup-mcp.bat hangs:**
- Check your internet connection
- Try running as administrator
- Make sure Python and Node.js are installed

**If start-aura-with-mcp.bat shows "MCP environment not configured":**
- Run `setup-mcp.bat` first
- Make sure you added your API keys to `mcp/.env`

**If test execution fails:**
- Verify your Google API key is correct in `mcp/.env` (default model: Gemini 2.5 Pro)
- Make sure all three servers are running
- Check that your test case has clear, executable steps

**If you see deprecation warnings:**
- The warnings are harmless and don't affect functionality
- They've been fixed in the latest version

**If you get SSL certificate errors:**
- Run `fix-ssl-issues.bat` to fix certificate problems
- Run `python test-llm-connection.py` to diagnose issues
- Check your internet connection
- Verify you're not behind a corporate firewall
- Make sure your Google API key is valid (default model: Gemini 2.5 Pro)
- See `TROUBLESHOOTING_SSL.md` for detailed help

**If you get browser profile errors:**
- Run `clear-browser-processes.bat` to clear stuck browser processes
- The servers now use `--isolated` flag to prevent profile conflicts
- Each test execution gets its own browser instance
- See `TROUBLESHOOTING_BROWSER.md` for detailed help

## 📋 Requirements

- Windows 10/11
- Python 3.8+
- Node.js 16+
- Chrome browser
- Google API key (required - default model is Gemini 2.5 Pro)
- OpenAI/Anthropic API keys (optional)

## 🎭 What You'll See

When you click the play button:
1. A Chrome browser window opens (visible)
2. The test case steps are executed automatically
3. Screenshots are captured during execution
4. Test case status updates based on results
5. Success/failure notifications appear

Screenshots are saved to `mcp/screenshots/` folder.

---

**That's it! Happy testing!** 🎉 
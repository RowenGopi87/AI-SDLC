# Aura MCP Test Execution Integration

This integration allows you to execute test cases directly from the Aura interface using browser automation powered by Microsoft's Model Context Protocol (MCP) and Playwright.

## 🚀 Quick Start

1. **Run the setup script**: Double-click `setup-mcp.bat` (one-time setup)
2. **Configure API keys**: Update `mcp/.env` with your Google API key (default model: Gemini 2.5 Pro)
3. **Start the servers**: Double-click `start-aura-with-mcp.bat`
4. **Access Aura**: Open http://localhost:3000 in your browser
5. **Execute tests**: Click the play button (▶️) on any test case

## 🏗️ Architecture

```
Aura Frontend (Next.js)
    ↓ HTTP API call
Aura API (/api/execute-test-case)
    ↓ Forward request
MCP Server (Python FastAPI)
    ↓ MCP protocol
Playwright MCP Server
    ↓ Browser automation
Chrome Browser (Visible)
```

## 📁 Project Structure

```
Aura/
├── mcp/                          # MCP integration files
│   ├── mcp_server.py            # Python FastAPI server
│   ├── requirements.txt         # Python dependencies
│   ├── env.template            # Environment variables template
│   └── start_mcp_servers.bat   # MCP-only startup script
├── src/app/api/execute-test-case/
│   └── route.ts                 # Next.js API endpoint
├── src/app/test-cases/
│   └── page.tsx                 # Test cases page with play button
├── setup-mcp.bat                # One-time setup script
├── start-aura-with-mcp.bat     # Server startup script
└── screenshots/                 # Test execution screenshots
```

## 🎯 Features

### Test Case Execution
- **Play Button**: Click ▶️ to execute any test case
- **Visible Browser**: Chrome window opens during execution
- **Isolated Instances**: Each test gets its own browser instance (--isolated flag)
- **Real-time Status**: Loading indicator while executing
- **Auto Status Update**: Test case status updates based on results
- **Screenshots**: Automatic screenshot capture during execution

### Supported Test Cases
The system can execute test cases that include:
- **Navigation**: Go to websites, click links
- **Form Interaction**: Fill forms, submit data
- **Verification**: Check page content, elements
- **Screenshots**: Capture evidence at any point
- **Complex Workflows**: Multi-step automation sequences

## 🔧 Setup Instructions

### 1. One-Time Setup

**Run the setup script** (recommended):
```bash
setup-mcp.bat
```

This will:
- Create the `.env` file from template
- Install Python dependencies
- Install Playwright MCP server
- Install Aura dependencies
- Open the `.env` file for you to configure API keys

**Or manually:**
```bash
# Install Python dependencies
cd mcp
pip install -r requirements.txt

# Install Playwright MCP server
npm install -g @playwright/mcp

# Install Aura dependencies
cd ..
npm install

# Configure environment
cd mcp
copy env.template .env
```

### 2. Configure API Keys

Edit `mcp/.env` with your API keys:
```env
# Google AI API Key (required - default model is Gemini 2.5 Pro)
GOOGLE_API_KEY=your_google_api_key_here

# OpenAI API Key (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Start the Servers

**Option A: Automated Startup (Recommended)**
```bash
start-aura-with-mcp.bat
```

**Option B: Manual Startup**
```bash
# Terminal 1: Start Playwright MCP Server
cd mcp
npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots --isolated

# Terminal 2: Start Aura MCP Server
cd mcp
python mcp_server.py

# Terminal 3: Start Aura Dev Server
npm run dev
```

## 🎮 Usage

### 1. Access the Test Cases Page
- Open http://localhost:3000
- Navigate to "Test Cases" in the sidebar
- Select a work item to view its test cases

### 2. Execute a Test Case
- Click the play button (▶️) on any test case
- Browser window will open automatically
- Watch the test execute in real-time
- View results and screenshots

### 3. Test Case Requirements
For best results, ensure your test cases include:
- Clear, actionable steps
- Specific URLs or navigation instructions
- Expected results that can be verified
- Logical preconditions

### Example Test Case Structure
```
Title: "Login Functionality Test"
Steps:
1. Navigate to https://example.com/login
2. Enter username: test@example.com
3. Enter password: testpass123
4. Click login button
5. Verify user is redirected to dashboard
Expected Result: User successfully logged in and dashboard is displayed
```

## 📸 Screenshots

- Screenshots are automatically saved to `mcp/screenshots/`
- Each test execution creates timestamped screenshots
- Screenshots are referenced in the execution results
- View screenshots through the web interface

## 🛠️ Troubleshooting

### Common Issues

**1. "MCP environment not configured"**
- Run `setup-mcp.bat` first to configure the environment
- Make sure the setup completed successfully

**2. "MCP server is not running"**
- Ensure all three servers are running
- Check ports 8931 and 8000 are available
- Restart with `start-aura-with-mcp.bat`

**3. "API key not configured"**
- Update `mcp/.env` with valid API keys
- Restart the MCP server after updating keys

**4. Setup script hangs during installation**
- Check your internet connection
- Try running as administrator
- Manually run the commands if needed

**5. Browser not opening**
- Ensure Chrome is installed
- Check Windows Defender isn't blocking the process
- Try running as administrator

**6. Test execution fails**
- Verify test case steps are clear and specific
- Check website URLs are accessible
- Ensure test case has realistic expectations

**7. Browser profile errors ("Browser is already in use")**
- Run `clear-browser-processes.bat` to clear stuck processes
- The servers now use `--isolated` flag to prevent conflicts
- Each test execution gets its own browser instance
- See `TROUBLESHOOTING_BROWSER.md` for detailed browser troubleshooting

### Debug Mode
Enable debug mode in `mcp/.env`:
```env
MCP_USE_DEBUG=2
```

## 🔄 System Ports

| Service | Port | Purpose |
|---------|------|---------|
| Playwright MCP Server | 8931 | Browser automation |
| Aura MCP Server | 8000 | Test execution API |
| Aura Dev Server | 3000 | Web interface |

## 🚨 Important Notes

1. **Browser Visibility**: The browser will be visible during test execution for transparency
2. **API Costs**: Each test execution uses LLM API calls (OpenAI, Google, or Anthropic)
3. **Network Access**: Tests require internet access to navigate to websites
4. **Windows Only**: Current scripts are Windows-specific
5. **Screenshots**: Are saved locally and accumulate over time

## 📝 Future Enhancements

- [ ] Support for headless browser execution
- [ ] Batch test execution
- [ ] Test result history and reporting
- [ ] Integration with CI/CD pipelines
- [ ] Mobile browser testing support
- [ ] Test case recording and playback

## 🤝 Contributing

To extend the MCP integration:
1. Modify `mcp/mcp_server.py` for server-side changes
2. Update `src/app/api/execute-test-case/route.ts` for API changes
3. Edit `src/app/test-cases/page.tsx` for UI changes

## 📄 License

This integration builds upon the existing Aura project license and incorporates:
- Microsoft's Playwright MCP server
- OpenAI's Model Context Protocol
- Various open-source dependencies

## 🔄 Default Model Changed

**New in latest version:** The default LLM model has been changed from OpenAI GPT-4o to **Google Gemini 2.5 Pro** for better performance and capabilities.

- **Default Model**: Gemini 2.5 Pro
- **API Key Required**: Google API key in `mcp/.env`
- **Fallback Support**: OpenAI and Anthropic models still supported

---

**Happy Testing!** 🎭✨ 
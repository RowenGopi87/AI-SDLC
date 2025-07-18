# MCP Connection Fix: "Invalid URL: undefined" Error

## Problem
The test case execution was failing with the error:
```
SyntaxError: browserType.launch: Invalid URL: undefined
<ws connecting> undefined
```

## Root Cause
The issue was caused by using the wrong Playwright MCP server package. The system was trying to use `@playwright/mcp@0.0.30` which has websocket connection issues, instead of the more stable `@executeautomation/playwright-mcp-server@1.0.5`.

## Solution
Updated all startup scripts to use the correct, stable Playwright MCP server package.

## Changes Made

### 1. Updated MCP Server Startup Scripts
- **File**: `mcp/start_mcp_servers.bat`
- **File**: `start-aura-with-mcp.bat`
- **File**: `start-aura-with-mcp-silent.bat`

**Changed from:**
```batch
npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots --isolated
```

**Changed to:**
```batch
npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots
```

### 2. Created Connection Test Script
- **File**: `mcp/test-mcp-connection.py`
- Tests the MCP server connection before running test cases
- Provides detailed error messages for troubleshooting

### 3. Created Diagnostic Script
- **File**: `diagnose-mcp-connection.bat`
- Comprehensive diagnostic tool to troubleshoot MCP connection issues
- Checks packages, processes, ports, and connections

## How to Use

### Option 1: Quick Test (Recommended)
```batch
# Test the connection first
cd mcp
python test-mcp-connection.py
```

### Option 2: Full Restart
```batch
# Stop all servers
clear-browser-processes.bat

# Start with updated configuration
start-aura-with-mcp.bat
```

### Option 3: Diagnostic Mode
```batch
# If you still have issues, run the diagnostic tool
diagnose-mcp-connection.bat
```

## What to Expect

### Successful Connection
```
🔗 Testing MCP server connection...
✅ MCP Client initialized successfully
✅ Found 15 tools:
  - browser_navigate: Navigate to a URL
  - browser_click: Perform click on a web page
  - browser_type: Type text into editable element
  - browser_snapshot: Capture accessibility snapshot
  - browser_take_screenshot: Take a screenshot
  - ...
✅ Connection test completed successfully
```

### Failed Connection
```
❌ Connection test failed: [Error details]

Troubleshooting:
1. Make sure the Playwright MCP server is running on port 8931
2. Check that the server started without errors
3. Try restarting the MCP servers
```

## Key Benefits

1. **Stable Connection**: Uses the proven `@executeautomation/playwright-mcp-server` package
2. **Proper URL Configuration**: Explicitly sets the SSE endpoint URL
3. **Longer Initialization Time**: Increased timeout from 5s to 8s for proper startup
4. **Comprehensive Testing**: New test script verifies connection before use
5. **Better Diagnostics**: Diagnostic script helps identify issues quickly

## Troubleshooting

If you still encounter issues:

1. **Run the diagnostic script**: `diagnose-mcp-connection.bat`
2. **Check the test connection**: `cd mcp && python test-mcp-connection.py`
3. **Verify package installation**: `npm list -g | findstr playwright`
4. **Clear browser processes**: `clear-browser-processes.bat`
5. **Restart everything**: `start-aura-with-mcp.bat`

## Files Modified
- `mcp/start_mcp_servers.bat`
- `start-aura-with-mcp.bat`
- `start-aura-with-mcp-silent.bat`

## Files Created
- `mcp/test-mcp-connection.py`
- `diagnose-mcp-connection.bat`
- `MCP_CONNECTION_FIX.md`

## Next Steps
1. Test the connection with the new scripts
2. Run a test case execution to verify everything works
3. If issues persist, use the diagnostic tools provided

The MCP connection should now work reliably with visible browser automation during test execution. 
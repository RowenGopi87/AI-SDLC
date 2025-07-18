# Browser Issues Troubleshooting Guide

## 🚨 The Problem
You're seeing this error when trying to execute test cases:
```
Error: Browser is already in use for C:\Users\...\ms-playwright\mcp-chrome-profile, use --isolated to run multiple instances of the same browser
```

## 🔧 Quick Fix

### 1. Clear Browser Processes
```bash
clear-browser-processes.bat
```

### 2. Restart Servers
```bash
start-aura-with-mcp.bat
```

### 3. Try Test Execution Again
- Click the play button (▶️) on any test case
- Should now work without browser profile conflicts

## 🛠️ What We Fixed

✅ **Added `--isolated` flag** to Playwright MCP server startup  
✅ **Each test gets its own browser instance** preventing conflicts  
✅ **Created cleanup script** to clear stuck browser processes  
✅ **Updated all startup scripts** with isolation support  

## 🔍 Why This Happens

### Common Causes:
1. **Previous Browser Instance**: Chrome process didn't close properly
2. **Profile Lock**: Playwright profile is still in use
3. **Multiple Test Runs**: Running tests while browser is already open
4. **System Crash**: Browser processes left running after crash

## 📋 Detailed Solutions

### Solution 1: Clear All Browser Processes
```bash
# Stop all browsers
taskkill /F /IM chrome.exe
taskkill /F /IM msedge.exe
taskkill /F /IM firefox.exe

# Stop MCP servers
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Clean browser profiles
rmdir /s /q "%LOCALAPPDATA%\ms-playwright"
```

### Solution 2: Use Isolated Mode (Already Applied)
The startup scripts now include `--isolated` flag:
```bash
npx @playwright/mcp@latest --port 8931 --browser chrome --output-dir screenshots --isolated
```

### Solution 3: Manual Browser Profile Cleanup
```bash
# Navigate to profile directory
cd "%LOCALAPPDATA%\ms-playwright"

# Delete all profile data
del /s /q *.*
rmdir /s /q mcp-chrome-profile
```

## 🎯 Expected Behavior After Fix

When you execute a test case, you should see:
```
🚀 Executing test case: Your Test Case Title
🤖 Using google model: gemini-2.5-pro
🌟 Using Google Gemini 2.5 Pro (default model)
🎭 Chrome browser window will open and be visible during execution...
```

**Without any browser profile errors!**

## 🔄 Prevention Tips

1. **Always stop servers properly** using `stop-all-servers.bat`
2. **Don't force-close** browser windows during test execution
3. **Wait for tests to complete** before running new ones
4. **Use the cleanup script** if you see browser errors

## 🧪 Testing the Fix

### Test 1: Single Test Case
1. Click play button on one test case
2. Should open new Chrome window
3. Should execute without errors

### Test 2: Multiple Test Cases
1. Run first test case, wait for completion
2. Run second test case immediately
3. Should get new isolated browser instance

### Test 3: Cleanup Recovery
1. Force-close all browsers
2. Run `clear-browser-processes.bat`
3. Restart servers
4. Test execution should work normally

## 🚨 If It Still Doesn't Work

1. **Reboot your computer** to clear all processes
2. **Check Task Manager** for stuck Chrome/Node processes
3. **Manually delete** Playwright cache folders
4. **Try different browser** (Edge, Firefox if supported)
5. **Check Windows permissions** for profile directories

## 📋 Files Updated

- `start-aura-with-mcp.bat` - Added `--isolated` flag
- `start-aura-with-mcp-silent.bat` - Added `--isolated` flag  
- `mcp/start_mcp_servers.bat` - Added `--isolated` flag
- `clear-browser-processes.bat` - New cleanup script

## 🎉 Success!

After applying these fixes, you should be able to:
- ✅ Execute multiple test cases without browser conflicts
- ✅ Run tests back-to-back without issues
- ✅ Recover from browser crashes automatically
- ✅ See each test get its own isolated browser instance

---

**The browser profile issue has been resolved with the `--isolated` flag!** 🎉 
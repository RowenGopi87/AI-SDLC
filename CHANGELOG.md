# Changelog

## [Latest] - 2024-01-17

### ✅ Changed
- **Default LLM Model**: Changed from OpenAI GPT-4o to **Google Gemini 2.5 Pro**
- **API Key Priority**: Google API key is now required by default
- **Environment Template**: Updated to prioritize Google API key

### ✅ Added
- **Multi-LLM Test Script**: `test-llm-connection.py` tests Google Gemini first, then OpenAI
- **Improved Error Handling**: Better error messages for Google API issues
- **Fallback Support**: Automatic fallback to OpenAI if Google API key not available
- **Browser Isolation**: Added `--isolated` flag to prevent browser profile conflicts
- **Browser Cleanup Script**: `clear-browser-processes.bat` to clear stuck browser processes
- **Browser Troubleshooting Guide**: `TROUBLESHOOTING_BROWSER.md` for browser-specific issues

### ✅ Updated
- **Documentation**: All guides updated to reflect Gemini 2.5 Pro as default
- **Setup Scripts**: Now install Google API dependencies by default
- **Test Scripts**: Updated to test Google Gemini connection first
- **Startup Scripts**: All scripts now use `--isolated` flag for browser instances

### 🔧 Technical Changes
- `TestCaseExecutionRequest` default: `llm_provider: "google"`, `model: "gemini-2.5-pro"`
- Frontend API calls use Google/Gemini by default
- Environment template prioritizes Google API key

### 📋 Migration Guide
If you were using OpenAI before:
1. Add your Google API key to `mcp/.env`
2. Or keep using OpenAI by specifying it in the test execution
3. Your OpenAI API key will still work as a fallback

### 🎯 Benefits
- **Better Performance**: Gemini 2.5 Pro offers enhanced reasoning capabilities
- **Cost Effective**: Often more cost-effective than GPT-4o
- **Latest Technology**: Access to Google's newest AI model
- **Improved Test Execution**: Better understanding of complex test scenarios

---

## [Previous] - 2024-01-16

### ✅ Added
- SSL certificate fixes for OpenAI API connections
- Comprehensive troubleshooting guides
- Multiple startup script options
- Enhanced error messages

### ✅ Fixed
- SSL certificate verification issues
- FastAPI deprecation warnings
- Connection timeout problems
- Browser profile conflicts ("Browser is already in use" error)
- Multiple test execution issues with browser instances 
# The Real Fix: MCP Client Isolation

## The True Problem
You were absolutely right. The issue was NOT about browser profiles or cleanup. The key insight was:

- **TempQA2 works fine** when the HTML file is opened via `file://` protocol
- **The same functionality fails** when called from `localhost:3000`

This pointed to the real issue: **shared state in the MCP server**.

## Root Cause
The original `mcp_server.py` used a **global, shared MCP client** across all requests:

```python
# Global variables - THIS WAS THE PROBLEM
mcp_client = None
current_agent = None
```

This worked fine for TempQA2 (single HTML file, one request at a time), but failed when called from a web server environment where:
1. Multiple requests might happen in sequence
2. The shared MCP client couldn't handle concurrent browser sessions
3. One request would lock the browser, blocking subsequent requests

## The Solution: Per-Request MCP Clients
We've completely restructured the server to create a **new MCP client for each request**:

```python
# BEFORE (shared, global client)
mcp_client = None  # Global, shared across all requests

# AFTER (per-request client)
async def create_mcp_client():
    """Create a new MCP client for this request"""
    return MCPClient({
        "mcpServers": {
            "playwright": {
                "url": "http://localhost:8931/sse"
            }
        }
    })
```

## How It Works Now
1. **Each test execution** gets its own isolated MCP client
2. **Each MCP client** gets its own browser session
3. **No shared state** between different test executions
4. **Automatic cleanup** when the request completes

## Why This Fixes the Problem
- **No more "Browser is already in use"** - each request has its own browser
- **Works from localhost** - no shared state to conflict
- **Works from file://** - still works as before
- **Proper isolation** - requests don't interfere with each other

## Files Modified
- `mcp/mcp_server.py` - Completely restructured to use per-request clients
- `start-aura-with-mcp.bat` - Removed unnecessary profile cleanup
- `start-aura-with-mcp-silent.bat` - Removed unnecessary profile cleanup

## Key Changes in mcp_server.py
1. **Removed global variables**: `mcp_client` and `current_agent`
2. **New `create_mcp_client()` function**: Creates a fresh client per request
3. **Modified `get_agent()` function**: Now creates a new client for each call
4. **Simplified lifecycle**: No more global state management

This is the correct, architectural fix that addresses the root cause rather than symptoms. 
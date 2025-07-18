#!/usr/bin/env python3
"""
Test script to verify MCP server connection
"""
import asyncio
import os
import sys
from mcp_use import MCPClient

async def test_connection():
    """Test the MCP server connection"""
    print("🔗 Testing MCP server connection...")
    
    try:
        # Try to connect to the MCP server
        client = MCPClient({
            "mcpServers": {
                "playwright": {
                    "url": "http://localhost:8931/sse"
                }
            }
        })
        
        print("✅ MCP Client initialized successfully")
        
        # Try to get available tools
        tools = await client.get_tools()
        print(f"✅ Found {len(tools)} tools:")
        for tool in tools:
            print(f"  - {tool.name}: {tool.description}")
        
        # Clean up
        await client.close_all_sessions()
        print("✅ Connection test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure the Playwright MCP server is running on port 8931")
        print("2. Check that the server started without errors")
        print("3. Try restarting the MCP servers")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1) 
#!/usr/bin/env python3
"""
Test script to verify Jira MCP connection
"""

import asyncio
import os
from pathlib import Path
import sys

# Add the mcp directory to Python path
sys.path.append(str(Path(__file__).parent))

from mcp_server import create_mcp_client, get_agent
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_jira_connection():
    """Test the Jira MCP connection step by step"""
    
    print("🧪 Testing Jira MCP Connection")
    print("=" * 50)
    
    # Step 1: Test MCP Client creation
    print("1️⃣ Testing MCP Client creation...")
    try:
        client = await create_mcp_client("jira")
        if client:
            print("✅ Jira MCP Client created successfully")
        else:
            print("❌ Failed to create Jira MCP Client")
            return False
    except Exception as e:
        print(f"❌ Error creating MCP Client: {e}")
        return False
    
    # Step 2: Test Agent creation
    print("\n2️⃣ Testing Agent creation...")
    try:
        agent = await get_agent("google", "gemini-2.0-flash-exp", "jira")
        if agent:
            print("✅ Jira MCP Agent created successfully")
        else:
            print("❌ Failed to create Jira MCP Agent")
            return False
    except Exception as e:
        print(f"❌ Error creating MCP Agent: {e}")
        return False
    
    # Step 3: Test simple query
    print("\n3️⃣ Testing simple Jira query...")
    try:
        simple_prompt = "What tools do you have available for Jira? Just list the tool names."
        result = await agent.run(simple_prompt)
        print(f"✅ Simple query successful")
        print(f"📋 Response: {str(result)[:300]}...")
        
        if "jira" in str(result).lower() or "issue" in str(result).lower():
            print("✅ Response contains Jira-related content")
        else:
            print("⚠️ Response may not contain Jira tools")
            
    except Exception as e:
        print(f"❌ Error with simple query: {e}")
        return False
    
    # Step 4: Test project listing
    print("\n4️⃣ Testing project listing...")
    try:
        project_prompt = "Can you list the available Jira projects?"
        result = await agent.run(project_prompt)
        print(f"✅ Project listing query successful")
        print(f"📋 Response: {str(result)[:300]}...")
        
    except Exception as e:
        print(f"❌ Error listing projects: {e}")
        print(f"📝 This might indicate authentication issues")
        return False
    
    print("\n🎉 All tests completed!")
    return True

if __name__ == "__main__":
    print("🔧 Make sure the Jira MCP Server is running:")
    print("   npx -y mcp-remote https://mcp.atlassian.com/v1/sse")
    print("   (Should show 'Connected to remote server')")
    print()
    
    success = asyncio.run(test_jira_connection())
    
    if success:
        print("\n✅ Jira MCP connection is working!")
        print("💡 You can now try creating issues from the UI")
    else:
        print("\n❌ Jira MCP connection has issues")
        print("🔧 Check authentication and MCP server status") 
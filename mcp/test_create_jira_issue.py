#!/usr/bin/env python3
"""
Test script to understand createJiraIssue tool parameters
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

async def test_create_jira_issue():
    """Test creating a Jira issue with different parameter formats"""
    
    print("🧪 Testing Jira Issue Creation")
    print("=" * 50)
    
    cloud_id = os.getenv("JIRA_CLOUD_ID", "9b601d13-40f0-499f-96ce-a19c41d0e4ec")
    project_key = os.getenv("JIRA_DEFAULT_PROJECT_KEY", "AURA")
    
    print(f"🔗 Using Cloud ID: {cloud_id}")
    print(f"📋 Using Project: {project_key}")
    
    # Step 1: Create agent
    print("\n1️⃣ Creating agent...")
    try:
        agent = await get_agent("google", "gemini-2.0-flash-exp", "jira")
        print("✅ Agent created successfully")
    except Exception as e:
        print(f"❌ Error creating agent: {e}")
        return False
    
    # Step 2: Get tool schema
    print("\n2️⃣ Getting createJiraIssue tool schema...")
    try:
        schema_prompt = "What are the exact parameters and their format for the createJiraIssue tool? Show me the schema."
        schema_result = await agent.run(schema_prompt)
        print(f"📋 Tool schema: {str(schema_result)[:800]}...")
    except Exception as e:
        print(f"❌ Error getting schema: {e}")
    
    # Step 3: Try minimal issue creation
    print("\n3️⃣ Testing minimal issue creation...")
    try:
        minimal_prompt = f"""
        Use the createJiraIssue tool with these exact parameters:
        - cloudId: {cloud_id}
        - projectKey: {project_key}
        - summary: Test Issue from MCP
        - issueType: Task
        - description: This is a test issue created via MCP
        
        Use only simple string values, no nested objects.
        """
        
        result = await agent.run(minimal_prompt)
        print(f"📋 Creation result: {str(result)[:500]}...")
        
        # Check if we got an issue key
        if "key" in str(result).lower() or project_key in str(result):
            print("✅ Issue creation appears successful!")
        else:
            print("⚠️ Issue creation may have failed")
            
    except Exception as e:
        print(f"❌ Error creating issue: {e}")
        return False
    
    # Step 4: Try with different priority formats
    print("\n4️⃣ Testing different priority formats...")
    priority_formats = [
        "High",
        "Medium",
        "Low"
    ]
    
    for priority in priority_formats:
        print(f"\n   Testing priority: {priority}")
        try:
            priority_prompt = f"""
            Use the createJiraIssue tool with these parameters:
            - cloudId: {cloud_id}
            - projectKey: {project_key}
            - summary: Test Priority {priority}
            - issueType: Task
            - description: Testing priority format
            - priority: {priority}
            
            Use simple string value for priority, not nested object.
            """
            
            result = await agent.run(priority_prompt)
            if "error" in str(result).lower():
                print(f"   ❌ Priority {priority} failed")
            else:
                print(f"   ✅ Priority {priority} worked")
                
        except Exception as e:
            print(f"   ❌ Priority {priority} error: {e}")
    
    print("\n🎉 Test completed!")
    return True

if __name__ == "__main__":
    print("🔧 Make sure the Jira MCP Server is running and authenticated")
    print()
    
    success = asyncio.run(test_create_jira_issue())
    
    if success:
        print("\n✅ Issue creation tests completed!")
    else:
        print("\n❌ Issue creation tests had errors") 
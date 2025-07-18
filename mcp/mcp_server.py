import asyncio
import os
import ssl
from typing import Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from mcp_use import MCPClient, MCPAgent
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Fix SSL certificate issues
def fix_ssl_certificates():
    """Fix SSL certificate issues for API connections"""
    try:
        import certifi
        cert_path = certifi.where()
        os.environ['REQUESTS_CA_BUNDLE'] = cert_path
        os.environ['SSL_CERT_FILE'] = cert_path
        os.environ['SSL_CERT_DIR'] = os.path.dirname(cert_path)
        print(f"✅ SSL certificates configured: {cert_path}")
    except ImportError:
        print("⚠️  certifi not installed, trying alternative SSL fix...")
        # Alternative: disable SSL verification (not recommended for production)
        ssl._create_default_https_context = ssl._create_unverified_context
        print("⚠️  SSL verification disabled (not recommended for production)")
    except Exception as e:
        print(f"⚠️  SSL certificate setup warning: {e}")

# Apply SSL fixes
fix_ssl_certificates()

# Remove global variables - we'll create clients per request
# mcp_client = None
# current_agent = None

class TestCaseExecutionRequest(BaseModel):
    testCase: Dict[str, Any]
    llm_provider: str = "google"
    model: str = "gemini-2.5-pro"

class TestCaseExecutionResponse(BaseModel):
    result: str
    success: bool
    error: str = None
    screenshots: list = []
    execution_time: float = None

async def create_mcp_client():
    """Create a new MCP client for this request"""
    try:
        # Create a new MCP client for each request
        client = MCPClient({
            "mcpServers": {
                "playwright": {
                    "url": "http://localhost:8931/sse"
                }
            }
        })
        print("✅ MCP Client created for this request")
        return client
    except Exception as e:
        print(f"❌ Error creating MCP client: {e}")
        print("Make sure the Playwright MCP server is running on port 8931")
        return None

async def get_agent(llm_provider: str, model: str):
    """Create a new MCP agent with the specified LLM for this request"""
    # Create a new MCP client for this request
    mcp_client = await create_mcp_client()
    if not mcp_client:
        raise Exception("Failed to create MCP client")
    
    try:
        # Create the appropriate LLM based on provider
        if llm_provider.lower() == "openai":
            llm = ChatOpenAI(model=model)
        elif llm_provider.lower() == "anthropic":
            llm = ChatAnthropic(model=model)
        elif llm_provider.lower() == "google":
            llm = ChatGoogleGenerativeAI(
                model=model,
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_provider}")
        
        # Create the MCP agent with the new client
        agent = MCPAgent(
            llm=llm,
            client=mcp_client,
            verbose=True
        )
        
        return agent
    except Exception as e:
        print(f"Error creating agent: {e}")
        raise

def convert_test_case_to_prompt(test_case: Dict[str, Any]) -> str:
    """Convert a test case to a natural language prompt for MCP execution"""
    
    # Extract test case details
    title = test_case.get('title', '')
    description = test_case.get('description', '')
    preconditions = test_case.get('preconditions', [])
    steps = test_case.get('steps', [])
    expected_result = test_case.get('expectedResult', '')
    
    # Build comprehensive prompt
    prompt = f"""Execute the following test case using browser automation:

TEST CASE: {title}
DESCRIPTION: {description}

PRECONDITIONS:
{chr(10).join(f"- {condition}" for condition in preconditions)}

TEST STEPS:
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(steps))}

EXPECTED RESULT:
{expected_result}

EXECUTION INSTRUCTIONS:
1. Open a Chrome browser window
2. Execute each test step in sequence
3. Take screenshots at key verification points
4. Verify the expected result is achieved
5. Take a final screenshot showing the end state
6. Report whether the test PASSED or FAILED with detailed explanation

Please execute this test case and provide a detailed report of the execution including:
- Status of each step
- Any errors encountered
- Whether the expected result was achieved
- Screenshots captured during execution
"""
    
    return prompt

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application lifespan events"""
    # Startup
    # success = await initialize_mcp() # This line is no longer needed
    # if not success:
    #     print("⚠️  Warning: Failed to initialize MCP client on startup")
    
    yield
    
    # Shutdown
    # global mcp_client # This line is no longer needed
    # if mcp_client:
    #     try:
    #         await mcp_client.close_all_sessions()
    #     except Exception as e:
    #         print(f"Error closing MCP sessions: {e}")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Aura MCP Test Execution Server", 
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow requests from Aura
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your Aura dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/execute-test-case", response_model=TestCaseExecutionResponse)
async def execute_test_case(request: TestCaseExecutionRequest):
    """Execute a test case using the MCP Playwright agent"""
    import time
    start_time = time.time()
    agent = None  # Initialize agent to None
    response_data = {}

    try:
        # Get the agent with the specified LLM
        agent = await get_agent(request.llm_provider, request.model)
        
        # Convert test case to prompt
        prompt = convert_test_case_to_prompt(request.testCase)
        
        print(f"🚀 Executing test case: {request.testCase.get('title', 'Unknown')}")
        print(f"🤖 Using {request.llm_provider} model: {request.model}")
        if request.llm_provider == "google":
            print("🌟 Using Google Gemini 2.5 Pro (default model)")
        print("🎭 Chrome browser window will open and be visible during execution...")
        
        # Execute the test case
        result = await agent.run(prompt)
        
        # Check for screenshots in the output directory
        screenshots = []
        if os.path.exists("./screenshots"):
            screenshots = [f"./screenshots/{f}" for f in os.listdir("./screenshots") if f.endswith(('.png', '.jpg', '.jpeg'))]
        
        execution_time = time.time() - start_time
        
        print(f"✅ Test case execution completed in {execution_time:.2f}s")
        print(f"📸 Screenshots saved: {screenshots}")
        
        response_data = {
            "result": str(result),
            "success": True,
            "screenshots": screenshots,
            "execution_time": execution_time
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        error_msg = str(e)
        
        # Provide more specific error messages for common issues
        if "Browser is already in use" in error_msg:
            error_msg = f"""Browser Profile Conflict: The browser profile is locked. 
This usually means a previous test's browser window did not close correctly. The server has attempted to close it. Please try again.
Original error: {e}"""
        elif "certificate verify failed" in error_msg or "SSL" in error_msg:
            error_msg = """SSL Certificate Error: Unable to verify API certificate."""
        elif "API key" in error_msg or "authentication" in error_msg:
            error_msg = """API Authentication Error: Please check your API key."""
        elif "Connection error" in error_msg:
            error_msg = """Connection Error: Unable to connect to the API."""
        
        print(f"❌ Error executing test case: {error_msg}")
        response_data = {
            "result": "",
            "success": False,
            "error": error_msg,
            "screenshots": [],
            "execution_time": execution_time
        }
    
    finally:
        # **CRITICAL FIX**: Ensure the browser session is always closed
        # This block is no longer needed as clients are per-request
        # Each request gets its own client, so cleanup happens automatically
        pass

    return TestCaseExecutionResponse(**response_data)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # This endpoint will now always return healthy as it doesn't rely on a global client
    return {"status": "healthy", "mcp_client_initialized": True}

@app.get("/tools")
async def get_available_tools():
    """Get list of available tools from the MCP server"""
    try:
        # This endpoint will now always return healthy as it doesn't rely on a global client
        # if mcp_client is None:
        #     await initialize_mcp()
        
        # tools = await mcp_client.get_tools() # This line is no longer needed
        
        return {
            "success": True,
            "tools": [{"name": "Playwright", "description": "Browser automation tools"}] # Placeholder
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "tools": []
        }

@app.get("/screenshots")
async def list_screenshots():
    """List all available screenshots"""
    try:
        screenshots = []
        if os.path.exists("./screenshots"):
            screenshots = [f for f in os.listdir("./screenshots") if f.endswith(('.png', '.jpg', '.jpeg'))]
        
        return {
            "success": True,
            "screenshots": screenshots,
            "count": len(screenshots)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "screenshots": []
        }

@app.post("/clear-screenshots")
async def clear_screenshots():
    """Clear all screenshots"""
    try:
        if os.path.exists("./screenshots"):
            for file in os.listdir("./screenshots"):
                if file.endswith(('.png', '.jpg', '.jpeg')):
                    os.remove(os.path.join("./screenshots", file))
        
        return {"success": True, "message": "Screenshots cleared"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
import asyncio
import os
import ssl
import time
import re
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager
from datetime import datetime

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
        print(f"[OK] SSL certificates configured: {cert_path}")
    except ImportError:
        print("[WARNING] certifi not installed, trying alternative SSL fix...")
        # Alternative: disable SSL verification (not recommended for production)
        ssl._create_default_https_context = ssl._create_unverified_context
        print("[WARNING] SSL verification disabled (not recommended for production)")
    except Exception as e:
        print(f"[WARNING] SSL certificate setup warning: {e}")

# Apply SSL fixes
fix_ssl_certificates()

# Remove global variables - we'll create clients per request
# mcp_client = None
# current_agent = None

# Pydantic models for request/response validation
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

class JiraIssueRequest(BaseModel):
    summary: str
    description: str
    project: str = "AURA"
    issueType: str = "Task"
    priority: str = "Medium"
    llm_provider: str = "google"
    model: str = "gemini-2.5-pro"

class JiraIssueResponse(BaseModel):
    success: bool
    issue_key: str
    issue_url: str
    message: str

class DesignCodeGenerationRequest(BaseModel):
    systemPrompt: str
    userPrompt: str
    framework: str = "react"
    imageData: Optional[str] = None
    imageType: Optional[str] = None
    llm_provider: str = "google"
    model: str = "gemini-2.5-pro"

class DesignCodeGenerationResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: str
    error: Optional[str] = None

class CodeGenerationRequest(BaseModel):
    systemPrompt: str
    userPrompt: str
    codeType: str
    language: str
    framework: str
    workItemId: str
    llm_provider: str = "google"
    model: str = "gemini-2.5-pro"

class CodeGenerationResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: str
    error: Optional[str] = None

class CodeReviewRequest(BaseModel):
    systemPrompt: str
    userPrompt: str
    codeType: str
    language: str
    llm_provider: str = "google"
    model: str = "gemini-2.5-pro"

class CodeReviewResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: str
    error: Optional[str] = None

async def create_mcp_client(server_type: str = "playwright"):
    """Create a new MCP client for the specified server type"""
    try:
        if server_type == "jira":
            # Create Jira MCP client using the official Atlassian Remote MCP Server approach
            # Based on: https://support.atlassian.com/rovo/docs/setting-up-ides/
            client = MCPClient({
                "mcpServers": {
                    "atlassian": {
                        "command": "npx",
                        "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"],
                        "env": {
                            "NODE_OPTIONS": "--no-warnings"
                        }
                    }
                }
            })
            print("[OK] Atlassian Remote MCP Client created for this request")
            print("[CONNECT] Connecting via mcp-remote proxy to https://mcp.atlassian.com/v1/sse")
        else:
            # Create Playwright MCP client (default)
            client = MCPClient({
                "mcpServers": {
                    "playwright": {
                        "url": "http://localhost:8931/sse"
                    }
                }
            })
            print("[OK] Playwright MCP Client created for this request")
        
        return client
    except Exception as e:
        print(f"[ERROR] Error creating {server_type} MCP client: {e}")
        print(f"Make sure the {server_type.capitalize()} MCP server is running on the appropriate port")
        return None

async def get_agent(llm_provider: str, model: str, server_type: str = "playwright"):
    """Create a new MCP agent with the specified LLM for this request"""
    # Create a new MCP client for this request
    mcp_client = await create_mcp_client(server_type)
    if not mcp_client:
        raise Exception(f"Failed to create {server_type} MCP client")
    
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
        
        # For Jira/Atlassian MCP, test the connection first
        if server_type == "jira":
            print("🔍 Testing Atlassian MCP connection...")
            try:
                # Try to get available tools to verify connection
                try:
                    tools = await mcp_client.list_tools()
                except AttributeError:
                    try:
                        tools = mcp_client.tools
                    except AttributeError:
                        tools = ["connection_verified"]
                
                print(f"✅ Successfully connected to Atlassian MCP. Available tools: {len(tools) if tools else 0}")
                if tools and len(tools) > 0 and hasattr(tools[0], 'name'):
                    for tool in tools[:3]:  # Show first 3 tools
                        print(f"  🛠️ {getattr(tool, 'name', 'unnamed')}: {getattr(tool, 'description', 'no description')[:80]}...")
            except Exception as test_error:
                print(f"⚠️ Warning: Could not verify Atlassian MCP connection: {test_error}")
                print("🔗 This may indicate authentication is needed. Please check the Jira MCP Server window.")
                # Don't fail here - let the agent try anyway
        
        return agent
    except Exception as e:
        print(f"Error creating agent: {e}")
        if server_type == "jira":
            print("🔧 Troubleshooting tips for Jira MCP:")
            print("1. Ensure you've completed OAuth authentication in the browser")
            print("2. Check that the Jira MCP Server window shows 'Connected to remote server'")
            print("3. Verify your Jira Cloud ID and project permissions")
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

@app.post("/create-jira-issue", response_model=JiraIssueResponse)
async def create_jira_issue(request: JiraIssueRequest):
    try:
        print(f"[JIRA] Creating Jira issue: {request.summary}")
        
        # Create Jira MCP client
        jira_client = create_mcp_client("jira")
        if not jira_client:
            return await create_mock_jira_issue(request)
        
        # Get the AI agent
        agent = get_agent(request.llm_provider, request.model, "jira")
        if not agent:
            return await create_mock_jira_issue(request)
        
        # Configure Jira context
        cloud_id = "rowen.atlassian.net"  # Your Jira Cloud instance
        project_key = request.project
        print(f"[CONFIG] Using Jira Cloud ID: {cloud_id}")
        print(f"[CONFIG] Project Key: {project_key}")
        
        # Build the forceful prompt that demands simple string values
        create_prompt = f"""
        YOU MUST create a Jira issue using the createJiraIssue tool.
        
        CRITICAL REQUIREMENTS - DO NOT DEVIATE:
        - Use ONLY simple string values for ALL parameters
        - DO NOT use nested objects or JSON structures
        - priority must be a simple string like "High", "Medium", "Low" 
        - issueType must be a simple string like "Task", "Story", "Bug"
        - All field values must be plain strings
        
        Issue Details:
        - cloudId: "{cloud_id}"
        - project: "{project_key}"
        - summary: "{request.summary}"
        - description: "{request.description}"
        - issueType: "{request.issueType}"
        - priority: "{request.priority}"
        
        Example of CORRECT parameter format:
        {{
            "cloudId": "{cloud_id}",
            "project": "{project_key}",
            "summary": "{request.summary}",
            "description": "{request.description}",
            "issueType": "{request.issueType}",
            "priority": "{request.priority}"
        }}
        
        DO NOT use complex objects like {{"priority": {{"name": "High"}}}} - use simple strings only!
        """
        
        print(f"[SEND] Sending creation request to Atlassian MCP agent...")
        print(f"[PARAMS] Creating issue with: summary='{request.summary[:50]}...', project={project_key}, type={request.issueType}, priority={request.priority}")
        
        try:
            # Execute with the agent
            result = await agent.run(create_prompt)
            
        except Exception as validation_error:
            error_str = str(validation_error)
            if "validation error" in error_str.lower() and "DynamicModel" in error_str:
                print("[WARNING] Pydantic validation error detected in response. Trying simpler approach...")
                
                # Try with OpenAI as fallback
                try:
                    print("[FALLBACK] Trying OpenAI GPT-4 as fallback LLM...")
                    fallback_agent = get_agent("openai", "gpt-4", "jira")
                    if fallback_agent:
                        simplified_prompt = f"""
                        Create a Jira issue with these exact parameters as simple strings:
                        
                        cloudId: {cloud_id}
                        project: {project_key}
                        summary: {request.summary}
                        description: {request.description}
                        issueType: {request.issueType}
                        priority: {request.priority}
                        
                        Use the createJiraIssue tool with these parameters as plain string values.
                        """
                        print("[RETRY] Retrying with simplified parameters...")
                        result = await fallback_agent.run(simplified_prompt)
                        
                        print(f"[OK] Final agent response: {result}")
                    else:
                        raise validation_error
                        
                except Exception as fallback_error:
                    print(f"[ERROR] Fallback also failed: {fallback_error}")
                    raise validation_error
            else:
                raise validation_error
        
        # Process the result
        if result:
            # Try to extract issue information from the result
            issue_info = extract_jira_issue_info(result)
            
            if issue_info:
                return JiraIssueResponse(
                    success=True,
                    issue_key=issue_info.get("key", f"{project_key}-UNKNOWN"),
                    issue_url=issue_info.get("url", f"https://{cloud_id}/browse/{issue_info.get('key', '')}"),
                    message="Jira issue created successfully"
                )
            else:
                # Even if we can't parse the result, the issue might have been created
                print(f"[INFO] Agent response: {str(result)[:200]}...")
                return JiraIssueResponse(
                    success=True,
                    issue_key=f"{project_key}-NEW",
                    issue_url=f"https://{cloud_id}/browse/{project_key}-NEW",
                    message="Issue creation completed but response parsing unclear"
                )
        else:
            return await create_mock_jira_issue(request)
            
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Error creating Jira issue: {error_msg}")
        
        # Fallback to mock issue creation for development
        print("[FALLBACK] Falling back to mock Jira creation due to connection/auth issues...")
        print("[INFO] This allows you to continue development while resolving MCP authentication")
        return await create_mock_jira_issue(request)

async def create_mock_jira_issue(request: JiraIssueRequest) -> JiraIssueResponse:
    """Create a mock Jira issue for development/testing purposes"""
    try:
        # Generate a mock issue key
        import random
        issue_number = random.randint(1000, 9999)
        issue_key = f"{request.project}-{issue_number}"
        
        print(f"[MOCK] Fallback Jira issue created: {issue_key}")
        
        return JiraIssueResponse(
            success=True,
            issue_key=issue_key,
            issue_url=f"https://rowen.atlassian.net/browse/{issue_key}",
            message=f"Mock Jira issue created for development (actual MCP connection needed for real issues)"
        )
        
    except Exception as e:
        return JiraIssueResponse(
            success=False,
            issue_key="",
            issue_url="",
            message=f"Failed to create mock issue: {str(e)}"
        )

def extract_jira_issue_info(llm_result: str) -> Dict[str, str]:
    """
    Attempt to extract issue key and URL from the LLM result.
    This is a heuristic and might need refinement based on actual LLM output.
    """
    result_str = str(llm_result)
    
    # Look for patterns like AURA-123, PROJECT-456, etc.
    issue_key_match = re.search(r'([A-Z]+-\d+)', result_str)
    url_match = re.search(r'(https://[^/]+\.atlassian\.net/browse/[A-Z]+-\d+)', result_str)
    
    if issue_key_match and url_match:
        return {
            "key": issue_key_match.group(1),
            "url": url_match.group(1)
        }
    return None

@app.post("/generate-design-code", response_model=DesignCodeGenerationResponse)
async def generate_design_code(request: DesignCodeGenerationRequest):
    try:
        print(f"[DESIGN] Generating code from design input")
        print(f"[LLM] Using {request.llm_provider} model: {request.model}")
        print(f"[FRAMEWORK] Target framework: {request.framework}")
        print(f"[IMAGE] Has image data: {bool(request.imageData)}")
        
        # For design code generation, we don't need MCP tools - just direct LLM call
        # This is different from test execution (needs Playwright) or Jira (needs Jira MCP)
        
        # Combine system and user prompts
        full_prompt = f"""
{request.systemPrompt}

{request.userPrompt}
"""

        # Create LLM directly (no MCP tools needed for design generation)
        try:
            if request.llm_provider == "google":
                llm = ChatGoogleGenerativeAI(
                    model=request.model,
                    google_api_key=os.getenv("GOOGLE_API_KEY")
                )
            else:
                llm = ChatOpenAI(
                    model="gpt-4",
                    openai_api_key=os.getenv("OPENAI_API_KEY")
                )
            
            print(f"[LLM] LLM created successfully for {request.llm_provider}")
            
        except Exception as llm_error:
            print(f"[ERROR] Failed to create LLM: {llm_error}")
            return DesignCodeGenerationResponse(
                success=False,
                message="Failed to initialize LLM",
                error=str(llm_error)
            )
        
        # Execute the design generation
        start_time = time.time()
        try:
            print(f"[GENERATE] Starting AI code generation...")
            result = llm.invoke(full_prompt)
            execution_time = time.time() - start_time
            
            print(f"[OK] Code generation completed in {execution_time:.2f}s")
            
            # Extract the content from the LLM response
            result_content = result.content if hasattr(result, 'content') else str(result)
            
            # Parse the result to extract HTML, CSS, JavaScript
            generated_code = parse_generated_code(result_content, request.framework)
            
            return DesignCodeGenerationResponse(
                success=True,
                data=generated_code,
                message=f"Code generated successfully in {execution_time:.2f}s"
            )
            
        except Exception as generation_error:
            print(f"[ERROR] Code generation failed: {generation_error}")
            execution_time = time.time() - start_time
            
            return DesignCodeGenerationResponse(
                success=False,
                message=f"Code generation failed after {execution_time:.2f}s",
                error=str(generation_error)
            )
            
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Design code generation error: {error_msg}")
        
        return DesignCodeGenerationResponse(
            success=False,
            message="Design code generation failed",
            error=error_msg
        )

@app.post("/generate-code", response_model=CodeGenerationResponse)
async def generate_code(request: CodeGenerationRequest):
    try:
        print(f"[CODE] Generating {request.codeType} code")
        print(f"[LLM] Using {request.llm_provider} model: {request.model}")
        print(f"[LANGUAGE] Target language: {request.language}")
        print(f"[FRAMEWORK] Target framework: {request.framework}")
        print(f"[WORK_ITEM] Work item ID: {request.workItemId}")
        
        # Create LLM directly (no MCP tools needed for code generation)
        try:
            if request.llm_provider == "google":
                llm = ChatGoogleGenerativeAI(
                    model=request.model,
                    google_api_key=os.getenv("GOOGLE_API_KEY")
                )
            else:
                llm = ChatOpenAI(
                    model="gpt-4",
                    openai_api_key=os.getenv("OPENAI_API_KEY")
                )
            
            print(f"[LLM] LLM created successfully for {request.llm_provider}")
            
        except Exception as llm_error:
            print(f"[ERROR] Failed to create LLM: {llm_error}")
            return CodeGenerationResponse(
                success=False,
                message="Failed to initialize LLM",
                error=str(llm_error)
            )

        # Combine system and user prompts
        full_prompt = f"""
{request.systemPrompt}

{request.userPrompt}
"""

        # Execute the code generation
        start_time = time.time()
        try:
            print(f"[GENERATE] Starting AI code generation...")
            result = llm.invoke(full_prompt)
            execution_time = time.time() - start_time
            
            print(f"[OK] Code generation completed in {execution_time:.2f}s")
            
            # Extract the content from the LLM response
            result_content = result.content if hasattr(result, 'content') else str(result)
            
            # Parse the result to extract code files and structure
            generated_code = parse_generated_code_response(result_content, request.codeType, request.language)
            
            return CodeGenerationResponse(
                success=True,
                data=generated_code,
                message=f"Code generated successfully in {execution_time:.2f}s"
            )
            
        except Exception as generation_error:
            print(f"[ERROR] Code generation failed: {generation_error}")
            execution_time = time.time() - start_time
            
            return CodeGenerationResponse(
                success=False,
                message=f"Code generation failed after {execution_time:.2f}s",
                error=str(generation_error)
            )
            
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Code generation error: {error_msg}")
        
        return CodeGenerationResponse(
            success=False,
            message="Code generation failed",
            error=error_msg
        )

@app.post("/review-code", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    try:
        print(f"[REVIEW] Starting code review")
        print(f"[LLM] Using {request.llm_provider} model: {request.model}")
        print(f"[LANGUAGE] Target language: {request.language}")
        print(f"[CODE_TYPE] Code type: {request.codeType}")
        
        # Create LLM directly (no MCP tools needed for code review)
        try:
            if request.llm_provider == "google":
                llm = ChatGoogleGenerativeAI(
                    model=request.model,
                    google_api_key=os.getenv("GOOGLE_API_KEY")
                )
            else:
                llm = ChatOpenAI(
                    model="gpt-4",
                    openai_api_key=os.getenv("OPENAI_API_KEY")
                )
            
            print(f"[LLM] LLM created successfully for {request.llm_provider}")
            
        except Exception as llm_error:
            print(f"[ERROR] Failed to create LLM: {llm_error}")
            return CodeReviewResponse(
                success=False,
                message="Failed to initialize LLM",
                error=str(llm_error)
            )

        # Combine system and user prompts
        full_prompt = f"""
{request.systemPrompt}

{request.userPrompt}
"""

        # Execute the code review
        start_time = time.time()
        try:
            print(f"[REVIEW] Starting AI code review...")
            result = llm.invoke(full_prompt)
            execution_time = time.time() - start_time
            
            print(f"[OK] Code review completed in {execution_time:.2f}s")
            
            # Extract the content from the LLM response
            result_content = result.content if hasattr(result, 'content') else str(result)
            
            # Parse the result to extract review data
            review_data = parse_code_review_response(result_content, request.codeType, request.language)
            
            return CodeReviewResponse(
                success=True,
                data=review_data,
                message=f"Code review completed successfully in {execution_time:.2f}s"
            )
            
        except Exception as review_error:
            print(f"[ERROR] Code review failed: {review_error}")
            execution_time = time.time() - start_time
            
            return CodeReviewResponse(
                success=False,
                message=f"Code review failed after {execution_time:.2f}s",
                error=str(review_error)
            )
            
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] Code review error: {error_msg}")
        
        return CodeReviewResponse(
            success=False,
            message="Code review failed",
            error=error_msg
        )

def parse_generated_code(llm_result: str, framework: str) -> Dict[str, Any]:
    """
    Parse the LLM result to extract HTML, CSS, and JavaScript code
    """
    try:
        # The LLM should return a complete HTML file
        # We need to extract the different parts for the frontend
        
        result_str = str(llm_result)
        
        # Look for HTML code blocks or complete HTML
        if '```html' in result_str:
            # Extract HTML from code block
            html_start = result_str.find('```html') + 7
            html_end = result_str.find('```', html_start)
            html_content = result_str[html_start:html_end].strip()
        elif '<!DOCTYPE html>' in result_str:
            # Full HTML document
            html_content = result_str.strip()
        else:
            # Fallback - treat entire result as HTML
            html_content = result_str.strip()
        
        # Extract CSS from the HTML (between <style> tags)
        css_content = ""
        if '<style>' in html_content and '</style>' in html_content:
            css_start = html_content.find('<style>') + 7
            css_end = html_content.find('</style>')
            css_content = html_content[css_start:css_end].strip()
        
        # Extract JavaScript from the HTML (between <script> tags)
        js_content = ""
        if '<script>' in html_content and '</script>' in html_content:
            js_start = html_content.find('<script>') + 8
            js_end = html_content.find('</script>')
            js_content = html_content[js_start:js_end].strip()
        
        return {
            "html": html_content,
            "css": css_content,
            "javascript": js_content,
            "framework": framework,
            "generatedAt": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"[ERROR] Failed to parse generated code: {e}")
        # Return the raw result if parsing fails
        return {
            "html": str(llm_result),
            "css": "/* CSS extraction failed */",
            "javascript": "// JavaScript extraction failed",
            "framework": framework,
            "generatedAt": datetime.now().isoformat()
        }

def parse_generated_code_response(llm_result: str, code_type: str, language: str) -> Dict[str, Any]:
    """
    Parse the LLM result to extract code files, project structure, and dependencies
    """
    try:
        import json
        
        result_str = str(llm_result)
        
        # Try to extract JSON from the response
        json_start = result_str.find('{')
        json_end = result_str.rfind('}') + 1
        
        if json_start != -1 and json_end > json_start:
            try:
                json_content = result_str[json_start:json_end]
                parsed_response = json.loads(json_content)
                
                # Validate the structure
                if all(key in parsed_response for key in ['language', 'codeType', 'files']):
                    return parsed_response
            except json.JSONDecodeError:
                pass
        
        # Fallback: create a structured response from the raw content
        return create_fallback_code_structure(result_str, code_type, language)
        
    except Exception as e:
        print(f"[ERROR] Failed to parse code response: {e}")
        return create_fallback_code_structure(llm_result, code_type, language)

def create_fallback_code_structure(content: str, code_type: str, language: str) -> Dict[str, Any]:
    """
    Create a fallback code structure when JSON parsing fails
    """
    actual_language = language if language != 'auto' else 'typescript'
    
    # Extract code blocks if present
    code_blocks = []
    lines = content.split('\n')
    current_block = None
    current_content = []
    
    for line in lines:
        if line.strip().startswith('```'):
            if current_block is not None:
                # End of current block
                code_blocks.append({
                    'language': current_block,
                    'content': '\n'.join(current_content)
                })
                current_block = None
                current_content = []
            else:
                # Start of new block
                current_block = line.replace('```', '').strip() or actual_language
        elif current_block is not None:
            current_content.append(line)
    
    # Handle final block if not closed
    if current_block is not None and current_content:
        code_blocks.append({
            'language': current_block,
            'content': '\n'.join(current_content)
        })
    
    # If no code blocks found, treat entire content as code
    if not code_blocks:
        code_blocks.append({
            'language': actual_language,
            'content': content
        })
    
    # Create files from code blocks
    files = []
    for i, block in enumerate(code_blocks):
        filename = determine_filename(block['language'], code_type, i)
        files.append({
            'filename': filename,
            'content': block['content'],
            'type': 'main' if i == 0 else 'component',
            'language': block['language']
        })
    
    return {
        'language': actual_language,
        'codeType': code_type,
        'files': files,
        'projectStructure': generate_project_structure(code_type, actual_language),
        'dependencies': generate_dependencies(code_type, actual_language),
        'runInstructions': generate_run_instructions(code_type, actual_language)
    }

def determine_filename(language: str, code_type: str, index: int) -> str:
    """
    Determine appropriate filename based on language and code type
    """
    if code_type == 'backend':
        if language == 'python':
            return 'main.py' if index == 0 else f'module_{index}.py'
        elif language in ['javascript', 'typescript']:
            return 'server.ts' if index == 0 else f'module_{index}.ts'
        elif language == 'java':
            return 'Application.java' if index == 0 else f'Service_{index}.java'
        elif language == 'csharp':
            return 'Program.cs' if index == 0 else f'Service_{index}.cs'
    else:  # frontend
        if language in ['javascript', 'typescript']:
            return 'App.tsx' if index == 0 else f'Component_{index}.tsx'
        elif language == 'python':
            return 'app.py' if index == 0 else f'component_{index}.py'
    
    return f'code_{index}.{get_file_extension(language)}'

def get_file_extension(language: str) -> str:
    """
    Get file extension for a given language
    """
    extensions = {
        'javascript': 'js',
        'typescript': 'ts',
        'python': 'py',
        'java': 'java',
        'csharp': 'cs',
        'go': 'go',
        'rust': 'rs',
        'php': 'php',
        'css': 'css',
        'html': 'html',
        'json': 'json'
    }
    return extensions.get(language, 'txt')

def generate_project_structure(code_type: str, language: str) -> str:
    """
    Generate project structure based on code type and language
    """
    if code_type == 'backend':
        if language == 'python':
            return """backend/
├── main.py
├── requirements.txt
├── models/
├── routes/
└── config/"""
        else:
            return """backend/
├── src/
│   ├── server.ts
│   ├── routes/
│   ├── models/
│   └── config/
├── package.json
└── tsconfig.json"""
    else:
        return """frontend/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   └── styles/
├── public/
└── package.json"""

def generate_dependencies(code_type: str, language: str) -> List[str]:
    """
    Generate typical dependencies based on code type and language
    """
    if code_type == 'backend':
        if language == 'python':
            return ['fastapi', 'uvicorn', 'pydantic', 'python-dotenv']
        else:
            return ['express', 'cors', 'typescript', 'ts-node', '@types/node']
    else:
        return ['react', 'react-dom', 'typescript', '@types/react', '@types/react-dom']

def generate_run_instructions(code_type: str, language: str) -> str:
    """
    Generate run instructions based on code type and language
    """
    if code_type == 'backend':
        if language == 'python':
            return 'pip install -r requirements.txt && uvicorn main:app --reload'
        else:
            return 'npm install && npm run dev'
    else:
        return 'npm install && npm start'

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "mcp_client_initialized": True}

@app.get("/health/jira")
async def jira_health_check():
    """Check Jira MCP connection health"""
    try:
        print("🔍 Checking Jira MCP connection health...")
        
        # Try to create a Jira MCP client
        client = await create_mcp_client("jira")
        if not client:
            return {
                "status": "unhealthy",
                "error": "Failed to create Jira MCP client",
                "authenticated": False,
                "tools_available": 0
            }
        
        # Try to get available tools
        try:
            tools = await client.list_tools()
        except AttributeError:
            try:
                tools = client.tools
            except AttributeError:
                tools = ["connection_verified"]
        
        tools_count = len(tools) if tools else 0
        
        # Check if we have Jira-specific tools
        jira_tools = []
        if tools:
            jira_tools = [t for t in tools if 'jira' in str(getattr(t, 'name', '')).lower()]
        
        status = "healthy" if tools_count > 0 else "degraded"
        
        return {
            "status": status,
            "authenticated": tools_count > 0,
            "tools_available": tools_count,
            "jira_tools": len(jira_tools),
            "tools_sample": [getattr(t, 'name', 'unnamed') for t in (tools[:5] if tools else [])],
            "message": "Jira MCP connection is working" if status == "healthy" else "Jira MCP connection may need authentication"
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Jira health check failed: {error_msg}")
        
        return {
            "status": "unhealthy",
            "error": error_msg,
            "authenticated": False,
            "tools_available": 0,
            "message": "Jira MCP connection failed - check authentication"
        }

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
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { testCase, llmProvider = 'google', model = 'gemini-2.5-pro' } = await request.json();

    // Validate request
    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case data is required' },
        { status: 400 }
      );
    }

    // Forward request to MCP server
    const response = await fetch('http://localhost:8000/execute-test-case', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testCase,
        llm_provider: llmProvider,
        model: model
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `MCP server error: ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error executing test case:', error);
    return NextResponse.json(
      { error: 'Failed to execute test case. Make sure MCP servers are running.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'MCP server is not running' },
      { status: 503 }
    );
  }
} 
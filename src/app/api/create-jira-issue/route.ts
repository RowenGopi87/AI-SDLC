import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the request schema
const CreateJiraIssueSchema = z.object({
  initiative: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    businessValue: z.string().optional(),
    rationale: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
  }),
  llmSettings: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Jira issue creation API called');

    // Parse and validate the request body
    const body = await request.json();
    console.log('📥 Request body:', body);

    const validatedData = CreateJiraIssueSchema.parse(body);
    const { initiative, llmSettings } = validatedData;

    console.log('✅ Request validation passed');
    console.log('🔍 Initiative to create in Jira:', initiative.title);

    // Format the initiative data for Jira
    const issueDescription = formatInitiativeForJira(initiative);
    
    console.log('📋 Formatted issue description length:', issueDescription.length);

    // Create the issue using MCP
    const jiraResponse = await createJiraIssueViaMCP({
      summary: `[INITIATIVE] ${initiative.title}`,
      description: issueDescription,
      issueType: 'Epic', // Initiatives map to Epics in Jira
      priority: mapPriority(initiative.priority),
      labels: [`initiative-${initiative.id}`, 'aura-generated', ...(initiative.category ? [initiative.category] : [])],
    });

    console.log('✅ Jira issue created via MCP:', jiraResponse);

    return NextResponse.json({
      success: true,
      data: {
        issueKey: jiraResponse.key,
        issueUrl: jiraResponse.url,
        issueId: jiraResponse.id,
        summary: `[INITIATIVE] ${initiative.title}`,
        description: issueDescription,
      },
      message: `Initiative "${initiative.title}" successfully created in Jira as ${jiraResponse.key}`,
    });

  } catch (error) {
    console.error('❌ Error creating Jira issue:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Jira issue',
    }, { status: 500 });
  }
}

// Format the initiative data into a Jira-friendly description
function formatInitiativeForJira(initiative: any): string {
  let description = `h2. Initiative Description\n${initiative.description}\n\n`;

  if (initiative.businessValue) {
    description += `h3. Business Value\n${initiative.businessValue}\n\n`;
  }

  if (initiative.rationale) {
    description += `h3. Rationale\n${initiative.rationale}\n\n`;
  }

  if (initiative.acceptanceCriteria && initiative.acceptanceCriteria.length > 0) {
    description += `h3. Acceptance Criteria\n`;
    initiative.acceptanceCriteria.forEach((criteria: string, index: number) => {
      description += `${index + 1}. ${criteria}\n`;
    });
    description += `\n`;
  }

  description += `h3. Source Information\n`;
  description += `* Generated from: Aura Requirements Management System\n`;
  description += `* Initiative ID: ${initiative.id}\n`;
  description += `* Category: ${initiative.category || 'Not specified'}\n`;
  description += `* Priority: ${initiative.priority || 'Medium'}\n`;
  description += `* Created: ${new Date().toISOString()}\n`;

  return description;
}

// Map Aura priorities to Jira priorities
function mapPriority(auraPriority?: string): string {
  switch (auraPriority?.toLowerCase()) {
    case 'critical': return 'Highest';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Medium';
  }
}

// Create Jira issue using MCP
async function createJiraIssueViaMCP(issueData: {
  summary: string;
  description: string;
  issueType: string;
  priority: string;
  labels: string[];
}): Promise<{ key: string; url: string; id: string }> {
  
  console.log('🔗 Creating Jira issue via MCP with data:', issueData);

  try {
    // Call the MCP server endpoint for Jira issue creation
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:8000';
    const response = await fetch(`${mcpServerUrl}/create-jira-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: issueData.summary,
        description: issueData.description,
        issueType: issueData.issueType,
        priority: issueData.priority,
        labels: issueData.labels,
        projectKey: process.env.JIRA_DEFAULT_PROJECT_KEY || 'AURA',
        cloudId: process.env.JIRA_CLOUD_ID,
        llm_provider: 'google',
        model: 'gemini-2.5-pro',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `MCP server returned ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ MCP server response:', result);

    if (!result.success) {
      throw new Error(result.error || 'MCP server returned unsuccessful response');
    }

    return {
      key: result.issueKey,
      url: result.issueUrl,
      id: result.issueId,
    };

  } catch (error) {
    console.error('❌ MCP Jira creation failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If MCP server is not available, fall back to mock response for development
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
      console.log('⚠️ MCP server not available, using mock response for development');
      const mockResponse = {
        key: `AURA-MOCK-${Math.floor(Math.random() * 1000)}`,
        url: `https://your-domain.atlassian.net/browse/AURA-MOCK-${Math.floor(Math.random() * 1000)}`,
        id: `mock-issue-${Date.now()}`,
      };
      console.log('🎯 Mock Jira response:', mockResponse);
      return mockResponse;
    }
    
    throw new Error(`Failed to create Jira issue: ${errorMessage}`);
  }
} 
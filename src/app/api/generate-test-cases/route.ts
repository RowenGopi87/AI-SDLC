import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/lib/services/llm-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workItemId,
      workItemType,
      workItemData,
      contextData,
      testType,
      includeNegative,
      includeEdge,
      llmSettings
    } = body;

    console.log('🔧 Generating test cases for work item:', workItemId);

    // Initialize LLM service with provided settings
    const llmService = new LLMService(llmSettings);

    // Build context prompt based on work item hierarchy
    const contextPrompt = buildContextPrompt(workItemData, contextData, workItemType);
    
    // Build test case generation prompt
    const systemPrompt = buildTestCasePrompt(
      contextPrompt,
      workItemData,
      testType,
      includeNegative,
      includeEdge
    );

    console.log('🔧 System prompt for test case generation:', systemPrompt);

    // Generate test cases using LLM
    const response = await llmService.generateTestCases(systemPrompt);

    console.log('✅ Test cases generated successfully');
    return NextResponse.json({ success: true, data: response });

  } catch (error) {
    console.error('❌ Error generating test cases:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function buildContextPrompt(workItemData: any, contextData: any, workItemType: string): string {
  let context = '';

  // Build hierarchical context based on work item type
  if (contextData.businessBrief) {
    context += `**Business Brief Context:**
- Title: ${contextData.businessBrief.title}
- Business Objective: ${contextData.businessBrief.businessObjective || contextData.businessBrief.description}
- Quantifiable Outcomes: ${contextData.businessBrief.quantifiableBusinessOutcomes || 'Not specified'}
- In Scope: ${contextData.businessBrief.inScope || 'Not specified'}
- Impact of Doing Nothing: ${contextData.businessBrief.impactOfDoNothing || 'Not specified'}

`;
  }

  if (contextData.initiative) {
    context += `**Initiative Context:**
- Title: ${contextData.initiative.title}
- Description: ${contextData.initiative.description}
- Rationale: ${contextData.initiative.rationale || 'Not specified'}
- Business Value: ${contextData.initiative.businessValue || 'Not specified'}
- Acceptance Criteria: ${contextData.initiative.acceptanceCriteria?.join(', ') || 'Not specified'}

`;
  }

  if (contextData.feature) {
    context += `**Feature Context:**
- Title: ${contextData.feature.title}
- Description: ${contextData.feature.description}
- Rationale: ${contextData.feature.rationale || 'Not specified'}
- Business Value: ${contextData.feature.businessValue || 'Not specified'}
- Acceptance Criteria: ${contextData.feature.acceptanceCriteria?.join(', ') || 'Not specified'}

`;
  }

  if (contextData.epic) {
    context += `**Epic Context:**
- Title: ${contextData.epic.title}
- Description: ${contextData.epic.description}
- Rationale: ${contextData.epic.rationale || 'Not specified'}
- Business Value: ${contextData.epic.businessValue || 'Not specified'}
- Acceptance Criteria: ${contextData.epic.acceptanceCriteria?.join(', ') || 'Not specified'}

`;
  }

  return context;
}

function buildTestCasePrompt(
  contextPrompt: string,
  workItemData: any,
  testType: string,
  includeNegative: boolean,
  includeEdge: boolean
): string {
  const testTypeDescriptions = {
    unit: 'Unit tests focus on testing individual components or functions in isolation',
    integration: 'Integration tests verify that different components work together correctly',
    system: 'System tests validate the complete integrated system meets requirements',
    acceptance: 'Acceptance tests verify the system meets business requirements and user needs',
    performance: 'Performance tests evaluate system speed, scalability, and resource usage',
    security: 'Security tests identify vulnerabilities and ensure data protection'
  };

  return `You are an expert QA engineer tasked with generating comprehensive test cases for a software work item.

${contextPrompt}

**Current Work Item to Test:**
- Title: ${workItemData.title}
- Description: ${workItemData.description}
- Rationale: ${workItemData.rationale || 'Not specified'}
- Business Value: ${workItemData.businessValue || 'Not specified'}
- Acceptance Criteria: ${workItemData.acceptanceCriteria?.join(', ') || 'Not specified'}

**Test Type Focus:** ${testType.charAt(0).toUpperCase() + testType.slice(1)} Tests
${testTypeDescriptions[testType as keyof typeof testTypeDescriptions]}

**Test Case Requirements:**
- Generate 2-4 comprehensive test cases
- Focus primarily on ${testType} testing approach
${includeNegative ? '- Include negative test cases (error handling scenarios)' : ''}
${includeEdge ? '- Include edge cases (boundary conditions)' : ''}

**Required Output Format:**
Generate test cases in the following JSON format:

{
  "testCases": [
    {
      "title": "Clear, descriptive test case title",
      "summary": "Brief summary of what this test verifies (50-80 characters)",
      "description": "Detailed description of the test case purpose and scope",
      "type": "positive|negative|edge",
      "priority": "high|medium|low",
      "preconditions": ["List of prerequisites", "that must be met"],
      "steps": ["Step 1: Action to perform", "Step 2: Next action", "Step 3: Verification step"],
      "expectedResult": "Clear description of expected outcome",
      "estimatedTime": 10,
      "tags": ["relevant", "test", "tags"]
    }
  ]
}

**Important Guidelines:**
1. Test case titles should NOT include the test type prefix (e.g., don't start with "Unit Test -" or "System Test -")
2. Focus on the specific functionality being tested
3. Make test steps clear and actionable
4. Ensure expected results are specific and measurable
5. Consider the business context and user scenarios
6. Align test cases with the acceptance criteria when provided

Generate the test cases now:`;
} 
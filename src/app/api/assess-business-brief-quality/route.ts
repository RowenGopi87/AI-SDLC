import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the request schema
const BusinessBriefAssessmentSchema = z.object({
  businessBrief: z.object({
    title: z.string(),
    businessOwner: z.string().optional(),
    leadBusinessUnit: z.string().optional(),
    primaryStrategicTheme: z.string().optional(),
    businessObjective: z.string(),
    quantifiableBusinessOutcomes: z.string(),
    inScope: z.string().optional(),
    impactOfDoNothing: z.string().optional(),
    happyPath: z.string().optional(),
    exceptions: z.string().optional(),
    impactedEndUsers: z.string(),
    changeImpactExpected: z.string(),
    impactToOtherDepartments: z.string().optional(),
    impactsExistingTechnology: z.boolean(),
    technologySolutions: z.string().optional(),
    relevantBusinessOwners: z.string().optional(),
    otherTechnologyInfo: z.string().optional(),
    submittedBy: z.string(),
    priority: z.string(),
    acceptanceCriteria: z.string().optional(),
    description: z.string().optional(),
    businessValue: z.string().optional(),
  }),
  useRealLLM: z.boolean().default(false),
  llmSettings: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
  }).optional()
});

interface QualityAssessment {
  overallGrade: 'gold' | 'silver' | 'bronze';
  overallScore: number;
  summary: string;
  improvements: {
    critical: string[];
    important: string[];
    suggested: string[];
  };
  fieldAssessments: {
    [key: string]: {
      grade: 'gold' | 'silver' | 'bronze';
      score: number;
      feedback: string;
      suggestions: string[];
    };
  };
  approvalRequired: boolean;
  nextSteps: string[];
  assessmentMode?: 'real-llm' | 'mock' | 'mock-fallback';
  requestedMode?: 'real-llm' | 'mock';
  fallbackReason?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Business brief quality assessment API called');

    // Parse and validate the request body
    const body = await request.json();
    console.log('📥 Request body:', body);

    const validatedData = BusinessBriefAssessmentSchema.parse(body);
    const { businessBrief, useRealLLM, llmSettings } = validatedData;

    console.log('✅ Request validation passed');

    // Build the comprehensive system prompt for business brief quality assessment
    const systemPrompt = buildQualityAssessmentPrompt();

    // Build the user prompt with business brief data
    const userPrompt = buildBusinessBriefAnalysisPrompt(businessBrief);

    console.log('📋 System prompt length:', systemPrompt.length);
    console.log('📋 User prompt length:', userPrompt.length);

    // Call the LLM service to assess business brief quality
    const qualityAssessment = await assessBusinessBriefWithLLM(
      systemPrompt, 
      userPrompt, 
      businessBrief,
      useRealLLM,
      llmSettings
    );

    console.log('✅ Quality assessment completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        ...qualityAssessment,
        // Only set assessmentMode if not already set (preserves fallback mode)
        assessmentMode: qualityAssessment.assessmentMode || (useRealLLM ? 'real-llm' : 'mock'),
        requestedMode: useRealLLM ? 'real-llm' : 'mock'
      },
      message: 'Business brief quality assessed successfully'
    });

  } catch (error) {
    console.error('❌ Error in business brief quality assessment API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to assess business brief quality'
    }, { status: 500 });
  }
}

function buildQualityAssessmentPrompt(): string {
  return `You are an expert Business Analyst and Product Manager specializing in evaluating business brief quality. Your primary function is to assess business idea submissions and provide constructive feedback to improve their quality and viability.

Your Goal: To evaluate the provided business brief using established business analysis best practices and provide a comprehensive quality assessment with specific improvement recommendations.

EVALUATION CRITERIA & SCORING:
Rate each aspect on a scale of 1-10, then provide an overall grade:

1. BUSINESS CLARITY & OBJECTIVES (Weight: 25%)
   - Is the business objective clear and well-defined?
   - Does it address a real business problem or opportunity?
   - Are the goals specific and measurable?
   - Score 8-10: Green, 5-7: Amber, 1-4: Red

2. QUANTIFIABLE OUTCOMES (Weight: 20%)
   - Are business outcomes specific and measurable?
   - Do they include concrete metrics (ROI, percentages, timelines)?
   - Are they realistic and achievable?
   - Score 8-10: Green, 5-7: Amber, 1-4: Red

3. STAKEHOLDER ANALYSIS (Weight: 15%)
   - Are all affected stakeholders identified?
   - Is the impact on end-users clearly described?
   - Are change impacts well understood?
   - Score 8-10: Green, 5-7: Amber, 1-4: Red

4. SCOPE & REQUIREMENTS (Weight: 15%)
   - Is the scope clearly defined and bounded?
   - Are acceptance criteria specific and testable?
   - Are exception scenarios considered?
   - Score 8-10: Green, 5-7: Amber, 1-4: Red

5. BUSINESS CASE COMPLETENESS (Weight: 15%)
   - Is the "do nothing" impact articulated?
   - Are risks and mitigation strategies identified?
   - Is there a clear happy path defined?
   - Score 8-10: Green, 5-7: Amber, 1-4: Red

6. TECHNICAL CONSIDERATION (Weight: 10%)
   - Are technology impacts properly assessed?
   - Are relevant systems and dependencies identified?
   - Is technical feasibility addressed?
   - Score 8-10: Green, 5-7: Amber, 1-4: Red

OVERALL GRADING SCALE:
- GREEN (8.0-10.0): Excellent business brief, ready for approval and next steps
- AMBER (5.0-7.9): Good foundation but needs improvement before proceeding
- RED (1.0-4.9): Significant gaps, requires substantial rework

RESPONSE FORMAT:
Provide your assessment as a JSON object with the following structure:

{
  "overallGrade": "gold|silver|bronze",
  "overallScore": 7.5,
  "summary": "Brief overall assessment of the business brief quality",
  "improvements": {
    "critical": ["List of critical issues that must be addressed"],
    "important": ["List of important improvements needed"],
    "suggested": ["List of suggested enhancements"]
  },
  "fieldAssessments": {
    "businessObjective": {
      "grade": "gold|silver|bronze",
      "score": 8.0,
      "feedback": "Specific feedback on this field",
      "suggestions": ["Specific improvement suggestions"]
    },
    "quantifiableBusinessOutcomes": { ... },
    "impactedEndUsers": { ... },
    "changeImpactExpected": { ... },
    "inScope": { ... },
    "impactOfDoNothing": { ... },
    "happyPath": { ... },
    "exceptions": { ... },
    "acceptanceCriteria": { ... }
  },
  "approvalRequired": true,
  "nextSteps": [
    "Specific actions to improve the business brief",
    "Recommended approval workflow if applicable"
  ]
}

ASSESSMENT GUIDELINES:
- BE CONSTRUCTIVE: Focus on improvement opportunities, not criticism
- BE SPECIFIC: Provide actionable feedback with examples where possible
- BE REALISTIC: Consider the context and complexity of the business domain
- BE THOROUGH: Evaluate completeness, clarity, and business viability
- BE CONSISTENT: Apply the same standards across all assessments

CRITICAL: You must respond with valid JSON only. Do not include any explanatory text before or after the JSON response.

Remember: The goal is to help improve business brief quality, not to reject ideas. Focus on constructive feedback that helps submitters create better business cases.`;
}

function buildBusinessBriefAnalysisPrompt(businessBrief: any): string {
  return `Please assess the quality of the following business brief submission:

BUSINESS BRIEF DETAILS:
======================

Title: ${businessBrief.title}
Submitted By: ${businessBrief.submittedBy}
Priority: ${businessBrief.priority}

BUSINESS CONTEXT:
Business Owner: ${businessBrief.businessOwner || 'Not specified'}
Lead Business Unit: ${businessBrief.leadBusinessUnit || 'Not specified'}
Strategic Theme: ${businessBrief.primaryStrategicTheme || 'Not specified'}

BUSINESS CHANGE DETAILS:
Business Objective: ${businessBrief.businessObjective || 'Not provided'}

Quantifiable Business Outcomes: ${businessBrief.quantifiableBusinessOutcomes || 'Not provided'}

In-Scope: ${businessBrief.inScope || 'Not specified'}

Impact of Do Nothing: ${businessBrief.impactOfDoNothing || 'Not specified'}

Happy Path: ${businessBrief.happyPath || 'Not specified'}

Exceptions: ${businessBrief.exceptions || 'Not specified'}

Acceptance Criteria: ${businessBrief.acceptanceCriteria || 'Not provided'}

STAKEHOLDER IMPACT:
Impacted End-Users: ${businessBrief.impactedEndUsers || 'Not specified'}

Change Impact Expected: ${businessBrief.changeImpactExpected || 'Not specified'}

Impact to Other Departments: ${businessBrief.impactToOtherDepartments || 'Not specified'}

TECHNOLOGY IMPACT:
Impacts Existing Technology: ${businessBrief.impactsExistingTechnology ? 'Yes' : 'No'}
Technology Solutions: ${businessBrief.technologySolutions || 'Not specified'}
Relevant Business Owners: ${businessBrief.relevantBusinessOwners || 'Not specified'}
Other Technology Info: ${businessBrief.otherTechnologyInfo || 'Not specified'}

ADDITIONAL CONTEXT:
Description: ${businessBrief.description || 'Not provided'}
Business Value: ${businessBrief.businessValue || 'Not provided'}

ASSESSMENT REQUEST:
Please evaluate this business brief according to the established criteria and provide:
1. An overall quality grade (gold/silver/bronze)
2. Specific feedback on each major section
3. Actionable improvement suggestions
4. Recommendations for next steps

Focus on identifying gaps, vague language, missing quantifiable metrics, and areas where more specificity or detail would strengthen the business case.

Provide your assessment in the specified JSON format.`;
}

async function assessBusinessBriefWithLLM(
  systemPrompt: string,
  userPrompt: string,
  businessBrief: any,
  useRealLLM: boolean,
  llmSettings?: {
    provider: string;
    model: string;
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<QualityAssessment> {
  try {
    console.log('🤖 Calling LLM for business brief quality assessment...');
    console.log(`🎯 Assessment mode: ${useRealLLM ? 'REAL LLM' : 'MOCK'} (user selected)`);
    
    if (useRealLLM) {
      console.log('🔥 Using REAL LLM assessment');
      return await callRealLLMAssessment(systemPrompt, userPrompt, businessBrief, llmSettings);
    } else {
      console.log('🎭 Using MOCK assessment logic');
      return await getMockAssessment(businessBrief);
    }

  } catch (error) {
    console.error('❌ Error in LLM business brief assessment:', error);
    console.log('🎭 Falling back to mock assessment due to error');
    // Always fall back to mock if real LLM fails
    const fallbackAssessment = await getMockAssessment(businessBrief);
    // Add metadata to show this was a fallback
    return {
      ...fallbackAssessment,
      assessmentMode: 'mock-fallback',
      requestedMode: useRealLLM ? 'real-llm' : 'mock',
      fallbackReason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function callRealLLMAssessment(
  systemPrompt: string, 
  userPrompt: string, 
  businessBrief: any,
  llmSettings?: {
    provider: string;
    model: string;
    apiKey: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<QualityAssessment> {
  try {
    // Validate that LLM settings are provided
    if (!llmSettings) {
      console.error('❌ REAL LLM FAILED: No LLM settings provided');
      console.error('   To fix: Configure LLM settings in the Settings page');
      throw new Error('LLM settings not provided - please configure in Settings page');
    }

    // Get LLM settings from the request (configured in Settings page)
    const llmProvider = llmSettings.provider;
    const llmModel = llmSettings.model;
    const llmApiKey = llmSettings.apiKey;
    const llmTemperature = llmSettings.temperature || 0.3;
    const llmMaxTokens = llmSettings.maxTokens || 4000;

    console.log('🔧 LLM Configuration Check (from Settings):');
    console.log(`   Provider: ${llmProvider}`);
    console.log(`   Model: ${llmModel}`);
    console.log(`   API Key: ${llmApiKey ? `${llmApiKey.substring(0, 8)}...` : 'NOT SET'}`);
    console.log(`   Temperature: ${llmTemperature}`);
    console.log(`   Max Tokens: ${llmMaxTokens}`);

    if (!llmApiKey) {
      console.error('❌ REAL LLM FAILED: No API key configured');
      console.error('   To fix: Add your API key in the Settings page');
      throw new Error('LLM API key not configured - please add it in Settings page');
    }

    console.log(`🔥 Making real ${llmProvider} API call with model ${llmModel}`);
    console.log(`📝 System prompt length: ${systemPrompt.length} chars`);
    console.log(`📝 User prompt length: ${userPrompt.length} chars`);

    let llmResponse: string;

    if (llmProvider === 'openai') {
      console.log('🚀 Calling OpenAI API...');
      llmResponse = await callOpenAI(systemPrompt, userPrompt, llmModel, llmApiKey, llmTemperature, llmMaxTokens);
    } else if (llmProvider === 'anthropic') {
      console.log('🚀 Calling Anthropic API...');
      llmResponse = await callAnthropic(systemPrompt, userPrompt, llmModel, llmApiKey, llmTemperature, llmMaxTokens);
    } else {
      console.error(`❌ REAL LLM FAILED: Unsupported provider: ${llmProvider}`);
      throw new Error(`Unsupported LLM provider: ${llmProvider}`);
    }

    console.log('✅ Raw LLM response received');
    console.log(`📊 Response length: ${llmResponse.length} chars`);
    console.log(`📋 Response preview: ${llmResponse.substring(0, 200)}...`);

    // Parse the JSON response from the LLM (with robust extraction)
    let parsedResponse;
    try {
      // Try parsing the response directly first
      parsedResponse = JSON.parse(llmResponse);
      console.log('✅ JSON parsing successful (direct)');
    } catch (parseError) {
      console.log('⚠️ Direct JSON parse failed, trying to extract JSON from response...');
      
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parsing successful (extracted)');
        } catch (extractError) {
          console.error('❌ REAL LLM FAILED: Could not extract valid JSON from response');
          console.error('   Response was:', llmResponse);
          console.error('   Extracted JSON:', jsonMatch[0]);
          throw new Error(`Failed to parse extracted JSON: ${extractError}`);
        }
      } else {
        console.error('❌ REAL LLM FAILED: No JSON found in response');
        console.error('   Response was:', llmResponse);
        throw new Error(`No JSON found in LLM response: ${parseError}`);
      }
    }
    
    // Validate the response structure
    if (!parsedResponse.overallGrade || !parsedResponse.overallScore) {
      console.error('❌ REAL LLM FAILED: Invalid response structure');
      console.error('   Missing overallGrade or overallScore');
      console.error('   Response:', parsedResponse);
      throw new Error('Invalid LLM response structure');
    }

    console.log('🎉 REAL LLM ASSESSMENT SUCCESSFUL!');
    console.log(`   Grade: ${parsedResponse.overallGrade}`);
    console.log(`   Score: ${parsedResponse.overallScore}`);

    return {
      ...parsedResponse,
      assessmentMode: 'real-llm',
      requestedMode: 'real-llm'
    };

  } catch (error) {
    console.error('💥 Real LLM assessment failed:', error);
    console.error('🔄 This will trigger fallback to mock assessment');
    throw error; // Re-throw to trigger fallback to mock
  }
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string, 
  model: string,
  apiKey: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      // Note: response_format removed for compatibility with older models
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  model: string, 
  apiKey: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt + '\n\nPlease respond with valid JSON only.' }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function getMockAssessment(businessBrief: any): Promise<QualityAssessment> {
  // This is the existing mock logic, extracted into a separate function
  
  // Analyze the brief quality based on content length and specificity
  const titleQuality = assessFieldQuality(businessBrief.title, 'title');
  const objectiveQuality = assessFieldQuality(businessBrief.businessObjective, 'objective');
  const outcomesQuality = assessFieldQuality(businessBrief.quantifiableBusinessOutcomes, 'outcomes');
  const usersQuality = assessFieldQuality(businessBrief.impactedEndUsers, 'users');
  const changeQuality = assessFieldQuality(businessBrief.changeImpactExpected, 'change');
  
  // Calculate overall score (weighted average)
  const overallScore = (
    (titleQuality.score * 0.1) +
    (objectiveQuality.score * 0.25) +
    (outcomesQuality.score * 0.2) +
    (usersQuality.score * 0.15) +
    (changeQuality.score * 0.15) +
    (5.0 * 0.15) // Default score for other fields
  );
  
  const overallGrade: 'gold' | 'silver' | 'bronze' = 
    overallScore >= 8.0 ? 'gold' : 
    overallScore >= 5.0 ? 'silver' : 'bronze';
  
  const mockAssessment: QualityAssessment = {
    overallGrade,
    overallScore: Math.round(overallScore * 10) / 10,
    summary: generateSummary(overallGrade, overallScore),
    improvements: generateImprovements(overallGrade, businessBrief),
    fieldAssessments: {
      businessObjective: objectiveQuality,
      quantifiableBusinessOutcomes: outcomesQuality,
      impactedEndUsers: usersQuality,
      changeImpactExpected: changeQuality,
      inScope: assessFieldQuality(businessBrief.inScope, 'scope'),
      impactOfDoNothing: assessFieldQuality(businessBrief.impactOfDoNothing, 'impact'),
      happyPath: assessFieldQuality(businessBrief.happyPath, 'happy-path'),
      exceptions: assessFieldQuality(businessBrief.exceptions, 'exceptions'),
      acceptanceCriteria: assessFieldQuality(businessBrief.acceptanceCriteria, 'criteria')
    },
    approvalRequired: overallGrade !== 'gold',
    nextSteps: generateNextSteps(overallGrade, businessBrief),
    assessmentMode: 'mock',
    requestedMode: 'mock'
  };

  console.log('✅ Mock assessment completed successfully');
  return mockAssessment;
}

function assessFieldQuality(content: string, fieldType: string) {
  const length = (content || '').length;
  
  // Base assessment on content length and quality indicators
  let score = 1.0;
  let feedback = '';
  let suggestions: string[] = [];
  
  if (!content || content.trim().length === 0) {
    score = 1.0;
    feedback = 'Field is empty or not provided';
    suggestions = [`Please provide detailed information for this ${fieldType} field`];
  } else if (length < 20) {
    score = 2.0;
    feedback = 'Very brief response with minimal detail';
    suggestions = [`Expand this ${fieldType} with more specific details and context`];
  } else if (length < 50) {
    score = 4.0;
    feedback = 'Basic information provided but lacks depth';
    suggestions = [`Add more specific details and measurable metrics to this ${fieldType}`];
  } else if (length < 100) {
    score = 6.0;
    feedback = 'Good level of detail provided';
    suggestions = [`Consider adding more quantifiable metrics or specific examples`];
  } else {
    score = 8.0;
    feedback = 'Comprehensive information provided';
    suggestions = [`Review for clarity and ensure all aspects are covered`];
  }
  
  // Check for quality indicators
  const hasNumbers = /\d/.test(content || '');
  const hasSpecifics = /(specific|detailed|measured|metric|target|goal|increase|decrease|improve)/.test((content || '').toLowerCase());
  
  if (hasNumbers && hasSpecifics) {
    score = Math.min(score + 1.5, 10.0);
  } else if (hasNumbers || hasSpecifics) {
    score = Math.min(score + 0.5, 10.0);
  }
  
  const grade: 'gold' | 'silver' | 'bronze' = 
    score >= 8.0 ? 'gold' : 
    score >= 5.0 ? 'silver' : 'bronze';
  
  return {
    grade,
    score: Math.round(score * 10) / 10,
    feedback,
    suggestions
  };
}

function generateSummary(grade: 'gold' | 'silver' | 'bronze', score: number): string {
  switch (grade) {
    case 'gold':
      return `Excellent business brief with comprehensive details and clear objectives. Score: ${score}/10. Ready for approval and next phase implementation.`;
    case 'silver':
      return `Good foundation for a business brief but requires improvements in key areas. Score: ${score}/10. Address highlighted issues before proceeding.`;
    case 'bronze':
      return `Business brief needs significant improvement with multiple critical gaps. Score: ${score}/10. Substantial rework required before approval.`;
  }
}

function generateImprovements(grade: 'gold' | 'silver' | 'bronze', businessBrief: any) {
  const improvements = {
    critical: [] as string[],
    important: [] as string[],
    suggested: [] as string[]
  };
  
  // Check for critical issues
  if (!businessBrief.businessObjective || businessBrief.businessObjective.length < 50) {
    improvements.critical.push('Business objective needs to be comprehensive and clearly define the problem/opportunity');
  }
  
  if (!businessBrief.quantifiableBusinessOutcomes || !businessBrief.quantifiableBusinessOutcomes.includes('%%') && !/\d/.test(businessBrief.quantifiableBusinessOutcomes)) {
    improvements.critical.push('Quantifiable business outcomes must include specific metrics, percentages, or measurable targets');
  }
  
  if (!businessBrief.impactedEndUsers || businessBrief.impactedEndUsers.length < 20) {
    improvements.critical.push('Impacted end-users section needs detailed stakeholder analysis');
  }
  
  // Check for important improvements
  if (!businessBrief.impactOfDoNothing || businessBrief.impactOfDoNothing.length < 30) {
    improvements.important.push('Strengthen the "Impact of Do Nothing" section with specific risks and consequences');
  }
  
  if (!businessBrief.inScope || businessBrief.inScope.length < 30) {
    improvements.important.push('Define project scope more clearly with specific boundaries and deliverables');
  }
  
  if (!businessBrief.acceptanceCriteria || businessBrief.acceptanceCriteria.length < 30) {
    improvements.important.push('Provide detailed, testable acceptance criteria');
  }
  
  // Suggested improvements
  if (!businessBrief.happyPath || businessBrief.happyPath.length < 30) {
    improvements.suggested.push('Add detailed happy path scenarios to illustrate ideal user journeys');
  }
  
  if (!businessBrief.exceptions || businessBrief.exceptions.length < 30) {
    improvements.suggested.push('Include exception handling and alternative scenarios');
  }
  
  improvements.suggested.push('Consider adding supporting documentation or research data');
  improvements.suggested.push('Review alignment with strategic business objectives');
  
  return improvements;
}

function generateNextSteps(grade: 'gold' | 'silver' | 'bronze', businessBrief: any): string[] {
  const steps: string[] = [];
  
  switch (grade) {
    case 'gold':
      steps.push('Business brief approved - proceed to initiative planning phase');
      steps.push('Schedule stakeholder alignment meeting');
      steps.push('Begin technical feasibility assessment');
      break;
    case 'silver':
      steps.push('Address highlighted improvements before final approval');
      steps.push('Schedule review meeting with business owner');
      steps.push('Resubmit for quality assessment after improvements');
      steps.push('Consider stakeholder consultation for unclear areas');
      break;
    case 'bronze':
      steps.push('Substantial rework required - consult with business analyst');
      steps.push('Conduct additional research and stakeholder interviews');
      steps.push('Review similar successful business cases for reference');
      steps.push('Schedule mentoring session for business brief best practices');
      break;
  }
  
  return steps;
} 
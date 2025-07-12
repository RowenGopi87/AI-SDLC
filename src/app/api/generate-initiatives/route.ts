import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';

// Request validation schema for initiatives
const generateInitiativesSchema = z.object({
  businessBriefId: z.string(),
  businessBriefData: z.object({
    title: z.string(),
    businessObjective: z.string(),
    quantifiableBusinessOutcomes: z.string(),
    inScope: z.string().optional(),
    impactOfDoNothing: z.string().optional(),
    happyPath: z.string().optional(),
    exceptions: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    impactedEndUsers: z.string().optional(),
    changeImpactExpected: z.string().optional(),
    impactToOtherDepartments: z.string().optional(),
    businessOwner: z.string().optional(),
    leadBusinessUnit: z.string().optional(),
    primaryStrategicTheme: z.string().optional(),
  }),
  llmSettings: z.object({
    provider: z.string(),
    model: z.string(),
    apiKey: z.string(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = generateInitiativesSchema.parse(body);
    const { businessBriefId, businessBriefData, llmSettings } = validatedData;

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate initiatives through iterative process
    const result = await llmService.generateInitiatives(businessBriefData);

    return NextResponse.json({
      success: true,
      data: {
        businessBriefId,
        initiatives: result.initiatives,
        metadata: {
          iterationCount: result.iterationCount,
          totalTokensUsed: result.totalTokensUsed,
          processingTime: result.processingTime,
          llmProvider: llmSettings.provider,
          llmModel: llmSettings.model,
        },
      },
    });
  } catch (error) {
    console.error('Error generating initiatives:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
} 
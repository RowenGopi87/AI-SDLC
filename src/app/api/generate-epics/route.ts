import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';

// Request validation schema for epics
const generateEpicsSchema = z.object({
  featureId: z.string(),
  initiativeId: z.string(),
  businessBriefId: z.string(),
  featureData: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.string(),
    rationale: z.string(),
    acceptanceCriteria: z.array(z.string()),
    businessValue: z.string(),
    workflowLevel: z.string(),
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
    const validatedData = generateEpicsSchema.parse(body);
    const { featureId, initiativeId, businessBriefId, featureData, llmSettings } = validatedData;

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate epics through iterative process
    const result = await llmService.generateEpics(featureData);

    return NextResponse.json({
      success: true,
      data: {
        featureId,
        initiativeId,
        businessBriefId,
        epics: result.epics,
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
    console.error('Error generating epics:', error);

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
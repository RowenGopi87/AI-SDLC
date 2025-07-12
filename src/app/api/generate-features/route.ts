import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';

// Request validation schema for features
const generateFeaturesSchema = z.object({
  initiativeId: z.string(),
  businessBriefId: z.string(),
  initiativeData: z.object({
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
    const validatedData = generateFeaturesSchema.parse(body);
    const { initiativeId, businessBriefId, initiativeData, llmSettings } = validatedData;

    // Initialize LLM service
    const llmService = new LLMService(llmSettings);

    // Generate features through iterative process
    const result = await llmService.generateFeatures(initiativeData);

    return NextResponse.json({
      success: true,
      data: {
        initiativeId,
        businessBriefId,
        features: result.features,
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
    console.error('Error generating features:', error);

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
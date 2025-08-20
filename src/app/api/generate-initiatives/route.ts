import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@/lib/services/llm-service';
import { databaseService } from '@/lib/database/service';

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

    console.log(`💾 Saving ${result.initiatives.length} generated initiatives to database...`);

    // Save each generated initiative to the database
    const savedInitiatives = [];
    for (const initiative of result.initiatives) {
      try {
        const initiativeData = {
          id: `INIT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
          businessBriefId: businessBriefId,
          title: initiative.title,
          description: initiative.description,
          businessValue: initiative.businessValue || initiative.rationale || '',
          acceptanceCriteria: JSON.stringify(initiative.acceptanceCriteria || []), // Convert array to JSON string for database
          priority: initiative.priority || 'medium',
          status: 'planning',
          assignedTo: businessBriefData.businessOwner || 'Unassigned',
          estimatedValue: null, // Database expects null, not 0
          workflowStage: 'planning',
          completionPercentage: 0
        };

        console.log(`💾 Saving initiative "${initiative.title}" with data:`, {
          id: initiativeData.id,
          businessBriefId: initiativeData.businessBriefId,
          title: initiativeData.title,
          priority: initiativeData.priority,
          status: initiativeData.status,
          assignedTo: initiativeData.assignedTo,
          acceptanceCriteriaType: typeof initiativeData.acceptanceCriteria,
          acceptanceCriteriaLength: initiativeData.acceptanceCriteria.length
        });

        const savedInitiative = await databaseService.createInitiative(initiativeData);
        savedInitiatives.push(savedInitiative);
        console.log(`✅ Saved initiative: ${savedInitiative.title} (ID: ${savedInitiative.id})`);
      } catch (saveError) {
        console.error(`❌ Failed to save initiative: ${initiative.title}`, saveError);
        console.error('Initiative data that failed:', initiative);
        // Continue with other initiatives even if one fails
      }
    }

    console.log(`✅ Successfully saved ${savedInitiatives.length}/${result.initiatives.length} initiatives to database`);

    return NextResponse.json({
      success: true,
      data: {
        businessBriefId,
        initiatives: savedInitiatives, // Return the saved initiatives with database IDs
        metadata: {
          generated: result.initiatives.length,
          saved: savedInitiatives.length,
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
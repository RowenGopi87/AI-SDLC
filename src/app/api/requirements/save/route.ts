import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// This would typically save to a database
// For now, we'll return success since the frontend handles storage via Zustand
const saveRequirementsSchema = z.object({
  businessBriefId: z.string(),
  requirements: z.array(z.object({
    id: z.string(),
    text: z.string(),
    category: z.string(),
    priority: z.enum(['high', 'medium', 'low', 'critical']), // Added 'critical'
    rationale: z.string(),
    acceptanceCriteria: z.array(z.string()),
    clearPrinciples: z.object({
      clear: z.boolean(),
      concise: z.boolean(),
      correct: z.boolean(),
      complete: z.boolean(),
      feasible: z.boolean(),
      testable: z.boolean(),
      unambiguous: z.boolean(),
      atomic: z.boolean(),
    }),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the incoming data for debugging
    console.log('Received save request:', {
      businessBriefId: body.businessBriefId,
      requirementCount: body.requirements?.length,
      firstRequirement: body.requirements?.[0]
    });
    
    // Validate request
    const validatedData = saveRequirementsSchema.parse(body);
    const { businessBriefId, requirements } = validatedData;

    // In a real application, you would save to a database here
    // For now, we'll just validate and return success
    console.log(`Saving ${requirements.length} requirements for business brief ${businessBriefId}`);

    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${requirements.length} requirements`,
      data: {
        businessBriefId,
        requirementCount: requirements.length,
        savedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error saving requirements:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save requirements',
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/service';
import { z } from 'zod';

const createInitiativeSchema = z.object({
  businessBriefId: z.string().min(1, 'Business Brief ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  businessValue: z.string().optional(),
  rationale: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['backlog', 'planning', 'in_progress', 'done', 'cancelled']).default('planning'),
  category: z.string().optional(),
  assignedTo: z.string().optional(),
  estimatedEffort: z.string().optional(),
  businessImpact: z.string().optional(),
  technicalComplexity: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  successMetrics: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Initiative creation API called');
    
    const body = await request.json();
    console.log('📥 Request body:', { businessBriefId: body.businessBriefId, title: body.title });

    // Validate request
    const validatedData = createInitiativeSchema.parse(body);
    console.log('✅ Request validation passed');

    // Prepare initiative data for database - match exact database service expectations
    const initiativeData = {
      id: `INIT-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      businessBriefId: validatedData.businessBriefId,
      title: validatedData.title,
      description: validatedData.description || '',
      businessValue: validatedData.businessValue || validatedData.rationale || '',
      acceptanceCriteria: JSON.stringify(validatedData.acceptanceCriteria || []), // Must be JSON string
      priority: validatedData.priority,
      status: validatedData.status,
                assignedTo: validatedData.assignedTo || 'Unassigned', // Use string for database VARCHAR field
      estimatedValue: null, // Database expects null for optional numeric fields
      workflowStage: 'planning',
      completionPercentage: 0
    };

    console.log('💾 Saving initiative to database...');

    // Save to database
    const createdInitiative = await databaseService.createInitiative(initiativeData);
    console.log('✅ Initiative saved successfully:', createdInitiative.id);

    return NextResponse.json({
      success: true,
      message: 'Initiative created successfully',
      data: createdInitiative
    });

  } catch (error: any) {
    console.error('❌ Failed to create initiative:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
        message: 'Please check the required fields and try again'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create initiative',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}

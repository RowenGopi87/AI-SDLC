import { NextRequest, NextResponse } from 'next/server';
import { auraV2Service } from '@/lib/database/aurav2-service';
import { APP_CONFIG } from '@/lib/config/app-config';
import { z } from 'zod';

const initializeProgressSchema = z.object({
  businessBriefId: z.string().min(1, 'Business Brief ID is required'),
  workflowType: z.enum(['new_system', 'enhancement']),
  userId: z.string().optional().default('system')
});

const updateCompletionSchema = z.object({
  businessBriefId: z.string().min(1, 'Business Brief ID is required'),
  stageId: z.string().min(1, 'Stage ID is required'),
  completionData: z.record(z.boolean()),
  userId: z.string().optional().default('system')
});

// GET /api/aurav2/workflow/progress?businessBriefId=XXX - Get workflow progress
export async function GET(request: NextRequest) {
  try {
    console.log('📊 AuraV2 workflow progress GET API called');
    
    const { searchParams } = new URL(request.url);
    const businessBriefId = searchParams.get('businessBriefId');

    if (!businessBriefId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter',
        message: 'businessBriefId is required'
      }, { status: 400 });
    }

    console.log('🔍 Getting progress for business brief:', businessBriefId);

    // Get workflow progress
    const progress = await auraV2Service.getWorkflowProgress(businessBriefId);
    
    if (!progress) {
      console.log('📋 No progress found, workflow may not be initialized yet');
      return NextResponse.json({
        success: true,
        message: 'No workflow progress found',
        data: null,
        metadata: {
          appName: APP_CONFIG.APP_NAME,
          businessBriefId,
          initialized: false
        }
      });
    }

    // Also get current stage details
    const currentStage = await auraV2Service.getWorkflowStage(progress.currentStageId);

    console.log(`✅ Retrieved workflow progress for stage: ${progress.currentStageId}`);

    return NextResponse.json({
      success: true,
      message: 'Workflow progress retrieved successfully',
      data: {
        progress,
        currentStage
      },
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        businessBriefId,
        currentStageId: progress.currentStageId,
        workflowType: progress.workflowType
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get workflow progress:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve workflow progress',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/aurav2/workflow/progress - Initialize or update workflow progress
export async function POST(request: NextRequest) {
  try {
    console.log('📝 AuraV2 workflow progress POST API called');
    
    const body = await request.json();
    const action = body.action;

    if (action === 'initialize') {
      // Initialize workflow progress
      const validatedData = initializeProgressSchema.parse(body);
      console.log('🔄 Initializing workflow progress:', {
        businessBriefId: validatedData.businessBriefId,
        workflowType: validatedData.workflowType
      });

      // Check if progress already exists
      const existingProgress = await auraV2Service.getWorkflowProgress(validatedData.businessBriefId);
      if (existingProgress) {
        return NextResponse.json({
          success: false,
          error: 'Workflow already initialized',
          message: 'Workflow progress already exists for this business brief',
          data: existingProgress
        }, { status: 409 });
      }

      // Initialize new workflow progress
      const progress = await auraV2Service.initializeWorkflowProgress(
        validatedData.businessBriefId,
        validatedData.workflowType
      );

      console.log('✅ Workflow progress initialized successfully');

      return NextResponse.json({
        success: true,
        message: 'Workflow progress initialized successfully',
        data: progress,
        metadata: {
          appName: APP_CONFIG.APP_NAME,
          action: 'initialize'
        }
      });

    } else if (action === 'updateCompletion') {
      // Update stage completion
      const validatedData = updateCompletionSchema.parse(body);
      console.log('📋 Updating stage completion:', {
        businessBriefId: validatedData.businessBriefId,
        stageId: validatedData.stageId,
        completionKeys: Object.keys(validatedData.completionData)
      });

      await auraV2Service.updateStageCompletion(
        validatedData.businessBriefId,
        validatedData.stageId,
        validatedData.completionData,
        validatedData.userId
      );

      // Get updated progress
      const updatedProgress = await auraV2Service.getWorkflowProgress(validatedData.businessBriefId);

      console.log('✅ Stage completion updated successfully');

      return NextResponse.json({
        success: true,
        message: 'Stage completion updated successfully',
        data: updatedProgress,
        metadata: {
          appName: APP_CONFIG.APP_NAME,
          action: 'updateCompletion',
          stageId: validatedData.stageId
        }
      });

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action',
        message: 'Action must be "initialize" or "updateCompletion"'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Failed to process workflow progress request:', error);

    if (error instanceof z.ZodError) {
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
        error: 'Failed to process workflow progress request',
        message: error.message
      },
      { status: 500 }
    );
  }
}

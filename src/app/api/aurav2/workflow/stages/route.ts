import { NextRequest, NextResponse } from 'next/server';
import { auraV2Service } from '@/lib/database/aurav2-service';
import { APP_CONFIG } from '@/lib/config/app-config';

// GET /api/aurav2/workflow/stages - Get all workflow stages
export async function GET(request: NextRequest) {
  try {
    console.log('📋 AuraV2 workflow stages API called');
    
    const { searchParams } = new URL(request.url);
    const workflowType = searchParams.get('workflowType') as 'new_system' | 'enhancement' | null;

    console.log('🔍 Request parameters:', { workflowType });

    // Get workflow stages
    const stages = await auraV2Service.getWorkflowStages(workflowType || undefined);
    console.log(`✅ Retrieved ${stages.length} workflow stages`);

    return NextResponse.json({
      success: true,
      message: `Retrieved ${stages.length} workflow stages`,
      data: stages,
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        version: APP_CONFIG.VERSION,
        workflowType,
        totalStages: stages.length
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get workflow stages:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve workflow stages',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/aurav2/workflow/stages - Create or update a workflow stage (admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('📝 AuraV2 create workflow stage API called');
    
    // TODO: Add authentication and admin role check
    
    return NextResponse.json({
      success: false,
      error: 'Not implemented',
      message: 'Stage creation/update not implemented yet'
    }, { status: 501 });

  } catch (error: any) {
    console.error('❌ Failed to create workflow stage:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create workflow stage',
        message: error.message
      },
      { status: 500 }
    );
  }
}

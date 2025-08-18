import { NextRequest, NextResponse } from 'next/server';
import { auraV2Service } from '@/lib/database/aurav2-service';
import { APP_CONFIG } from '@/lib/config/app-config';
import { z } from 'zod';

const createExtensionSchema = z.object({
  businessBriefId: z.string().min(1, 'Business Brief ID is required'),
  workflowType: z.enum(['new_system', 'enhancement']).optional(),
  estimationSize: z.enum(['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl']).optional(),
  estimationConfidence: z.enum(['bronze', 'silver', 'gold']).optional(),
  buildOrBuyDecision: z.enum(['build', 'buy', 'enhance', 'pending']).optional(),
  rfiData: z.any().optional(),
  capacityPlanning: z.any().optional(),
  discoveryFindings: z.any().optional(),
  qualityScore: z.number().min(0).max(1).optional(),
  aiAnalysis: z.any().optional(),
  stakeholderAlignment: z.any().optional()
});

// GET /api/aurav2/business-brief/extensions?businessBriefId=XXX - Get business brief extension
export async function GET(request: NextRequest) {
  try {
    console.log('📋 AuraV2 business brief extensions GET API called');
    
    const { searchParams } = new URL(request.url);
    const businessBriefId = searchParams.get('businessBriefId');

    if (!businessBriefId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter',
        message: 'businessBriefId is required'
      }, { status: 400 });
    }

    console.log('🔍 Getting extension for business brief:', businessBriefId);

    // Get business brief extension
    const extension = await auraV2Service.getBusinessBriefExtension(businessBriefId);
    
    console.log('✅ Retrieved business brief extension:', extension ? 'found' : 'not found');

    return NextResponse.json({
      success: true,
      message: extension ? 'Business brief extension retrieved successfully' : 'No extension found',
      data: extension,
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        businessBriefId,
        hasExtension: !!extension
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get business brief extension:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve business brief extension',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/aurav2/business-brief/extensions - Create or update business brief extension
export async function POST(request: NextRequest) {
  try {
    console.log('📝 AuraV2 business brief extensions POST API called');
    
    const body = await request.json();
    console.log('📥 Request body:', {
      businessBriefId: body.businessBriefId,
      workflowType: body.workflowType,
      estimationSize: body.estimationSize,
      buildOrBuyDecision: body.buildOrBuyDecision
    });

    // Validate request
    const validatedData = createExtensionSchema.parse(body);
    console.log('✅ Request validation passed');

    // Check if extension already exists
    const existingExtension = await auraV2Service.getBusinessBriefExtension(validatedData.businessBriefId);
    
    if (existingExtension) {
      // Update existing extension (this would require implementing an update method)
      return NextResponse.json({
        success: false,
        error: 'Extension already exists',
        message: 'Business brief extension already exists. Update functionality not implemented yet.',
        data: existingExtension
      }, { status: 409 });
    }

    // Create new extension
    console.log('💾 Creating business brief extension...');
    const extension = await auraV2Service.createBusinessBriefExtension(validatedData);
    console.log('✅ Business brief extension created successfully');

    return NextResponse.json({
      success: true,
      message: 'Business brief extension created successfully',
      data: extension,
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        businessBriefId: validatedData.businessBriefId
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to create business brief extension:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid extension data',
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create business brief extension',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PATCH /api/aurav2/business-brief/extensions - Update specific fields of business brief extension
export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 AuraV2 business brief extensions PATCH API called');
    
    const body = await request.json();
    const businessBriefId = body.businessBriefId;

    if (!businessBriefId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter',
        message: 'businessBriefId is required'
      }, { status: 400 });
    }

    // TODO: Implement partial update functionality
    // This would allow updating specific fields without replacing the entire extension
    
    return NextResponse.json({
      success: false,
      error: 'Not implemented',
      message: 'Partial update functionality not implemented yet'
    }, { status: 501 });

  } catch (error: any) {
    console.error('❌ Failed to update business brief extension:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update business brief extension',
        message: error.message
      },
      { status: 500 }
    );
  }
}

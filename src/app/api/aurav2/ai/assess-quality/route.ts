import { NextRequest, NextResponse } from 'next/server';
import { auraV2Service } from '@/lib/database/aurav2-service';
import { APP_CONFIG } from '@/lib/config/app-config';
import { z } from 'zod';

const assessQualitySchema = z.object({
  businessBriefId: z.string().min(1, 'Business Brief ID is required'),
  userId: z.string().optional().default('system')
});

// POST /api/aurav2/ai/assess-quality - Run AI quality assessment on business brief
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AuraV2 AI quality assessment API called');
    
    const body = await request.json();
    console.log('📥 Request body:', { businessBriefId: body.businessBriefId });

    // Validate request
    const validatedData = assessQualitySchema.parse(body);
    console.log('✅ Request validation passed');

    // Check if AI features are enabled
    if (!APP_CONFIG.AI_FEATURES.AUTO_QUALITY_ASSESSMENT) {
      return NextResponse.json({
        success: false,
        error: 'AI quality assessment is not enabled',
        message: 'Please enable AI features in configuration'
      }, { status: 403 });
    }

    console.log('🧠 Running AI quality assessment...');

    // Run the AI quality assessment
    const qualityAssessment = await auraV2Service.assessBusinessBriefQuality(
      validatedData.businessBriefId
    );

    console.log('✅ AI quality assessment completed successfully');
    console.log('📊 Assessment results:', {
      overallScore: qualityAssessment.overallScore,
      qualityLevel: qualityAssessment.estimatedQualityLevel,
      recommendationCount: qualityAssessment.recommendations.length,
      actionCount: qualityAssessment.requiredActions.length
    });

    return NextResponse.json({
      success: true,
      message: 'AI quality assessment completed successfully',
      data: {
        assessment: qualityAssessment,
        summary: {
          score: qualityAssessment.overallScore,
          level: qualityAssessment.estimatedQualityLevel,
          recommendations: qualityAssessment.recommendations.length,
          actions: qualityAssessment.requiredActions.length
        }
      },
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        aiEnabled: true,
        assessmentId: qualityAssessment.id,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to assess business brief quality:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid assessment request',
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assess business brief quality',
        message: error.message,
        metadata: {
          appName: APP_CONFIG.APP_NAME,
          aiEnabled: APP_CONFIG.AI_FEATURES.AUTO_QUALITY_ASSESSMENT
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/aurav2/ai/assess-quality?businessBriefId=XXX - Get existing quality assessment
export async function GET(request: NextRequest) {
  try {
    console.log('📊 AuraV2 get quality assessment API called');
    
    const { searchParams } = new URL(request.url);
    const businessBriefId = searchParams.get('businessBriefId');

    if (!businessBriefId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter',
        message: 'businessBriefId is required'
      }, { status: 400 });
    }

    console.log('🔍 Getting quality assessment for:', businessBriefId);

    // Get existing quality assessment from business brief extension
    const extension = await auraV2Service.getBusinessBriefExtension(businessBriefId);
    
    if (!extension || !extension.aiAnalysis) {
      return NextResponse.json({
        success: true,
        message: 'No quality assessment found',
        data: null,
        metadata: {
          appName: APP_CONFIG.APP_NAME,
          businessBriefId,
          hasAssessment: false
        }
      });
    }

    console.log('✅ Quality assessment found:', {
      score: extension.qualityScore,
      level: extension.aiAnalysis.estimatedQualityLevel
    });

    return NextResponse.json({
      success: true,
      message: 'Quality assessment retrieved successfully',
      data: {
        assessment: extension.aiAnalysis,
        summary: {
          score: extension.qualityScore,
          level: extension.aiAnalysis.estimatedQualityLevel,
          recommendations: extension.aiAnalysis.recommendations?.length || 0,
          actions: extension.aiAnalysis.requiredActions?.length || 0
        }
      },
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        businessBriefId,
        hasAssessment: true,
        lastAssessed: extension.aiAnalysis.assessedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get quality assessment:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve quality assessment',
        message: error.message
      },
      { status: 500 }
    );
  }
}

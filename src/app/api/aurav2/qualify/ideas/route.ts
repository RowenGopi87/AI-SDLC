import { NextRequest, NextResponse } from 'next/server';
import { getAuraV2Service } from '@/lib/database/aurav2-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 AuraV2 get qualified ideas API called');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    console.log('🔍 Query params:', { status, limit, offset });

    const db = await getAuraV2Service();
    const qualifiedIdeas = await db.getQualifiedIdeas({
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    console.log('✅ Retrieved qualified ideas:', qualifiedIdeas.length);

    return NextResponse.json({
      success: true,
      data: qualifiedIdeas,
      message: 'Qualified ideas retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching qualified ideas:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch qualified ideas',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📊 AuraV2 create qualified idea API called');
    
    const data = await request.json();
    console.log('📥 Request data:', data);

    if (!data.businessBriefId) {
      return NextResponse.json({
        success: false,
        error: 'Business brief ID is required'
      }, { status: 400 });
    }

    const db = await getAuraV2Service();
    
    // Create qualification record
    const qualificationData = {
      businessBriefId: data.businessBriefId,
      title: data.title,
      qualificationScore: data.qualificationScore || 0,
      marketDemand: data.criteria?.marketDemand || 0,
      technicalFeasibility: data.criteria?.technicalFeasibility || 0,
      businessValue: data.criteria?.businessValue || 0,
      resourceAvailability: data.criteria?.resourceAvailability || 0,
      strategicAlignment: data.criteria?.strategicAlignment || 0,
      riskLevel: data.criteria?.riskLevel || 0,
      marketResearch: data.marketResearch,
      competitorAnalysis: data.competitorAnalysis,
      technicalAssessment: data.technicalAssessment,
      businessCase: data.businessCase,
      riskAssessment: data.riskAssessment,
      recommendedAction: data.recommendedAction || 'research_more',
      qualifiedBy: data.qualifiedBy || 'system'
    };

    const qualifiedIdea = await db.createQualifiedIdea(qualificationData);

    console.log('✅ Qualified idea created:', qualifiedIdea.id);

    return NextResponse.json({
      success: true,
      data: qualifiedIdea,
      message: 'Qualified idea created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating qualified idea:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create qualified idea',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

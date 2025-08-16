import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/service';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Business briefs list API called');

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    console.log('📥 Query params:', { status, limit, offset });

    // Retrieve business briefs from database
    const businessBriefs = await databaseService.getBusinessBriefs({
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    console.log('✅ Retrieved business briefs from database:', businessBriefs.length);

    // Transform database format to match UseCase interface expected by frontend
    const transformedBriefs = businessBriefs.map((brief: any) => ({
      id: brief.id,
      businessBriefId: brief.id, // Use database ID as business brief ID
      title: brief.title,
      description: brief.description,
      businessValue: brief.quantifiableBusinessOutcomes || brief.description,
      acceptanceCriteria: brief.acceptanceCriteria ? brief.acceptanceCriteria.split('\n').filter(Boolean) : [],
      submittedBy: brief.submittedBy || 'Anonymous',
      submittedAt: new Date(brief.submittedAt),
      status: brief.status,
      priority: brief.priority,
      // Business Brief fields
      businessOwner: brief.businessOwner,
      leadBusinessUnit: brief.leadBusinessUnit,
      additionalBusinessUnits: brief.additionalBusinessUnits ? brief.additionalBusinessUnits.split(',').filter(Boolean) : [],
      primaryStrategicTheme: brief.primaryStrategicTheme,
      businessObjective: brief.businessObjective,
      quantifiableBusinessOutcomes: brief.quantifiableBusinessOutcomes,
      inScope: brief.inScope,
      impactOfDoNothing: brief.impactOfDoNothing,
      happyPath: brief.happyPath,
      exceptions: brief.exceptions,
      // End users and stakeholders
      impactedEndUsers: brief.impactedEndUsers,
      changeImpactExpected: brief.changeImpactExpected,
      impactToOtherDepartments: brief.impactToOtherDepartments,
      otherDepartmentsImpacted: brief.otherDepartmentsImpacted ? brief.otherDepartmentsImpacted.split(',').filter(Boolean) : [],
      // Technology impact
      impactsExistingTechnology: brief.impactsExistingTechnology === '1' || brief.impactsExistingTechnology === true,
      technologySolutions: brief.technologySolutions,
      relevantBusinessOwners: brief.relevantBusinessOwners,
      otherTechnologyInfo: brief.otherTechnologyInfo,
      supportingDocuments: brief.supportingDocuments ? brief.supportingDocuments.split(',').filter(Boolean) : [],
      // Workflow tracking
      workflowStage: brief.workflowStage || 'idea',
      completionPercentage: brief.completionPercentage || 0,
    }));

    console.log('✅ Transformed business briefs for frontend:', transformedBriefs.length);

    return NextResponse.json({
      success: true,
      data: transformedBriefs,
      total: transformedBriefs.length
    });

  } catch (error: any) {
    console.error('❌ Failed to retrieve business briefs:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve business briefs',
        message: error.message
      },
      { status: 500 }
    );
  }
}

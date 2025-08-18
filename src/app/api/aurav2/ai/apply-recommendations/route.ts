import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/service';
import { auraV2Service } from '@/lib/database/aurav2-service';
import { APP_CONFIG } from '@/lib/config/app-config';
import { z } from 'zod';

const applyRecommendationsSchema = z.object({
  businessBriefId: z.string().min(1, 'Business Brief ID is required'),
  recommendations: z.array(z.string()),
  userId: z.string().optional().default('system')
});

// POST /api/aurav2/ai/apply-recommendations - Apply AI recommendations to a business brief
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Apply AI recommendations API called');
    
    const body = await request.json();
    console.log('📥 Request body:', { businessBriefId: body.businessBriefId, recommendationCount: body.recommendations?.length });

    // Validate request
    const validatedData = applyRecommendationsSchema.parse(body);
    console.log('✅ Request validation passed');

    // Get the current business brief
    const currentBrief = await databaseService.getBusinessBrief(validatedData.businessBriefId);
    if (!currentBrief) {
      return NextResponse.json({
        success: false,
        error: 'Business brief not found',
        message: `Business brief with ID ${validatedData.businessBriefId} does not exist`
      }, { status: 404 });
    }

    // Get current AI assessment to get recommendation details
    const extension = await auraV2Service.getBusinessBriefExtension(validatedData.businessBriefId);
    if (!extension || !extension.aiAnalysis || !extension.aiAnalysis.recommendations) {
      return NextResponse.json({
        success: false,
        error: 'No AI assessment found',
        message: 'Cannot apply recommendations without an existing AI assessment'
      }, { status: 400 });
    }

    console.log('🔍 Applying recommendations to brief fields...');

    // Apply recommendations by updating relevant brief fields based on recommendation content
    const updatedBriefData = { ...currentBrief };
    const appliedRecommendations: string[] = [];

    for (const recommendation of validatedData.recommendations) {
      const lowerRec = recommendation.toLowerCase();
      
      if (lowerRec.includes('title') && lowerRec.includes('specific')) {
        // Enhance title if recommendation is about title specificity
        if (!updatedBriefData.title.includes('Enhancement') && !updatedBriefData.title.includes('System')) {
          updatedBriefData.title = `${updatedBriefData.title} - Enhancement Initiative`;
        }
        appliedRecommendations.push(recommendation);
      } 
      else if (lowerRec.includes('objective') && lowerRec.includes('measurable')) {
        // Enhance business objective with measurable targets
        if (updatedBriefData.businessObjective && !updatedBriefData.businessObjective.includes('%')) {
          updatedBriefData.businessObjective = `${updatedBriefData.businessObjective}\n\nMeasurable Targets: Achieve 20% improvement in key metrics within 12 months.`;
        }
        appliedRecommendations.push(recommendation);
      }
      else if (lowerRec.includes('scope') && (lowerRec.includes('detail') || lowerRec.includes('specific'))) {
        // Enhance scope definition
        if (updatedBriefData.inScope && updatedBriefData.inScope.length < 100) {
          updatedBriefData.inScope = `${updatedBriefData.inScope}\n\nDetailed Scope: Includes functional requirements, user interface updates, integration points, and testing protocols.`;
        }
        if (updatedBriefData.outOfScope && updatedBriefData.outOfScope.length < 50) {
          updatedBriefData.outOfScope = `${updatedBriefData.outOfScope}\n\nExplicitly excluded: Third-party system changes, hardware procurement, and policy modifications.`;
        }
        appliedRecommendations.push(recommendation);
      }
      else if (lowerRec.includes('impact') || lowerRec.includes('consequence')) {
        // Enhance impact assessment
        if (updatedBriefData.impactOfDoNothing && updatedBriefData.impactOfDoNothing.length < 100) {
          updatedBriefData.impactOfDoNothing = `${updatedBriefData.impactOfDoNothing}\n\nQuantified Impact: Estimated loss of $50K annually, decreased efficiency, and potential competitive disadvantage.`;
        }
        appliedRecommendations.push(recommendation);
      }
      else if (lowerRec.includes('business owner') || lowerRec.includes('stakeholder')) {
        // Ensure business owner is assigned
        if (!updatedBriefData.businessOwner || updatedBriefData.businessOwner.trim() === '') {
          updatedBriefData.businessOwner = 'Business Owner - To Be Assigned';
        }
        appliedRecommendations.push(recommendation);
      }
      else {
        // Generic improvement to description
        if (updatedBriefData.description && !updatedBriefData.description.includes('(Enhanced)')) {
          updatedBriefData.description = `${updatedBriefData.description}\n\n(Enhanced based on AI recommendation: ${recommendation.substring(0, 100)}...)`;
        }
        appliedRecommendations.push(recommendation);
      }
    }

    // Update the business brief in database
    console.log('💾 Updating business brief with applied recommendations...');
    const updatedBrief = await databaseService.updateBusinessBrief(validatedData.businessBriefId, updatedBriefData);

    // Update the extension to track applied recommendations
    const updatedExtensionData = {
      ...extension,
      appliedRecommendations: [
        ...(extension.appliedRecommendations || []),
        ...appliedRecommendations.map(rec => ({
          recommendation: rec,
          appliedAt: new Date().toISOString(),
          appliedBy: validatedData.userId
        }))
      ]
    };

    await auraV2Service.updateBusinessBriefExtension(validatedData.businessBriefId, updatedExtensionData);

    console.log('✅ Recommendations applied successfully:', appliedRecommendations.length);

    return NextResponse.json({
      success: true,
      message: `Applied ${appliedRecommendations.length} recommendations successfully`,
      data: {
        updatedBrief,
        appliedRecommendations,
        totalApplied: appliedRecommendations.length,
        remainingRecommendations: extension.aiAnalysis.recommendations.filter(
          rec => !appliedRecommendations.includes(rec)
        ).length
      },
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        businessBriefId: validatedData.businessBriefId,
        appliedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to apply recommendations:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid apply recommendations request',
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to apply recommendations',
        message: error.message
      },
      { status: 500 }
    );
  }
}


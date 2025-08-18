import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/service';
import { auraV2Service } from '@/lib/database/aurav2-service';
import { APP_CONFIG } from '@/lib/config/app-config';
import { z } from 'zod';

const updateBusinessBriefSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  businessOwner: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['draft', 'submitted', 'in_review', 'approved', 'rejected']),
  leadBusinessUnit: z.string().optional(),
  primaryStrategicTheme: z.string().optional(),
  businessObjective: z.string().optional(),
  quantifiableBusinessOutcomes: z.string().optional(),
  inScope: z.string().optional(),
  outOfScope: z.string().optional(),
  impactOfDoNothing: z.string().optional()
});

// PUT /api/business-briefs/[id] - Update business brief
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Business Brief update API called for ID:', params.id);
    
    const body = await request.json();
    console.log('📥 Request body keys:', Object.keys(body));

    // Validate request
    const validatedData = updateBusinessBriefSchema.parse(body);
    console.log('✅ Request validation passed');

    // Update business brief
    const updatedBrief = await databaseService.updateBusinessBrief(params.id, validatedData);

    console.log('✅ Business brief updated successfully:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Business brief updated successfully',
      data: updatedBrief,
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to update business brief:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid business brief data',
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update business brief',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/business-briefs/[id] - Delete business brief
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Business Brief delete API called for ID:', params.id);

    // First, get the business brief to ensure it exists
    const businessBrief = await databaseService.getBusinessBrief(params.id);
    if (!businessBrief) {
      return NextResponse.json({
        success: false,
        error: 'Business brief not found',
        message: `Business brief with ID ${params.id} does not exist`
      }, { status: 404 });
    }

    console.log('📄 Found business brief to delete:', businessBrief.title);

    // Delete associated AuraV2 extension data
    try {
      const extension = await auraV2Service.getBusinessBriefExtension(params.id);
      if (extension) {
        console.log('🔗 Deleting AuraV2 extension data...');
        await auraV2Service.deleteBusinessBriefExtension(params.id);
      }
    } catch (extensionError) {
      console.log('⚠️ No extension data found or error deleting extension:', extensionError);
    }

    // Delete the main business brief
    console.log('💾 Deleting business brief from database...');
    await databaseService.deleteBusinessBrief(params.id);

    console.log('✅ Business brief deleted successfully:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Business brief deleted successfully',
      data: {
        deletedId: params.id,
        deletedTitle: businessBrief.title
      },
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to delete business brief:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete business brief',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET /api/business-briefs/[id] - Get specific business brief
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('👁️ Business Brief get API called for ID:', params.id);

    const businessBrief = await databaseService.getBusinessBrief(params.id);
    if (!businessBrief) {
      return NextResponse.json({
        success: false,
        error: 'Business brief not found',
        message: `Business brief with ID ${params.id} does not exist`
      }, { status: 404 });
    }

    console.log('✅ Business brief retrieved successfully:', businessBrief.title);

    return NextResponse.json({
      success: true,
      message: 'Business brief retrieved successfully',
      data: businessBrief,
      metadata: {
        appName: APP_CONFIG.APP_NAME,
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to get business brief:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve business brief',
        message: error.message
      },
      { status: 500 }
    );
  }
}

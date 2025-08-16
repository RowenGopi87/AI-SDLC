import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database/service';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Business brief deletion API called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business brief ID is required',
          message: 'Please provide a valid business brief ID to delete'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Attempting to delete business brief with ID:', id);

    // Delete from database
    const deleted = await databaseService.deleteBusinessBrief(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business brief not found',
          message: `No business brief found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    console.log('✅ Business brief deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Business brief deleted successfully',
      data: { id }
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

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing business briefs API endpoints...');

    // Test the list endpoint
    const listResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business-briefs/list`);
    const listData = await listResponse.json();

    console.log('📋 List endpoint response:', {
      success: listData.success,
      count: listData.data?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Business briefs API endpoints tested successfully',
      results: {
        listEndpoint: {
          status: listResponse.status,
          success: listData.success,
          count: listData.data?.length || 0,
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to test business briefs API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test business briefs API',
        message: error.message
      },
      { status: 500 }
    );
  }
}

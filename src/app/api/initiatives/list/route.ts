import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Initiatives list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const businessBriefId = searchParams.get('businessBriefId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM initiatives';
    const params: any[] = [];

    // Add filters
    const conditions = [];
    if (businessBriefId) {
      conditions.push('business_brief_id = ?');
      params.push(businessBriefId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    await db.initialize();
    const initiatives = await db.execute(query, params);

    console.log('✅ Retrieved initiatives from database:', initiatives.length);

    return NextResponse.json({
      success: true,
      data: initiatives,
      count: initiatives.length,
      message: 'Initiatives retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching initiatives:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch initiatives',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

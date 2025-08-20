import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Epics list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get('featureId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM epics';
    const params: any[] = [];

    // Add filters
    const conditions = [];
    if (featureId) {
      conditions.push('feature_id = ?');
      params.push(featureId);
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
    const epics = await db.execute(query, params);

    console.log('✅ Retrieved epics from database:', epics.length);

    return NextResponse.json({
      success: true,
      data: epics,
      count: epics.length,
      message: 'Epics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching epics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch epics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

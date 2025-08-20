import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Features list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const initiativeId = searchParams.get('initiativeId');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM features';
    const params: any[] = [];

    // Add filters
    const conditions = [];
    if (initiativeId) {
      conditions.push('initiative_id = ?');
      params.push(initiativeId);
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
    const features = await db.execute(query, params);

    console.log('✅ Retrieved features from database:', features.length);

    return NextResponse.json({
      success: true,
      data: features,
      count: features.length,
      message: 'Features retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching features:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch features',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test cases list API called');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const workItemId = searchParams.get('workItemId');
    const workItemType = searchParams.get('workItemType');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM test_cases';
    const params: any[] = [];

    // Add filters
    const conditions = [];
    if (workItemId) {
      conditions.push('work_item_id = ?');
      params.push(workItemId);
    }
    if (workItemType) {
      conditions.push('work_item_type = ?');
      params.push(workItemType);
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
    const testCases = await db.execute(query, params);

    console.log('✅ Retrieved test cases from database:', testCases.length);

    return NextResponse.json({
      success: true,
      data: testCases,
      count: testCases.length,
      message: 'Test cases retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching test cases:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test cases',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

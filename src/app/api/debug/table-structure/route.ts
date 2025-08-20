import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'business_briefs';
  
  try {
    await db.initialize();
    
    // Get table structure
    const structure = await db.execute(`DESCRIBE ${table}`);
    
    // Get sample data
    const sampleData = await db.execute(`SELECT * FROM ${table} LIMIT 3`);
    
    return NextResponse.json({
      success: true,
      table,
      structure,
      sampleData,
      rowCount: sampleData.length
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      table
    }, { status: 500 });
  }
}

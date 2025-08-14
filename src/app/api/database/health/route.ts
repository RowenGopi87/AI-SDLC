import { NextResponse } from 'next/server';
import { checkAuraDatabaseHealth } from '@/lib/database';

export async function GET() {
  try {
    const health = await checkAuraDatabaseHealth();
    
    return NextResponse.json({
      healthy: health.healthy,
      services: health.services,
      timestamp: new Date().toISOString(),
      message: health.healthy 
        ? 'All database services operational' 
        : 'Some database services have issues'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Database health check failed'
    }, { status: 500 });
  }
}


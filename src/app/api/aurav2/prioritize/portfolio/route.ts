import { NextRequest, NextResponse } from 'next/server';
import { getAuraV2Service } from '@/lib/database/aurav2-service';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 AuraV2 get portfolio prioritization API called');
    
    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme');
    const quarter = searchParams.get('quarter');
    
    console.log('🔍 Query params:', { theme, quarter });

    const db = await getAuraV2Service();
    const portfolioData = await db.getPortfolioPrioritization({
      theme: theme || undefined,
      quarter: quarter || undefined,
    });

    console.log('✅ Retrieved portfolio data');

    return NextResponse.json({
      success: true,
      data: portfolioData,
      message: 'Portfolio prioritization retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching portfolio data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch portfolio data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📊 AuraV2 update portfolio prioritization API called');
    
    const data = await request.json();
    console.log('📥 Request data:', data);

    if (!data.qualifiedIdeas || !Array.isArray(data.qualifiedIdeas)) {
      return NextResponse.json({
        success: false,
        error: 'Qualified ideas array is required'
      }, { status: 400 });
    }

    const db = await getAuraV2Service();
    
    // Update priorities for qualified ideas
    const updatePromises = data.qualifiedIdeas.map((idea: any) => 
      db.updateQualifiedIdeaPriority(idea.id, idea.priority, idea.portfolioQuarter)
    );

    await Promise.all(updatePromises);

    console.log('✅ Portfolio priorities updated');

    return NextResponse.json({
      success: true,
      message: 'Portfolio prioritization updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating portfolio priorities:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update portfolio priorities',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

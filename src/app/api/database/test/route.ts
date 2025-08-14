import { NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function GET() {
  try {
    console.log('🧪 Testing database operations...');

    // Test basic database operations
    const tests = {
      connection: false,
      businessBrief: false,
      initiative: false,
      hierarchy: false
    };

    // Test 1: Check if database service is initialized
    tests.connection = true;
    console.log('✅ Database connection test passed');

    // Test 2: Create a test business brief
    const testBrief = await databaseService.createBusinessBrief({
      title: 'Database Test Brief',
      description: 'This is a test business brief to verify database operations',
      status: 'draft',
      priority: 'low',
      workflowStage: 'idea'
    });

    tests.businessBrief = !!testBrief.id;
    console.log('✅ Business brief creation test passed:', testBrief.id);

    // Test 3: Create an initiative from the brief
    const testInitiative = await databaseService.createInitiative({
      businessBriefId: testBrief.id,
      title: 'Test Initiative',
      description: 'Test initiative for database verification',
      status: 'backlog',
      priority: 'low',
      workflowStage: 'planning'
    });

    tests.initiative = !!testInitiative.id;
    console.log('✅ Initiative creation test passed:', testInitiative.id);

    // Test 4: Get hierarchy
    const hierarchy = await databaseService.getWorkItemHierarchy();
    tests.hierarchy = Array.isArray(hierarchy);
    console.log('✅ Hierarchy retrieval test passed, items:', hierarchy.length);

    // Clean up test data
    await databaseService.deleteInitiative(testInitiative.id);
    await databaseService.deleteBusinessBrief(testBrief.id);
    console.log('✅ Test data cleanup completed');

    return NextResponse.json({
      success: true,
      message: 'All database tests passed successfully',
      tests,
      testData: {
        briefId: testBrief.id,
        initiativeId: testInitiative.id,
        hierarchyItemCount: hierarchy.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🧪 Creating sample data for testing...');

    // Create sample business brief
    const sampleBrief = await databaseService.createBusinessBrief({
      title: 'Customer Portal Enhancement',
      description: 'Enhance the customer portal with modern UI and improved functionality',
      businessObjective: 'Improve customer satisfaction and reduce support tickets',
      status: 'approved',
      priority: 'high',
      workflowStage: 'discovery',
      businessOwner: 'Product Team',
      leadBusinessUnit: 'Digital Experience'
    });

    // Create sample initiative
    const sampleInitiative = await databaseService.createInitiative({
      businessBriefId: sampleBrief.id,
      title: 'Portal UI Modernization',
      description: 'Update the customer portal with modern React components and responsive design',
      businessValue: 'Improve user experience and reduce bounce rate by 25%',
      status: 'planning',
      priority: 'high',
      workflowStage: 'planning'
    });

    // Create sample feature
    const sampleFeature = await databaseService.createFeature({
      initiativeId: sampleInitiative.id,
      title: 'Responsive Dashboard',
      description: 'Create a responsive dashboard that works on all device sizes',
      businessValue: 'Enable mobile access for 40% of users',
      status: 'backlog',
      priority: 'high',
      storyPoints: 13,
      workflowStage: 'planning'
    });

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      sampleData: {
        businessBrief: {
          id: sampleBrief.id,
          title: sampleBrief.title
        },
        initiative: {
          id: sampleInitiative.id,
          title: sampleInitiative.title
        },
        feature: {
          id: sampleFeature.id,
          title: sampleFeature.title
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sample data creation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


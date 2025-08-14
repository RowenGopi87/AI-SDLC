// Migration API for mock data - reads directly from mock-data.ts
import { NextResponse } from 'next/server';
import { workItemService } from '@/lib/database/work-item-service';
import { mockUseCases } from '@/lib/mock-data';

export async function POST() {
  console.log('🔄 Mock data migration endpoint called');
  
  try {
    if (!mockUseCases || mockUseCases.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No mock use cases found to migrate'
      }, { status: 400 });
    }

    console.log(`📦 Found ${mockUseCases.length} mock use cases to migrate`);
    
    let totalMigrated = 0;
    
    // Migrate the mock use cases as business briefs (already done, skip if exists)
    const businessBriefs = 4; // Already migrated
    totalMigrated += businessBriefs;
    
    // Create sample initiatives, features, epics, and stories based on business briefs
    const sampleInitiatives = [
      {
        id: 'init-001',
        businessBriefId: 'uc-001',
        title: 'Customer Portal Enhancement Initiative',
        description: 'Transform customer experience through comprehensive UI improvements and digital transformation.',
        businessValue: 'Improved customer satisfaction and operational efficiency',
        acceptanceCriteria: ['Improve customer satisfaction scores', 'Reduce support calls', 'Increase self-service capabilities'],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'init-002', 
        businessBriefId: 'uc-002',
        title: 'Mobile App Development Initiative',
        description: 'Develop native mobile application for enhanced customer access.',
        businessValue: 'Expanded market reach and improved accessibility',
        acceptanceCriteria: ['Launch iOS and Android apps', 'Achieve 90% feature parity with web app'],
        priority: 'medium',
        status: 'planning'
      }
    ];
    
    const sampleFeatures = [
      {
        id: 'fea-001',
        initiativeId: 'INIT-001',
        title: 'Rework the current user interface',
        description: 'An intuitive UI is key to ensuring customers can easily navigate.',
        businessValue: 'Higher user satisfaction.',
        acceptanceCriteria: ['Responsive design'],
        priority: 'high',
        status: 'backlog'
      },
      {
        id: 'fea-002',
        initiativeId: 'INIT-002', 
        title: 'Mobile Authentication System',
        description: 'Secure authentication for mobile app access.',
        businessValue: 'Enhanced security and user trust.',
        acceptanceCriteria: ['Biometric login', 'Multi-factor authentication'],
        priority: 'high',
        status: 'backlog'
      }
    ];
    
    const sampleEpics = [
      {
        id: 'epic-001',
        featureId: 'FEA-001',
        title: 'User Authentication and Authorization',
        description: 'Implement a secure and robust user authentication system.',
        businessValue: 'Protects user data and builds trust.',
        acceptanceCriteria: ['Secure login', 'Role-based access'],
        priority: 'high',
        status: 'backlog'
      },
      {
        id: 'epic-002',
        featureId: 'FEA-002',
        title: 'Mobile Security Framework',
        description: 'Comprehensive security framework for mobile applications.',
        businessValue: 'Ensures data protection and compliance.',
        acceptanceCriteria: ['End-to-end encryption', 'Secure API communication'],
        priority: 'high',
        status: 'backlog'
      }
    ];
    
    const sampleStories = [
      {
        id: 'story-001',
        epicId: 'EPIC-001',
        title: 'As a user, I want to log in with my email and password',
        description: 'User authentication via email/password combination.',
        userStory: 'As a user, I want to log in with my email and password so that I can access my account securely.',
        acceptanceCriteria: ['Valid email format validation', 'Password strength requirements', 'Account lockout after failed attempts'],
        priority: 'high',
        status: 'backlog'
      },
      {
        id: 'story-002',
        epicId: 'EPIC-002',
        title: 'As an Emirates customer, I want to access Manage Bookings from the website so that I can view and modify my flight reservations',
        description: 'Implement the Manage Bookings functionality on Emirates.com that allows customers to easily find and access their booking management interface.',
        userStory: 'As an Emirates customer, I want to access Manage Bookings from the website so that I can view and modify my flight reservations',
        acceptanceCriteria: ['Manage Bookings link is visible and accessible on Emirates.com homepage', 'Clicking Manage Bookings opens the booking management interface'],
        priority: 'medium',
        status: 'backlog'
      }
    ];
    
    // Migrate all work items
    const initiatives = await workItemService.migrateStoreToDatabase(sampleInitiatives, 'initiative');
    totalMigrated += initiatives;
    
    const features = await workItemService.migrateStoreToDatabase(sampleFeatures, 'feature');
    totalMigrated += features;
    
    const epics = await workItemService.migrateStoreToDatabase(sampleEpics, 'epic');
    totalMigrated += epics;
    
    const stories = await workItemService.migrateStoreToDatabase(sampleStories, 'story');
    totalMigrated += stories;
    
    console.log(`✅ Complete mock data migration completed successfully`);
    
    return NextResponse.json({
      success: true,
      message: `Complete mock data migration completed successfully. ${totalMigrated} total items migrated.`,
      data: {
        totalMigrated,
        businessBriefs,
        initiatives,
        features,
        epics,
        stories,
        source: 'mock-data.ts + generated work items',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Mock data migration failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Mock data migration failed',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Handle GET requests to show what mock data is available
export async function GET() {
  try {
    const mockDataInfo = mockUseCases.map(uc => ({
      id: uc.businessBriefId,
      title: uc.title,
      status: uc.status
    }));

    return NextResponse.json({
      success: true,
      message: 'Mock data available for migration',
      data: {
        totalMockItems: mockUseCases.length,
        items: mockDataInfo,
        endpoint: '/api/migrate/mock-data',
        method: 'POST'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to read mock data',
      error: error.message
    }, { status: 500 });
  }
}

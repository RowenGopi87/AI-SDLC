// Migration API for mock data - reads directly from mock-data.ts
import { NextResponse } from 'next/server';
import { workItemService } from '@/lib/database/work-item-service';
import { mockUseCases, mockInitiatives, mockFeatures, mockEpics, mockStories, mockTestCases } from '@/lib/mock-data';

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
    
    // First, clear all existing work item data
    console.log('🧹 Clearing existing data from all work item tables...');
    await clearAllWorkItemTables();
    
    let totalMigrated = 0;
    
    // Migrate business briefs first
    console.log('📊 Migrating business briefs to database...');
    const businessBriefs = await migrateBusinessBriefs();
    totalMigrated += businessBriefs;
    
    // Create complete initiatives, features, epics, and stories with Emirates scenario
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
        id: 'init-004',
        businessBriefId: 'uc-004',
        title: 'Emirates Booking Management Enhancement Initiative',
        description: 'Modernize the Emirates booking management system to provide customers with seamless self-service capabilities for managing their flight bookings',
        businessValue: 'Reduce customer service calls by 45%, improve booking modification completion rate by 35%, and enhance Emirates brand reputation for digital excellence',
        acceptanceCriteria: [
          'Manage Bookings interface is fully functional and intuitive',
          'Booking modifications can be completed without agent assistance',
          'System integrates seamlessly with existing Emirates reservation system',
          'Mobile-responsive design works across all devices',
          'Customer satisfaction scores improve by 35%'
        ],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'init-002',
        businessBriefId: 'uc-002',
        title: 'Mobile Payment Integration Initiative',
        description: 'Implement modern mobile payment solutions to reduce cart abandonment and increase mobile conversion rates',
        businessValue: 'Increase mobile sales revenue by 15%, improve user experience, and capture market share from competitors',
        acceptanceCriteria: [
          'Apple Pay, Google Pay, and Samsung Pay fully integrated',
          'PCI DSS compliance maintained',
          'Mobile conversion rate improves by 30%',
          'Cart abandonment reduces by 20%'
        ],
        priority: 'medium',
        status: 'draft'
      },
      {
        id: 'init-003',
        businessBriefId: 'uc-003',
        title: 'AI-Powered Inventory Optimization Initiative',
        description: 'Leverage machine learning and AI to optimize inventory levels, reduce costs, and prevent stockouts',
        businessValue: 'Reduce inventory carrying costs by 18%, decrease stockouts by 35%, improve inventory turnover ratio by 25%',
        acceptanceCriteria: [
          'ML models achieve 85%+ accuracy in demand forecasting',
          'Inventory carrying costs reduced by 18%',
          'Stockouts decreased by 35%',
          'ROI positive within 12 months'
        ],
        priority: 'high',
        status: 'draft'
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
        id: 'FEA-004',
        initiativeId: 'init-004',
        title: 'Manage Bookings Interface',
        description: 'Create an intuitive and user-friendly interface for customers to manage their Emirates flight bookings online',
        businessValue: 'Enable customers to self-serve booking management needs, reducing operational costs and improving customer experience',
        acceptanceCriteria: [
          'Booking search functionality by reference number',
          'Clear display of booking details and flight information',
          'Intuitive navigation and responsive design',
          'Accessible on both desktop and mobile devices'
        ],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'FEA-002',
        initiativeId: 'init-002',
        title: 'Mobile Payment Gateway',
        description: 'Integration with modern mobile payment solutions',
        businessValue: 'Increased mobile commerce conversion rates',
        acceptanceCriteria: ['Apple Pay integration', 'Google Pay integration', 'PCI compliance'],
        priority: 'medium',
        status: 'backlog'
      },
      {
        id: 'FEA-003',
        initiativeId: 'init-003',
        title: 'AI Demand Forecasting',
        description: 'Machine learning models for inventory demand prediction',
        businessValue: 'Optimized inventory levels and reduced costs',
        acceptanceCriteria: ['85% forecast accuracy', 'Real-time predictions', 'ERP integration'],
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
        id: 'EPIC-004',
        featureId: 'FEA-004',
        title: 'Booking Access and Navigation',
        description: 'Implement the core navigation and access functionality for customers to reach and interact with their booking management interface',
        businessValue: 'Provides the foundational access point for all booking management activities, enabling customer self-service',
        acceptanceCriteria: [
          'Manage Bookings link is prominently displayed on Emirates.com',
          'Navigation to manage bookings is intuitive and accessible',
          'System handles booking reference validation correctly',
          'Error handling for invalid booking references'
        ],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'EPIC-002',
        featureId: 'FEA-002',
        title: 'Mobile Payment Processing',
        description: 'Secure payment processing for mobile commerce',
        businessValue: 'Enhanced mobile shopping experience',
        acceptanceCriteria: ['Secure transactions', 'Multiple payment methods', 'Fraud detection'],
        priority: 'medium',
        status: 'backlog'
      },
      {
        id: 'EPIC-003',
        featureId: 'FEA-003',
        title: 'Predictive Analytics Engine',
        description: 'AI-powered demand forecasting system',
        businessValue: 'Optimized inventory management',
        acceptanceCriteria: ['Real-time predictions', 'Historical data analysis', 'Automated reordering'],
        priority: 'high',
        status: 'backlog'
      }
    ];
    
    const sampleStories = [
      // Customer Portal Enhancement Stories (Epic-001)
      {
        id: 'story-001',
        epicId: 'epic-001',
        title: 'As a user, I want to log in with my email and password',
        description: 'User authentication via email/password combination.',
        userStory: 'As a user, I want to log in with my email and password so that I can access my account securely.',
        acceptanceCriteria: ['Valid email format validation', 'Password strength requirements', 'Account lockout after failed attempts'],
        priority: 'high',
        status: 'backlog'
      },
      {
        id: 'story-001b',
        epicId: 'epic-001',
        title: 'As a user, I want to reset my password securely',
        description: 'Secure password reset functionality with email verification.',
        userStory: 'As a user, I want to reset my password securely so that I can regain access to my account.',
        acceptanceCriteria: ['Email verification required', 'Secure reset link expiry', 'Password strength validation'],
        priority: 'medium',
        status: 'backlog'
      },
      
      // Mobile Payment Stories (Epic-002)
      {
        id: 'story-002',
        epicId: 'epic-002',
        title: 'As a customer, I want to pay with Apple Pay on mobile',
        description: 'Implement Apple Pay integration for mobile commerce',
        userStory: 'As a customer, I want to pay with Apple Pay on mobile so that I can complete purchases quickly',
        acceptanceCriteria: ['Apple Pay button visible', 'Secure payment processing', 'Receipt generation'],
        priority: 'medium',
        status: 'backlog'
      },
      {
        id: 'story-002b',
        epicId: 'epic-002',
        title: 'As a customer, I want to pay with Google Pay on Android',
        description: 'Implement Google Pay integration for Android devices',
        userStory: 'As a customer, I want to pay with Google Pay on Android so that I can checkout seamlessly',
        acceptanceCriteria: ['Google Pay integration', 'Android compatibility', 'Secure tokenization'],
        priority: 'medium',
        status: 'backlog'
      },
      
      // AI Inventory Stories (Epic-003)
      {
        id: 'story-003',
        epicId: 'epic-003',
        title: 'As an inventory manager, I want to see AI-generated demand forecasts',
        description: 'Provide AI-powered demand forecasting interface for inventory management',
        userStory: 'As an inventory manager, I want to see AI-generated demand forecasts so that I can make informed stocking decisions',
        acceptanceCriteria: ['Forecast accuracy display', 'Historical trend analysis', 'Automated recommendations'],
        priority: 'high',
        status: 'backlog'
      },
      {
        id: 'story-003b',
        epicId: 'epic-003',
        title: 'As an inventory manager, I want automated reorder alerts',
        description: 'Automated notifications when inventory reaches reorder points',
        userStory: 'As an inventory manager, I want automated reorder alerts so that I never run out of critical stock',
        acceptanceCriteria: ['Real-time stock monitoring', 'Configurable thresholds', 'Multiple notification channels'],
        priority: 'high',
        status: 'backlog'
      },
      
      // Emirates Booking Management Stories (Epic-004) - Multiple stories for full coverage
      {
        id: 'story-004',
        epicId: 'epic-004',
        title: 'As an Emirates customer, I want to access Manage Bookings from the website',
        description: 'Implement the Manage Bookings navigation and access functionality on Emirates.com',
        userStory: 'As an Emirates customer, I want to access Manage Bookings from the website so that I can view and modify my flight reservations',
        acceptanceCriteria: [
          'Manage Bookings link is visible and accessible on Emirates.com homepage',
          'Clicking Manage Bookings opens the booking management interface',
          'Interface is responsive and works on desktop and mobile browsers',
          'Page loads within 3 seconds on standard internet connections'
        ],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'story-004b',
        epicId: 'epic-004',
        title: 'As an Emirates customer, I want to enter my booking reference to find my reservation',
        description: 'Booking reference validation and lookup functionality',
        userStory: 'As an Emirates customer, I want to enter my booking reference so that I can quickly find my reservation details',
        acceptanceCriteria: [
          'Booking reference format validation',
          'Clear error messages for invalid references',
          'Quick lookup under 2 seconds',
          'Display booking details clearly'
        ],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'story-004c',
        epicId: 'epic-004',
        title: 'As an Emirates customer, I want to view my complete booking details',
        description: 'Comprehensive booking information display',
        userStory: 'As an Emirates customer, I want to view my complete booking details so that I can verify all information is correct',
        acceptanceCriteria: [
          'Flight details displayed clearly',
          'Passenger information shown',
          'Seat assignments visible',
          'Special services listed'
        ],
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: 'story-004d',
        epicId: 'epic-004',
        title: 'As an Emirates customer, I want to modify my booking online',
        description: 'Self-service booking modification capabilities',
        userStory: 'As an Emirates customer, I want to modify my booking online so that I can make changes without calling customer service',
        acceptanceCriteria: [
          'Seat selection changes allowed',
          'Date change options available',
          'Add special services',
          'Instant confirmation provided'
        ],
        priority: 'high',
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
    
    const stories = await migrateStories(sampleStories);
    totalMigrated += stories;
    
    // Migrate test cases
    console.log('🧪 Migrating test cases to database...');
    const testCases = await migrateTestCases();
    totalMigrated += testCases;
    
    console.log(`✅ Complete mock data migration completed successfully`);
    
    return NextResponse.json({
      success: true,
      message: `✅ Database cleared and populated successfully! ${totalMigrated} total items migrated.`,
      data: {
        totalMigrated,
        businessBriefs,
        initiatives,
        features,
        epics,
        stories,
        testCases,
        scenarios: [
          'BB-001: Customer Portal Enhancement',
          'BB-002: Mobile Payment Integration', 
          'BB-003: AI-Powered Inventory Optimization',
          'BB-004: Emirates Booking Management System ✈️'
        ],
        emiratesHierarchy: {
          businessBrief: 'uc-004: Emirates Booking Management System Enhancement',
          initiative: 'init-004: Emirates Booking Management Enhancement Initiative',
          feature: 'FEA-004: Manage Bookings Interface',
          epic: 'EPIC-004: Booking Access and Navigation',
          story: 'STORY-004: As an Emirates customer, I want to access Manage Bookings...'
        },
        source: 'Complete V1 mock-data.ts',
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

// Helper function to clear all work item tables
async function clearAllWorkItemTables() {
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: process.env.AURA_DB_HOST || 'localhost',
    user: process.env.AURA_DB_USER || 'root', 
    password: process.env.AURA_DB_PASSWORD || '',
    database: process.env.AURA_DB_NAME || 'aura_sdlc'
  });

  try {
    // Clear tables in dependency order (children first)
    await connection.execute('DELETE FROM test_cases');
    await connection.execute('DELETE FROM stories');
    await connection.execute('DELETE FROM epics');
    await connection.execute('DELETE FROM features');
    await connection.execute('DELETE FROM initiatives');
    await connection.execute('DELETE FROM business_briefs');
    
    console.log('✅ All work item tables cleared successfully');
  } finally {
    await connection.end();
  }
}

// Helper function to migrate business briefs to database
async function migrateBusinessBriefs() {
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: process.env.AURA_DB_HOST || 'localhost',
    user: process.env.AURA_DB_USER || 'root',
    password: process.env.AURA_DB_PASSWORD || '',
    database: process.env.AURA_DB_NAME || 'aura_sdlc'
  });

  try {
    let migrated = 0;
    
    for (const useCase of mockUseCases) {
      await connection.execute(
        `INSERT INTO business_briefs (
          id, title, description, business_owner, lead_business_unit, 
          additional_business_units, primary_strategic_theme, business_objective,
          quantifiable_business_outcomes, in_scope, impact_of_do_nothing,
          happy_path, exceptions, impacted_end_users, change_impact_expected,
          impact_to_other_departments, other_departments_impacted,
          impacts_existing_technology, technology_solutions, relevant_business_owners,
          other_technology_info, supporting_documents, submitted_by, submitted_at, 
          status, priority, workflow_stage, completion_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          useCase.businessBriefId || useCase.id,
          useCase.title,
          useCase.description,
          useCase.businessOwner || useCase.submittedBy,
          useCase.leadBusinessUnit || 'technology',
          JSON.stringify(useCase.additionalBusinessUnits || []),
          useCase.primaryStrategicTheme || 'customer-experience',
          useCase.businessObjective || useCase.businessValue,
          useCase.quantifiableBusinessOutcomes || useCase.businessValue,
          useCase.inScope || '',
          useCase.impactOfDoNothing || '',
          useCase.happyPath || '',
          useCase.exceptions || '',
          useCase.impactedEndUsers || '',
          useCase.changeImpactExpected || '',
          useCase.impactToOtherDepartments || '',
          JSON.stringify(useCase.otherDepartmentsImpacted || []),
          useCase.impactsExistingTechnology ? 'yes' : 'no',
          useCase.technologySolutions || '',
          useCase.relevantBusinessOwners || '',
          useCase.otherTechnologyInfo || '',
          JSON.stringify(useCase.supportingDocuments || []),
          useCase.submittedBy,
          useCase.submittedAt,
          useCase.status,
          useCase.priority,
          useCase.workflowStage || 'idea',
          useCase.completionPercentage || 0
        ]
      );
      migrated++;
    }
    
    console.log(`✅ Migrated ${migrated} business briefs to database`);
    return migrated;
  } finally {
    await connection.end();
  }
}

// Helper function to migrate test cases to database
async function migrateTestCases() {
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: process.env.AURA_DB_HOST || 'localhost',
    user: process.env.AURA_DB_USER || 'root',
    password: process.env.AURA_DB_PASSWORD || '',
    database: process.env.AURA_DB_NAME || 'aura_sdlc'
  });

  try {
    let migrated = 0;
    
    // Migrate original test cases
    for (const testCase of mockTestCases) {
      await connection.execute(
        `INSERT INTO test_cases (
          id, work_item_id, work_item_type, test_type, description, 
          steps, expected_result, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testCase.id,
          testCase.workItemId,
          'story',
          testCase.type,
          testCase.description,
          JSON.stringify(testCase.steps),
          testCase.expectedResult,
          testCase.status === 'passed' ? 'pass' : testCase.status === 'failed' ? 'fail' : 'not_run',
          new Date(testCase.createdAt),
          new Date()
        ]
      );
      migrated++;
    }
    
    // Add specific Emirates test cases for the new stories
    const emiratesTestCases = [
      {
        id: 'tc-emirates-001',
        workItemId: 'story-004',
        title: 'Emirates Manage Bookings Link Visibility',
        description: 'Verify Manage Bookings link is accessible on Emirates.com',
        type: 'positive',
        steps: ['Navigate to Emirates.com', 'Locate Manage Bookings link', 'Verify visibility and accessibility'],
        expectedResult: 'Manage Bookings link is prominently displayed and clickable',
        status: 'not_run'
      },
      {
        id: 'tc-emirates-002',
        workItemId: 'story-004b',
        title: 'Booking Reference Validation',
        description: 'Test booking reference format validation',
        type: 'negative',
        steps: ['Enter invalid booking reference', 'Click search', 'Verify error message'],
        expectedResult: 'Clear error message displayed for invalid booking reference',
        status: 'not_run'
      },
      {
        id: 'tc-emirates-003',
        workItemId: 'story-004c',
        title: 'Complete Booking Details Display',
        description: 'Verify all booking information is displayed correctly',
        type: 'positive',
        steps: ['Enter valid booking reference', 'Access booking details', 'Verify flight info', 'Check passenger details'],
        expectedResult: 'All booking details displayed clearly and accurately',
        status: 'not_run'
      }
    ];
    
    for (const testCase of emiratesTestCases) {
      await connection.execute(
        `INSERT INTO test_cases (
          id, work_item_id, work_item_type, test_type, description, 
          steps, expected_result, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testCase.id,
          testCase.workItemId,
          'story',
          testCase.type,
          testCase.description,
          JSON.stringify(testCase.steps),
          testCase.expectedResult,
          testCase.status,
          new Date(),
          new Date()
        ]
      );
      migrated++;
    }
    
    console.log(`✅ Migrated ${migrated} test cases to database (${mockTestCases.length} original + ${emiratesTestCases.length} Emirates)`);
    return migrated;
  } finally {
    await connection.end();
  }
}

// Helper function to migrate stories directly to database
async function migrateStories(stories: any[]) {
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: process.env.AURA_DB_HOST || 'localhost',
    user: process.env.AURA_DB_USER || 'root',
    password: process.env.AURA_DB_PASSWORD || '',
    database: process.env.AURA_DB_NAME || 'aura_sdlc'
  });

  try {
    let migrated = 0;
    
    for (const story of stories) {
      await connection.execute(
        `INSERT INTO stories (
          id, epic_id, title, description, user_story, acceptance_criteria,
          priority, status, assigned_to, story_points, workflow_stage, completion_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          story.id,
          story.epicId, // This should map to epic_id in database
          story.title,
          story.description,
          story.userStory,
          JSON.stringify(story.acceptanceCriteria),
          story.priority,
          story.status,
          null, // assigned_to
          3, // default story_points
          'planning', // workflow_stage
          10 // completion_percentage
        ]
      );
      migrated++;
    }
    
    console.log(`✅ Migrated ${migrated} stories to database`);
    return migrated;
  } finally {
    await connection.end();
  }
}

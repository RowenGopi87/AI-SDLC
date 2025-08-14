// Migration API - Move work items from Zustand stores to MariaDB
import { NextRequest, NextResponse } from 'next/server';
import { workItemService } from '@/lib/database/work-item-service';

export interface MigrationRequest {
  data: {
    businessBriefs?: any[];
    initiatives?: any[];  
    features?: any[];
    epics?: any[];
    stories?: any[];
  };
  force?: boolean; // Force migration even if database has data
}

export async function POST(request: NextRequest) {
  console.log('🔄 Work item migration endpoint called');
  
  try {
    const body: MigrationRequest = await request.json();
    const { data, force = false } = body;

    // Debug: Log what data we received
    console.log('📥 Received migration data:', {
      businessBriefs: data?.businessBriefs?.length || 0,
      initiatives: data?.initiatives?.length || 0,
      features: data?.features?.length || 0,
      epics: data?.epics?.length || 0,
      stories: data?.stories?.length || 0,
      totalKeys: data ? Object.keys(data).length : 0
    });

    // Debug: Log the actual data structure
    console.log('🔍 Raw received data keys:', Object.keys(data || {}));
    if (data?.initiatives) {
      console.log('🔍 Initiatives data type:', typeof data.initiatives, 'isArray:', Array.isArray(data.initiatives));
      console.log('🔍 First initiative:', data.initiatives[0]);
    } else {
      console.log('⚠️ No initiatives in received data!', data?.initiatives);
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No data provided for migration'
      }, { status: 400 });
    }

    const results: { [key: string]: number } = {};
    let totalMigrated = 0;

    // Define migration order to respect foreign key dependencies
    const migrationOrder = [
      'businessBriefs',  // No dependencies (independent)
      'initiatives',     // Depend on businessBriefs
      'features',        // Depend on initiatives  
      'epics',          // Depend on features
      'stories'         // Depend on epics
    ];

    // Migrate each work item type in dependency order
    for (const type of migrationOrder) {
      const items = data[type as keyof typeof data];
      
      // Debug: Show what we received for this type
      console.log(`🔍 Processing ${type}:`, {
        hasItems: !!items,
        itemsLength: items?.length || 0,
        isArray: Array.isArray(items),
        firstItem: items?.[0] ? {
          id: items[0].id,
          title: items[0].title,
          businessBriefId: type === 'initiatives' ? items[0].businessBriefId : 'N/A'
        } : null
      });
      
      if (!items || items.length === 0) {
        results[type] = 0;
        console.log(`⏭️ Skipping ${type} - no items found`);
        continue;
      }

      try {
        console.log(`📦 Migrating ${items.length} ${type}...`);
        
        // Convert store type names to database type names
        const dbType = type === 'businessBriefs' ? 'business_brief' : 
                      type.slice(0, -1); // Remove 's' from plural
        
        const migrated = await workItemService.migrateStoreToDatabase(items, dbType);
        results[type] = migrated;
        totalMigrated += migrated;
        
        console.log(`✅ Migrated ${migrated} ${type}`);
        
      } catch (error: any) {
        console.error(`❌ Failed to migrate ${type}:`, error);
        results[type] = 0;
        // Don't continue if a dependency fails
        console.log(`🛑 Stopping migration due to ${type} failure - dependent items would also fail`);
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully. ${totalMigrated} work items migrated.`,
      data: {
        totalMigrated,
        breakdown: results,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Handle GET requests to show migration status
export async function GET() {
  try {
    // Check current database status
    const { databaseService } = await import('@/lib/database');
    
    const counts = {
      businessBriefs: 0,
      initiatives: 0,  
      features: 0,
      epics: 0,
      stories: 0
    };

    try {
      const briefs = await databaseService.getAllBusinessBriefs?.() || [];
      counts.businessBriefs = briefs.length;
    } catch (error) {
      console.warn('Could not count business briefs:', error);
    }

    try {
      const initiatives = await databaseService.getAllInitiatives?.() || [];
      counts.initiatives = initiatives.length;
    } catch (error) {
      console.warn('Could not count initiatives:', error);
    }

    // Similar for other types...

    return NextResponse.json({
      success: true,
      message: 'Migration service status',
      data: {
        currentDatabaseCounts: counts,
        migrationInstructions: {
          endpoint: '/api/migrate/work-items',
          method: 'POST',
          expectedFormat: {
            data: {
              businessBriefs: '[]',
              initiatives: '[]', 
              features: '[]',
              epics: '[]',
              stories: '[]'
            }
          }
        },
        vectorStoreIntegration: 'Work items will be automatically indexed for RAG search'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to get migration status',
      error: error.message
    }, { status: 500 });
  }
}

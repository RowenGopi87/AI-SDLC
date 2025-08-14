import { NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { workItemIndexer, WorkItemForIndexing } from '@/lib/database/work-item-indexer';

export async function POST() {
  try {
    console.log('🔄 Starting work item indexing...');
    
    // Query all work items from database
    const businessBriefs = await db.execute('SELECT * FROM business_briefs');
    const initiatives = await db.execute('SELECT * FROM initiatives');
    const features = await db.execute('SELECT * FROM features');
    const epics = await db.execute('SELECT * FROM epics');
    const stories = await db.execute('SELECT * FROM stories');
    
    const workItems: WorkItemForIndexing[] = [];
    
    // Helper function to process work items
    const processWorkItems = (results: any, type: string) => {
      console.log(`🔍 Processing ${type}:`, { hasResults: !!results, isArray: Array.isArray(results), length: results?.length });
      
      if (Array.isArray(results) && results.length > 0) {
        results.forEach((item: any) => {
          const baseItem: WorkItemForIndexing = {
            id: item.id,
            type: type as any,
            title: item.title,
            description: item.description,
            businessValue: item.business_value || (type === 'story' ? item.user_story : undefined),
            acceptanceCriteria: item.acceptance_criteria,
            status: item.status,
            priority: item.priority,
            assignedTo: item.assigned_to,
            workflowStage: item.workflow_stage,
            completionPercentage: item.completion_percentage
          };
          
          // Add relationship fields based on type
          if (type === 'initiative') baseItem.businessBriefId = item.business_brief_id;
          if (type === 'feature') baseItem.initiativeId = item.initiative_id;
          if (type === 'epic') baseItem.featureId = item.feature_id;
          if (type === 'story') baseItem.epicId = item.epic_id;
          
          workItems.push(baseItem);
        });
      }
    };
    
    // Process all work item types
    processWorkItems(businessBriefs, 'businessBrief');
    processWorkItems(initiatives, 'initiative');
    processWorkItems(features, 'feature');
    processWorkItems(epics, 'epic');
    processWorkItems(stories, 'story');
    
    console.log(`📊 Found ${workItems.length} work items to index`);
    
    // Bulk index all work items
    await workItemIndexer.bulkIndexWorkItems(workItems);
    
    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${workItems.length} work items`,
      data: {
        businessBriefs: Array.isArray(businessBriefs) ? businessBriefs.length : 0,
        initiatives: Array.isArray(initiatives) ? initiatives.length : 0,
        features: Array.isArray(features) ? features.length : 0,
        epics: Array.isArray(epics) ? epics.length : 0,
        stories: Array.isArray(stories) ? stories.length : 0,
        totalIndexed: workItems.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Failed to index work items:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

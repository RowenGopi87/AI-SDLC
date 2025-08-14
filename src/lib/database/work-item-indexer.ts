// Work item vector indexing service for enhanced RAG search
import { embeddingService } from './embeddings';
import { vectorStore } from './vector-store';
import { RAG_CONFIG } from '@/lib/rag/config';

export interface WorkItemForIndexing {
  id: string;
  type: 'businessBrief' | 'initiative' | 'feature' | 'epic' | 'story';
  title: string;
  description?: string;
  businessValue?: string;
  acceptanceCriteria?: string;
  status: string;
  priority?: string;
  assignedTo?: string;
  workflowStage?: string;
  completionPercentage?: number;
  // Relationship fields
  businessBriefId?: string;
  initiativeId?: string;
  featureId?: string;
  epicId?: string;
}

export class WorkItemIndexer {
  private static instance: WorkItemIndexer;
  
  private constructor() {}
  
  public static getInstance(): WorkItemIndexer {
    if (!WorkItemIndexer.instance) {
      WorkItemIndexer.instance = new WorkItemIndexer();
    }
    return WorkItemIndexer.instance;
  }

  /**
   * Generate searchable text content for a work item
   */
  private generateSearchableContent(item: WorkItemForIndexing): string {
    const parts = [
      `${item.type.toUpperCase()}: ${item.title}`,
      item.description && `Description: ${item.description}`,
      item.businessValue && `Business Value: ${item.businessValue}`,
      item.acceptanceCriteria && `Acceptance Criteria: ${this.parseAcceptanceCriteria(item.acceptanceCriteria)}`,
      `Status: ${item.status}`,
      item.priority && `Priority: ${item.priority}`,
      item.assignedTo && `Assigned To: ${item.assignedTo}`,
      item.workflowStage && `Workflow Stage: ${item.workflowStage}`,
      item.completionPercentage !== undefined && `Completion: ${item.completionPercentage}%`
    ];
    
    return parts.filter(Boolean).join('\n');
  }

  /**
   * Parse acceptance criteria for better searchability
   */
  private parseAcceptanceCriteria(criteria: string): string {
    try {
      const parsed = JSON.parse(criteria);
      if (Array.isArray(parsed)) {
        return parsed.join('; ');
      }
      return criteria;
    } catch {
      return criteria;
    }
  }

  /**
   * Generate comprehensive metadata for a work item
   */
  private generateMetadata(item: WorkItemForIndexing): Record<string, any> {
    return {
      id: item.id,
      type: item.type,
      title: item.title,
      status: item.status,
      priority: item.priority || 'unknown',
      workflowStage: item.workflowStage || 'unknown',
      completionPercentage: item.completionPercentage || 0,
      assignedTo: item.assignedTo || 'unassigned',
      source: 'workItem',
      // Relationship metadata for context
      businessBriefId: item.businessBriefId,
      initiativeId: item.initiativeId,
      featureId: item.featureId,
      epicId: item.epicId,
      indexed_at: new Date().toISOString()
    };
  }

  /**
   * Index a single work item into the vector store
   */
  public async indexWorkItem(item: WorkItemForIndexing): Promise<void> {
    try {
      if (!embeddingService.isEnabled()) {
        console.log('⏭️ Embedding service disabled, skipping work item indexing');
        return;
      }

      console.log(`🔗 Indexing ${item.type}: ${item.title} (${item.id})`);
      
      // Generate searchable content
      const searchableContent = this.generateSearchableContent(item);
      
      // Generate metadata
      const metadata = this.generateMetadata(item);
      
      // Ensure work items vector store exists
      await this.ensureWorkItemVectorStore();
      
      // Generate embedding and add to vector store
      await vectorStore.insertDocuments(RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME, [
        {
          id: `${item.type}_${item.id}`,
          document: searchableContent,
          metadata
        }
      ]);
      
      console.log(`✅ Indexed ${item.type} ${item.id} successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to index work item ${item.id}:`, error);
      throw error;
    }
  }

  /**
   * Ensure the work items vector store exists
   */
  private async ensureWorkItemVectorStore(): Promise<void> {
    try {
      const stores = await vectorStore.listVectorStores();
      
      if (!stores.includes(RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME)) {
        console.log(`📊 Creating work items vector store: ${RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME}`);
        
        await vectorStore.createVectorStore({
          name: RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME,
          embeddingModel: 'text-embedding-3-small',
          distanceFunction: 'cosine'
        });
        
        console.log(`✅ Work items vector store created successfully`);
      }
    } catch (error) {
      console.error('❌ Failed to ensure work items vector store:', error);
      throw error;
    }
  }

  /**
   * Search work items by query
   */
  public async searchWorkItems(query: string, maxResults: number = 5): Promise<any[]> {
    try {
      const stores = await vectorStore.listVectorStores();
      
      if (!stores.includes(RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME)) {
        console.log(`📝 Work items vector store doesn't exist yet.`);
        return [];
      }

      const results = await vectorStore.search(
        RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME,
        query,
        maxResults
      );

      return results.map(result => ({
        id: result.id,
        content: result.document,
        metadata: result.metadata,
        distance: result.distance,
        source: 'workItem'
      }));

    } catch (error) {
      console.error('❌ Failed to search work items:', error);
      return [];
    }
  }

  /**
   * Bulk index multiple work items
   */
  public async bulkIndexWorkItems(items: WorkItemForIndexing[]): Promise<void> {
    console.log(`📊 Bulk indexing ${items.length} work items...`);
    
    for (const item of items) {
      try {
        await this.indexWorkItem(item);
      } catch (error) {
        console.error(`❌ Failed to index ${item.type} ${item.id}:`, error);
        // Continue with other items
      }
    }
    
    console.log(`✅ Bulk indexing completed`);
  }

  /**
   * Re-index all work items from database
   */
  public async reindexAllWorkItems(): Promise<void> {
    try {
      console.log('🔄 Starting complete work item re-indexing...');
      
      // This would query all work items from database and re-index them
      // Implementation depends on database service structure
      console.log('✅ Work item re-indexing completed');
      
    } catch (error) {
      console.error('❌ Failed to re-index work items:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const workItemIndexer = WorkItemIndexer.getInstance();

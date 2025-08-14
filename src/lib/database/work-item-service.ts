// Work Item Database Integration Service
// Handles saving work items to MariaDB and indexing them for RAG search

import { databaseService, vectorStore, embeddingService } from './index';
import { RAG_CONFIG } from '../rag/config';
import { workItemIndexer, WorkItemForIndexing } from './work-item-indexer';

export interface WorkItemSearchResult {
  id: string;
  type: 'business_brief' | 'initiative' | 'feature' | 'epic' | 'story';
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkItemDatabaseService {
  
  /**
   * Save work item to database and vector store
   */
  async saveWorkItem(type: string, item: any): Promise<void> {
    console.log(`💾 Saving ${type}: ${item.title} (ID: ${item.id || item.businessBriefId || 'NO_ID'})`);
    
    // Debug: Log key relationships
    if (type === 'feature' && item.initiativeId) {
      console.log(`🔗 Feature ${item.id} references initiative: ${item.initiativeId}`);
    }
    if (type === 'epic' && item.featureId) {
      console.log(`🔗 Epic ${item.id} references feature: ${item.featureId}`);
    }
    if (type === 'story' && item.epicId) {
      console.log(`🔗 Story ${item.id} references epic: ${item.epicId}`);
    }
    
    try {
      // Save to appropriate database table
      switch (type) {
        case 'business_brief':
          await databaseService.createBusinessBrief({
            id: item.businessBriefId || item.id, // Use businessBriefId (BB-001) as the main ID
            title: item.title,
            description: item.description || '',
            businessOwner: item.businessOwner || item.submittedBy,
            status: this.normalizeBusinessBriefStatus(item.status),
            priority: item.priority || 'medium', 
            submittedBy: item.submittedBy || item.createdBy || 'system',
            submittedAt: item.submittedAt || item.createdAt || new Date(),
            workflowStage: this.mapStatusToWorkflowStage(item.status),
            completionPercentage: this.calculateCompletionPercentage(item.status)
          });
          break;
          
        case 'initiative':
          console.log(`🔍 Initiative debug - original businessBriefId: '${item.businessBriefId}', title: '${item.title}'`);
          
          // Map old businessBriefId format to new format
          const mappedBusinessBriefId = this.mapBusinessBriefId(item.businessBriefId);
          console.log(`🔄 Mapped businessBriefId: '${item.businessBriefId}' → '${mappedBusinessBriefId}'`);
          console.log(`🔄 Normalized initiative ID: '${item.id}' → '${this.normalizeId(item.id)}'`);
          
          if (!mappedBusinessBriefId) {
            console.warn(`⚠️ Initiative '${item.title}' has invalid businessBriefId '${item.businessBriefId}'! Cannot map to valid BB-xxx ID.`);
            throw new Error(`Initiative '${item.title}' has invalid businessBriefId '${item.businessBriefId}' - cannot create without valid business brief reference`);
          }

          await databaseService.createInitiative({
            id: this.normalizeId(item.id),
            businessBriefId: mappedBusinessBriefId,
            title: item.title,
            description: item.description || '',
            businessValue: item.businessValue || '',
            acceptanceCriteria: Array.isArray(item.acceptanceCriteria) 
              ? JSON.stringify(item.acceptanceCriteria) 
              : item.acceptanceCriteria || '[]',
            priority: item.priority || 'medium',
            status: this.normalizeWorkItemStatus(item.status),
            assignedTo: item.assignedTo,
            estimatedValue: item.estimatedValue || 0,
            workflowStage: this.mapStatusToWorkflowStage(item.status),
            completionPercentage: this.calculateCompletionPercentage(item.status),
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date()
          });
          break;
          
        case 'feature':
          const normalizedFeatureInitiativeId = this.normalizeId(item.initiativeId);
          console.log(`🔗 Feature ${item.id} references initiative: ${item.initiativeId} → ${normalizedFeatureInitiativeId}`);
          await databaseService.createFeature({
            id: this.normalizeId(item.id),
            initiativeId: normalizedFeatureInitiativeId,
            title: item.title,
            description: item.description || '',
            businessValue: item.businessValue || '',
            acceptanceCriteria: Array.isArray(item.acceptanceCriteria) 
              ? JSON.stringify(item.acceptanceCriteria) 
              : item.acceptanceCriteria || '[]',
            priority: item.priority || 'medium',
            status: this.normalizeWorkItemStatus(item.status),
            assignedTo: item.assignedTo,
            storyPoints: item.storyPoints || 0,
            workflowStage: this.mapStatusToWorkflowStage(item.status),
            completionPercentage: this.calculateCompletionPercentage(item.status),
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date()
          });
          break;
          
        case 'epic':
          const normalizedEpicFeatureId = this.normalizeId(item.featureId);
          console.log(`🔗 Epic ${item.id} references feature: ${item.featureId} → ${normalizedEpicFeatureId}`);
          await databaseService.createEpic({
            id: this.normalizeId(item.id),
            featureId: normalizedEpicFeatureId,
            title: item.title,
            description: item.description || '',
            businessValue: item.businessValue || '',
            acceptanceCriteria: Array.isArray(item.acceptanceCriteria) 
              ? JSON.stringify(item.acceptanceCriteria) 
              : item.acceptanceCriteria || '[]',
            priority: item.priority || 'medium',
            status: this.normalizeWorkItemStatus(item.status),
            assignedTo: item.assignedTo,
            storyPoints: item.storyPoints || 0,
            workflowStage: this.mapStatusToWorkflowStage(item.status),
            completionPercentage: this.calculateCompletionPercentage(item.status),
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date()
          });
          break;
          
        case 'story':
          const normalizedStoryEpicId = this.normalizeId(item.epicId);
          console.log(`🔗 Story ${item.id} references epic: ${item.epicId} → ${normalizedStoryEpicId}`);
          await databaseService.createStory({
            id: this.normalizeId(item.id),
            epicId: normalizedStoryEpicId,
            title: item.title,
            description: item.description || '',
            userStory: item.userStory || '',
            acceptanceCriteria: Array.isArray(item.acceptanceCriteria) 
              ? JSON.stringify(item.acceptanceCriteria) 
              : item.acceptanceCriteria || '[]',
            priority: item.priority || 'medium',
            status: item.status || 'backlog',
            assignedTo: item.assignedTo,
            storyPoints: item.storyPoints || 0,
            workflowStage: this.mapStatusToWorkflowStage(item.status),
            completionPercentage: this.calculateCompletionPercentage(item.status),
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date()
          });
          break;
      }
      
      // Index in vector store for RAG search
      await this.indexWorkItemForSearch(type, item);
      
      console.log(`✅ ${type} ${item.title} saved to database and indexed`);
      
    } catch (error) {
      console.error(`❌ Failed to save ${type} ${item.title}:`, error);
      throw error;
    }
  }

  /**
   * Index work item in vector store for search
   */
  private async indexWorkItemForSearch(type: string, item: any): Promise<void> {
    try {
      // Convert to WorkItemForIndexing format
      const workItemForIndexing: WorkItemForIndexing = {
        id: item.id,
        type: type as 'businessBrief' | 'initiative' | 'feature' | 'epic' | 'story',
        title: item.title,
        description: item.description,
        businessValue: item.businessValue,
        acceptanceCriteria: item.acceptanceCriteria,
        status: item.status,
        priority: item.priority,
        assignedTo: item.assignedTo,
        workflowStage: item.workflowStage,
        completionPercentage: item.completionPercentage,
        // Relationship fields
        businessBriefId: item.businessBriefId,
        initiativeId: item.initiativeId,
        featureId: item.featureId,
        epicId: item.epicId
      };

      // Use the enhanced work item indexer
      await workItemIndexer.indexWorkItem(workItemForIndexing);

    } catch (error) {
      console.warn(`⚠️ Failed to index ${type} ${item.title} for search:`, error);
      // Don't fail the main operation if vector indexing fails
    }
  }



  /**
   * Search work items from database by text
   */
  async searchWorkItemsByText(query: string): Promise<WorkItemSearchResult[]> {
    try {
      const results: WorkItemSearchResult[] = [];
      
      // Search business briefs
      const briefs = await databaseService.getAllBusinessBriefs?.() || [];
      briefs.forEach(brief => {
        if (this.matchesQuery(brief.title + ' ' + brief.description, query)) {
          results.push({
            id: brief.id,
            type: 'business_brief',
            title: brief.title,
            description: brief.description || '',
            status: brief.status,
            priority: brief.priority,
            assignedTo: undefined,
            createdAt: brief.createdAt || new Date(),
            updatedAt: brief.updatedAt || new Date()
          });
        }
      });

      // Search initiatives
      const initiatives = await databaseService.getAllInitiatives?.() || [];
      initiatives.forEach(initiative => {
        if (this.matchesQuery(initiative.title + ' ' + initiative.description, query)) {
          results.push({
            id: initiative.id,
            type: 'initiative',
            title: initiative.title,
            description: initiative.description || '',
            status: initiative.status,
            priority: initiative.priority,
            assignedTo: initiative.assignedTo,
            createdAt: initiative.createdAt,
            updatedAt: initiative.updatedAt
          });
        }
      });

      // Search features, epics, stories similarly...
      
      return results.slice(0, 10); // Limit results
      
    } catch (error) {
      console.error('❌ Failed to search work items:', error);
      return [];
    }
  }

  /**
   * Simple text matching for work item search
   */
  private matchesQuery(text: string, query: string): boolean {
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Check for exact matches or partial matches
    return normalizedText.includes(normalizedQuery) || 
           query.split(/\s+/).some(word => normalizedText.includes(word.toLowerCase()));
  }

  /**
   * Get work item details by ID and type
   */
  async getWorkItemById(id: string, type: string): Promise<any | null> {
    try {
      switch (type) {
        case 'business_brief':
          return await databaseService.getBusinessBriefById(id);
        case 'initiative':
          return await databaseService.getInitiativeById(id);
        case 'feature':
          return await databaseService.getFeatureById(id);
        case 'epic':
          return await databaseService.getEpicById(id);
        case 'story':
          return await databaseService.getStoryById(id);
        default:
          return null;
      }
    } catch (error) {
      console.error(`❌ Failed to get ${type} ${id}:`, error);
      return null;
    }
  }

  /**
   * Migrate existing Zustand store data to database
   */
  async migrateStoreToDatabase(storeData: any, type: string): Promise<number> {
    let migrated = 0;
    
    try {
      for (const item of storeData) {
        try {
          await this.saveWorkItem(type, item);
          migrated++;
        } catch (error: any) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⏭️ Skipping duplicate ${type} ${item.id || item.title} - already exists`);
            continue;
          }
          throw error; // Re-throw non-duplicate errors
        }
      }
      
      console.log(`✅ Migrated ${migrated} ${type}s to database`);
      return migrated;
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${type}s:`, error);
      return migrated;
    }
  }

  /**
   * Map old businessBriefId format to new format
   */
  private mapBusinessBriefId(oldId?: string): string | null {
    if (!oldId) return null;
    
    // Map old uc-xxx format to BB-xxx format
    const mapping: Record<string, string> = {
      'uc-001': 'BB-001',
      'uc-002': 'BB-002', 
      'uc-003': 'BB-003',
      'uc-004': 'BB-004',
      // If already in BB-xxx format, keep as-is
      'BB-001': 'BB-001',
      'BB-002': 'BB-002',
      'BB-003': 'BB-003', 
      'BB-004': 'BB-004'
    };
    
    return mapping[oldId] || null;
  }

  /**
   * Normalize all IDs to lowercase for consistent referencing
   */
  private normalizeId(id?: string): string {
    if (!id) return '';
    return id.toLowerCase();
  }

  /**
   * Normalize status values for Business Briefs (draft, submitted, in_review, approved, rejected)
   */
  private normalizeBusinessBriefStatus(status?: string): string {
    if (!status) return 'draft';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    // Map to business brief enum values
    switch (normalizedStatus) {
      case 'backlog':
      case 'todo':
      case 'new':
      case 'pending':
        return 'draft';
      case 'in_progress':
      case 'in-progress':
      case 'active':
      case 'working':
        return 'in_review';
      case 'done':
      case 'complete':
      case 'completed':
      case 'finished':
        return 'approved';
      case 'cancelled':
      case 'canceled':
      case 'blocked':
        return 'rejected';
      case 'draft':
      case 'submitted':
      case 'in_review':
      case 'approved':
      case 'rejected':
        return normalizedStatus;
      default:
        console.warn(`Unknown business brief status '${status}', defaulting to 'draft'`);
        return 'draft';
    }
  }

  /**
   * Normalize status values for Work Items (backlog, planning, in_progress, done, cancelled)
   */
  private normalizeWorkItemStatus(status?: string): string {
    if (!status) return 'backlog';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    // Map to work item enum values
    switch (normalizedStatus) {
      case 'draft':
      case 'todo':
      case 'new':
      case 'pending':
        return 'backlog';
      case 'submitted':
      case 'review':
      case 'planning':
        return 'planning';
      case 'approved':
      case 'in_progress':
      case 'in-progress':
      case 'active':
      case 'working':
      case 'in_review':
        return 'in_progress';
      case 'complete':
      case 'completed':
      case 'finished':
        return 'done';
      case 'rejected':
      case 'canceled':
      case 'blocked':
        return 'cancelled';
      case 'backlog':
      case 'done':
      case 'cancelled':
        return normalizedStatus;
      default:
        console.warn(`Unknown work item status '${status}', defaulting to 'backlog'`);
        return 'backlog';
    }
  }

  /**
   * Map status to workflow stage (works for both business briefs and work items)
   */
  private mapStatusToWorkflowStage(status: string): string {
    if (!status) return 'idea';
    
    const normalizedStatus = status.toLowerCase().trim();
    
    // Handle both business brief and work item status values
    switch (normalizedStatus) {
      // Business brief statuses
      case 'draft': return 'idea';
      case 'submitted': return 'planning';
      case 'in_review': return 'planning';
      case 'approved': return 'execution';
      case 'rejected': return 'cancelled';
      
      // Work item statuses  
      case 'backlog': return 'idea';
      case 'planning': return 'planning';
      case 'in_progress': return 'execution';
      case 'done': return 'execution';
      case 'cancelled': return 'cancelled';
      
      default: return 'idea';
    }
  }

  /**
   * Calculate completion percentage based on status (works for both business briefs and work items)
   */
  private calculateCompletionPercentage(status: string): number {
    if (!status) return 0;
    
    const normalizedStatus = status.toLowerCase().trim();
    
    switch (normalizedStatus) {
      // Business brief statuses
      case 'draft': return 10;
      case 'submitted': return 25;
      case 'in_review': return 50;
      case 'approved': return 75;
      case 'rejected': return 0;
      
      // Work item statuses
      case 'backlog': return 10;
      case 'planning': return 25;
      case 'in_progress': return 60;
      case 'done': return 100;
      case 'cancelled': return 0;
      
      default: return 0;
    }
  }
}

export const workItemService = new WorkItemDatabaseService();
export default workItemService;

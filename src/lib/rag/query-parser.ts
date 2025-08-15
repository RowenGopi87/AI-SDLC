// Enhanced query parsing for RAG system
import { db } from '@/lib/database/connection';

export interface QueryContext {
  queryType: 'relationship' | 'status' | 'list' | 'general' | 'followup';
  workItemType?: string;
  workItemId?: string;
  workItemTitle?: string;
  relationshipType?: 'children' | 'parent' | 'siblings';
  requestedInfo?: 'status' | 'count' | 'list' | 'details' | 'sdlc' | 'safe';
  previousContext?: string;
}

export interface WorkItemHierarchy {
  businessBriefs: any[];
  initiatives: any[];
  features: any[];
  epics: any[];
  stories: any[];
}

export class QueryParser {
  
  /**
   * Parse user query to understand intent and extract work item references
   */
  static parseQuery(query: string, conversationHistory: string[] = []): QueryContext {
    const lowerQuery = query.toLowerCase();
    
    // Detect query type
    let queryType: QueryContext['queryType'] = 'general';
    let requestedInfo: QueryContext['requestedInfo'] = 'details';
    
    // Relationship queries
    if (lowerQuery.includes('how many') || lowerQuery.includes('list') || lowerQuery.includes('epics for') || lowerQuery.includes('initiatives for') || lowerQuery.includes('stories of')) {
      queryType = 'relationship';
      if (lowerQuery.includes('how many')) requestedInfo = 'count';
      else requestedInfo = 'list';
    }
    
    // Status queries  
    else if (lowerQuery.includes('status of') || lowerQuery.includes('what\'s the status')) {
      queryType = 'status';
      requestedInfo = 'status';
    }
    
    // SDLC/SAFe queries
    else if (lowerQuery.includes('where in') && (lowerQuery.includes('sdlc') || lowerQuery.includes('safe'))) {
      queryType = 'status';
      requestedInfo = lowerQuery.includes('safe') ? 'safe' : 'sdlc';
    }
    
    // Follow-up queries (that, those, etc.)
    else if (lowerQuery.includes('that ') || lowerQuery.includes('those ') || lowerQuery.includes('the previous')) {
      queryType = 'followup';
      requestedInfo = 'status'; // common follow-up
    }
    
    // Extract work item references
    const workItemId = this.extractWorkItemId(query);
    const workItemTitle = this.extractWorkItemTitle(query);
    const workItemType = this.extractWorkItemType(query);
    
    return {
      queryType,
      workItemType,
      workItemId, 
      workItemTitle,
      requestedInfo,
      previousContext: conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : undefined
    };
  }
  
  /**
   * Extract work item ID patterns (BB-001, INIT-001, etc.)
   */
  private static extractWorkItemId(query: string): string | undefined {
    const patterns = [
      /\b(BB-\d+)\b/i,
      /\b(INIT-\d+)\b/i,
      /\b(FEA-\d+)\b/i,
      /\b(EPIC-\d+)\b/i,
      /\b(STORY-\d+)\b/i,
      /\b(bb-\d+)\b/i,
      /\b(init-\d+)\b/i,
      /\b(fea-\d+)\b/i,
      /\b(epic-\d+)\b/i,
      /\b(story-\d+)\b/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) return match[1].toLowerCase();
    }
    
    return undefined;
  }
  
  /**
   * Extract work item titles/names
   */
  private static extractWorkItemTitle(query: string): string | undefined {
    const lowerQuery = query.toLowerCase();
    
    // Common project names in the mock data
    const knownTitles = [
      'mobile payment integration',
      'customer portal enhancement',
      'ai-powered inventory optimization', 
      'emirates booking management',
      'user authentication and authorization',
      'mobile security framework'
    ];
    
    for (const title of knownTitles) {
      if (lowerQuery.includes(title)) {
        return title;
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract work item type from query
   */
  private static extractWorkItemType(query: string): string | undefined {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('business brief') || lowerQuery.includes('bb-')) return 'businessBrief';
    if (lowerQuery.includes('initiative')) return 'initiative'; 
    if (lowerQuery.includes('feature')) return 'feature';
    if (lowerQuery.includes('epic')) return 'epic';
    if (lowerQuery.includes('story') || lowerQuery.includes('stories')) return 'story';
    
    return undefined;
  }
  
  /**
   * Get work item hierarchy for a specific item
   */
  static async getWorkItemHierarchy(workItemId?: string, workItemTitle?: string): Promise<WorkItemHierarchy> {
    const hierarchy: WorkItemHierarchy = {
      businessBriefs: [],
      initiatives: [],
      features: [],
      epics: [],
      stories: []
    };
    
    try {
      // If we have a specific ID, start there and get related items
      if (workItemId) {
        await this.buildHierarchyFromId(workItemId, hierarchy);
      }
      
      // If we have a title, search for matches
      if (workItemTitle) {
        await this.buildHierarchyFromTitle(workItemTitle, hierarchy);
      }
      
      // If no specific item, get all
      if (!workItemId && !workItemTitle) {
        hierarchy.businessBriefs = await db.execute('SELECT * FROM business_briefs');
        hierarchy.initiatives = await db.execute('SELECT * FROM initiatives');
        hierarchy.features = await db.execute('SELECT * FROM features');
        hierarchy.epics = await db.execute('SELECT * FROM epics');
        hierarchy.stories = await db.execute('SELECT * FROM stories');
      }
      
    } catch (error) {
      console.error('Error building work item hierarchy:', error);
    }
    
    return hierarchy;
  }
  
  /**
   * Build hierarchy starting from a specific work item ID
   */
  private static async buildHierarchyFromId(workItemId: string, hierarchy: WorkItemHierarchy): Promise<void> {
    // Business Brief
    if (workItemId.startsWith('bb-')) {
      hierarchy.businessBriefs = await db.execute('SELECT * FROM business_briefs WHERE id = ?', [workItemId]);
      if (hierarchy.businessBriefs.length > 0) {
        hierarchy.initiatives = await db.execute('SELECT * FROM initiatives WHERE business_brief_id = ?', [workItemId]);
        for (const init of hierarchy.initiatives) {
          const features = await db.execute('SELECT * FROM features WHERE initiative_id = ?', [init.id]);
          hierarchy.features.push(...features);
          for (const feature of features) {
            const epics = await db.execute('SELECT * FROM epics WHERE feature_id = ?', [feature.id]);
            hierarchy.epics.push(...epics);
            for (const epic of epics) {
              const stories = await db.execute('SELECT * FROM stories WHERE epic_id = ?', [epic.id]);
              hierarchy.stories.push(...stories);
            }
          }
        }
      }
    }
    
    // Initiative
    else if (workItemId.startsWith('init-')) {
      hierarchy.initiatives = await db.execute('SELECT * FROM initiatives WHERE id = ?', [workItemId]);
      if (hierarchy.initiatives.length > 0) {
        const init = hierarchy.initiatives[0];
        hierarchy.businessBriefs = await db.execute('SELECT * FROM business_briefs WHERE id = ?', [init.business_brief_id]);
        hierarchy.features = await db.execute('SELECT * FROM features WHERE initiative_id = ?', [workItemId]);
        for (const feature of hierarchy.features) {
          const epics = await db.execute('SELECT * FROM epics WHERE feature_id = ?', [feature.id]);
          hierarchy.epics.push(...epics);
          for (const epic of epics) {
            const stories = await db.execute('SELECT * FROM stories WHERE epic_id = ?', [epic.id]);
            hierarchy.stories.push(...stories);
          }
        }
      }
    }
    
    // Similar logic for features, epics, stories...
  }
  
  /**
   * Build hierarchy by searching for title matches
   */
  private static async buildHierarchyFromTitle(title: string, hierarchy: WorkItemHierarchy): Promise<void> {
    const titlePattern = `%${title}%`;
    
    // Search across all work item types
    hierarchy.businessBriefs = await db.execute('SELECT * FROM business_briefs WHERE LOWER(title) LIKE LOWER(?)', [titlePattern]);
    hierarchy.initiatives = await db.execute('SELECT * FROM initiatives WHERE LOWER(title) LIKE LOWER(?)', [titlePattern]);
    hierarchy.features = await db.execute('SELECT * FROM features WHERE LOWER(title) LIKE LOWER(?)', [titlePattern]);
    hierarchy.epics = await db.execute('SELECT * FROM epics WHERE LOWER(title) LIKE LOWER(?)', [titlePattern]);
    hierarchy.stories = await db.execute('SELECT * FROM stories WHERE LOWER(title) LIKE LOWER(?)', [titlePattern]);
    
    // For each match, get related items
    for (const bb of hierarchy.businessBriefs) {
      const relatedInitiatives = await db.execute('SELECT * FROM initiatives WHERE business_brief_id = ?', [bb.id]);
      hierarchy.initiatives.push(...relatedInitiatives.filter(i => !hierarchy.initiatives.find(existing => existing.id === i.id)));
      
      for (const init of relatedInitiatives) {
        const features = await db.execute('SELECT * FROM features WHERE initiative_id = ?', [init.id]);
        hierarchy.features.push(...features.filter(f => !hierarchy.features.find(existing => existing.id === f.id)));
        
        for (const feature of features) {
          const epics = await db.execute('SELECT * FROM epics WHERE feature_id = ?', [feature.id]);
          hierarchy.epics.push(...epics.filter(e => !hierarchy.epics.find(existing => existing.id === e.id)));
          
          for (const epic of epics) {
            const stories = await db.execute('SELECT * FROM stories WHERE epic_id = ?', [epic.id]);
            hierarchy.stories.push(...stories.filter(s => !hierarchy.stories.find(existing => existing.id === s.id)));
          }
        }
      }
    }
  }
  
  /**
   * Map workflow stage to SDLC phase
   */
  static mapToSDLC(workflowStage: string): string {
    const sdlcMapping: Record<string, string> = {
      'idea': 'Requirements Gathering',
      'discovery': 'Analysis & Planning', 
      'planning': 'Analysis & Planning',
      'design': 'System Design',
      'development': 'Implementation',
      'testing': 'Testing & QA',
      'deployment': 'Deployment',
      'execution': 'Implementation',
      'review': 'Testing & QA',
      'completed': 'Completed'
    };
    
    return sdlcMapping[workflowStage?.toLowerCase()] || workflowStage || 'Unknown';
  }
  
  /**
   * Map workflow stage to SAFe process
   */
  static mapToSAFe(workflowStage: string, workItemType: string): string {
    const safeMapping: Record<string, Record<string, string>> = {
      'businessBrief': {
        'idea': 'Portfolio Backlog',
        'discovery': 'Portfolio Planning',
        'planning': 'Portfolio Planning', 
        'execution': 'Program Increment Planning',
        'review': 'Portfolio Sync',
        'completed': 'Portfolio Review'
      },
      'initiative': {
        'idea': 'Portfolio Backlog',
        'discovery': 'Portfolio Planning',
        'planning': 'Program Increment Planning',
        'execution': 'Iteration Planning',
        'review': 'PI System Demo',
        'completed': 'PI Review'
      },
      'epic': {
        'idea': 'Program Backlog',
        'planning': 'PI Planning',
        'development': 'Iteration Execution',
        'testing': 'System Demo',
        'completed': 'PI Demo'
      },
      'story': {
        'idea': 'Team Backlog',
        'planning': 'Iteration Planning',
        'development': 'Daily Standup',
        'testing': 'Iteration Review',
        'completed': 'Iteration Demo'
      }
    };
    
    const typeMapping = safeMapping[workItemType];
    if (typeMapping) {
      return typeMapping[workflowStage?.toLowerCase()] || `${workItemType} - ${workflowStage}`;
    }
    
    return `SAFe ${workItemType} - ${workflowStage}`;
  }
}

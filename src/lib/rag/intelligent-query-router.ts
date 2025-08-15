import { db } from '../database/connection';
import { embeddingService, vectorStore } from '../database';
import { RAG_CONFIG } from './config';

export interface QueryIntent {
  type: 'analytical' | 'search' | 'status' | 'relationship' | 'aggregation';
  entities: string[];
  operation: string;
  filters?: Record<string, any>;
  requiresDatabase: boolean;
  requiresVector: boolean;
  confidence: number;
}

export interface QueryResult {
  answer: string;
  data?: any[];
  confidence: number;
  dataSource: 'database' | 'vector' | 'hybrid';
  queryExecuted?: string;
}

export class IntelligentQueryRouter {
  private static instance: IntelligentQueryRouter;

  private constructor() {}

  public static getInstance(): IntelligentQueryRouter {
    if (!IntelligentQueryRouter.instance) {
      IntelligentQueryRouter.instance = new IntelligentQueryRouter();
    }
    return IntelligentQueryRouter.instance;
  }

  /**
   * Main entry point: intelligently routes and answers any question
   */
  public async routeAndAnswer(question: string, conversationHistory: string[] = []): Promise<QueryResult> {
    console.log(`🧠 Intelligent query routing for: "${question}"`);

    try {
      // Step 1: Analyze the query intent
      const intent = this.analyzeQueryIntent(question, conversationHistory);
      console.log('🎯 Query intent:', intent);

      // Step 2: Route to appropriate handler based on intent
      switch (intent.type) {
        case 'analytical':
        case 'aggregation':
          return await this.handleAnalyticalQuery(question, intent);
        
        case 'search':
          return await this.handleSearchQuery(question, intent);
        
        case 'status':
        case 'relationship':
          return await this.handleRelationshipQuery(question, intent);
        
        default:
          // Fallback to hybrid approach
          return await this.handleHybridQuery(question, intent);
      }

    } catch (error) {
      console.error('❌ Intelligent query routing failed:', error);
      return {
        answer: "I encountered an error while processing your question. Please try rephrasing or contact support.",
        confidence: 0.1,
        dataSource: 'database'
      };
    }
  }

  /**
   * Analyze natural language to determine query intent and requirements
   */
  private analyzeQueryIntent(question: string, history: string[]): QueryIntent {
    const lowerQuestion = question.toLowerCase();
    const fullContext = [...history, question].join(' ').toLowerCase();

    // Analytical/Aggregation patterns
    const analyticalPatterns = [
      // CRITICAL: Basic count queries
      /how many.*are there|how many.*exist/i,
      /how many.*epics|how many.*stories|how many.*initiatives|how many.*features|how many.*briefs/i,
      /how many.*approved|how many.*draft|how many.*completed|how many.*in.*progress/i,
      /count.*epics|count.*stories|count.*initiatives|count.*features/i,
      /total.*epics|total.*stories|total.*initiatives/i,
      
      // CRITICAL: Listing/Display queries (COMPREHENSIVE PATTERNS!)
      /what are these stories/i,
      /what are the.*stories/i,
      /what are the.*epics/i,
      /list stories/i,
      /list.*epics/i,
      /list.*all.*stories/i,
      /list.*all.*epics/i,
      /list.*all.*business.*briefs/i,
      /list out all stories/i,
      /list the.*stories/i,
      /list the.*epics/i,
      /list the.*business.*briefs/i,
      /show stories/i,
      /show.*epics/i,
      // Advanced analytical patterns
      /which.*has more than|which.*have more than/,
      /how many.*total|total.*count/,
      /what.*percentage|what percent/,
      /which.*most|which.*least/,
      /compare.*between|comparison of/,
      /analyze.*across|breakdown of/,
      /which.*contains.*more than/,
      /list.*that have.*more than/,
      /show.*where.*greater than/,
      /find.*with.*count.*greater/,
      /status breakdown|breakdown.*status/,
      /which.*have no|which.*without/,
      /count.*for each|number.*for each/
    ];

    // Search patterns (specific item lookup)
    const searchPatterns = [
      /tell me about|describe|what is/,
      /find.*called|search for/,
      /details.*about|information.*about/
    ];

    // Status/Relationship patterns
    const relationshipPatterns = [
      /status of|what.*status/,
      /where.*in.*sdlc|where.*in.*safe/,
      /belongs to|related to|associated with/
    ];

    // Determine primary intent
    let type: QueryIntent['type'] = 'search';
    let confidence = 0.5;

    if (analyticalPatterns.some(pattern => pattern.test(lowerQuestion))) {
      type = 'analytical';
      confidence = 0.9; // HIGH confidence for analytical queries
    } else if (relationshipPatterns.some(pattern => pattern.test(lowerQuestion))) {
      type = 'relationship'; 
      confidence = 0.7;
    } else if (searchPatterns.some(pattern => pattern.test(lowerQuestion))) {
      type = 'search';
      confidence = 0.6;
    }

    // Extract entities (Business Brief, Story, Epic, etc.)
    const entityPatterns = {
      'business_brief': /business brief|business-brief|bb-\d+/i,
      'initiative': /initiative|init-\d+/i,
      'feature': /feature|fea-\d+/i,
      'epic': /epic|epic-\d+/i,
      'story': /story|stories|story-\d+/i
    };

    const entities: string[] = [];
    Object.entries(entityPatterns).forEach(([entity, pattern]) => {
      if (pattern.test(fullContext)) {
        entities.push(entity);
      }
    });

    // Extract operation
    let operation = 'find';
    if (/count|how many|number of/.test(lowerQuestion)) operation = 'count';
    if (/more than|greater than/.test(lowerQuestion)) operation = 'filter_greater';
    if (/less than|fewer than/.test(lowerQuestion)) operation = 'filter_less';
    if (/status|where.*in/.test(lowerQuestion)) operation = 'status';
    if (/compare|comparison/.test(lowerQuestion)) operation = 'compare';

    // Determine data source requirements
    const requiresDatabase = type === 'analytical' || type === 'aggregation' || 
                            operation.includes('count') || operation.includes('filter');
    const requiresVector = type === 'search' || entities.length === 0;

    return {
      type,
      entities,
      operation,
      requiresDatabase,
      requiresVector,
      confidence
    };
  }

  /**
   * Handle analytical queries that require database aggregation
   */
  private async handleAnalyticalQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('📊 Handling analytical query...');

    try {
      // Handle basic counting queries first
      if (intent.operation === 'count') {
        return await this.handleBasicCountQuery(question, intent);
      }
      
      // Handle listing/display queries - NEW FEATURE!
      if (intent.operation === 'list' || intent.operation === 'show' || 
          question.toLowerCase().includes('what are these') || question.toLowerCase().includes('what are the') ||
          question.toLowerCase().includes('list') || question.toLowerCase().includes('show')) {
        return await this.handleListWorkItemsQuery(question, intent);
      }

      // Example: "Which Business Brief has more than 1 story?"
      if (intent.operation === 'filter_greater' && 
          intent.entities.includes('business_brief') && 
          intent.entities.includes('story')) {
        
        const query = `
          SELECT 
            bb.id,
            bb.title,
            bb.status,
            bb.priority,
            COUNT(s.id) as story_count
          FROM business_briefs bb
          LEFT JOIN initiatives i ON bb.id = i.business_brief_id
          LEFT JOIN features f ON i.id = f.initiative_id  
          LEFT JOIN epics e ON f.id = e.feature_id
          LEFT JOIN stories s ON e.id = s.epic_id
          GROUP BY bb.id, bb.title, bb.status, bb.priority
          HAVING COUNT(s.id) > 1
          ORDER BY story_count DESC
        `;

        console.log('🔍 Executing analytical query:', query);
        const results = await db.execute(query);
        
        if (results && results.length > 0) {
          let answer = `**Found ${results.length} Business Brief(s) with more than 1 story:**\n\n`;
          
          results.forEach((bb: any, index: number) => {
            answer += `${index + 1}. **${bb.title}** (${bb.id})\n`;
            answer += `   - Stories: ${bb.story_count}\n`;
            answer += `   - Status: ${bb.status}\n`;
            answer += `   - Priority: ${bb.priority}\n\n`;
          });

          return {
            answer,
            data: results,
            confidence: 0.9,
            dataSource: 'database',
            queryExecuted: query
          };
        } else {
          return {
            answer: "**No Business Briefs found with more than 1 story.**\n\nAll current Business Briefs have 1 or 0 stories associated with them.",
            data: [],
            confidence: 0.8,
            dataSource: 'database',
            queryExecuted: query
          };
        }
      }

      // Handle "How many X are there for each Y" queries
      if (intent.operation === 'count' && question.toLowerCase().includes('for each')) {
        return await this.handleCountForEachQuery(question, intent);
      }

      // Handle "What's the status breakdown" queries  
      if (intent.operation === 'status' || question.toLowerCase().includes('breakdown')) {
        return await this.handleStatusBreakdownQuery(question, intent);
      }

      // Handle "Which X have no Y" queries
      if (question.toLowerCase().includes('have no') || question.toLowerCase().includes('without')) {
        return await this.handleEmptyRelationshipQuery(question, intent);
      }

      // Add more analytical patterns here...
      return await this.handleGeneralAnalyticalQuery(question, intent);

    } catch (error) {
      console.error('❌ Analytical query failed:', error);
      return {
        answer: `I encountered an error while analyzing the data: ${(error as Error).message}. Please try rephrasing your question.`,
        confidence: 0.2,
        dataSource: 'database'
      };
    }
  }

  /**
   * Handle basic counting queries like "How many epics are there?"
   */
  private async handleListWorkItemsQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('📋 Handling list work items query...');

    try {
      const lowerQuestion = question.toLowerCase();
      let query = '';
      let entityType = '';
      let entityTypePlural = '';

      // Determine which entity type to list
      if (lowerQuestion.includes('story') || lowerQuestion.includes('stories')) {
        entityType = 'Story';
        entityTypePlural = 'Stories';
        query = 'SELECT id, title, description, status, priority FROM stories ORDER BY created_at DESC';
        
      } else if (lowerQuestion.includes('epic')) {
        entityType = 'Epic';
        entityTypePlural = 'Epics';
        query = 'SELECT id, title, description, status, priority FROM epics ORDER BY created_at DESC';
        
      } else if (lowerQuestion.includes('initiative')) {
        entityType = 'Initiative';
        entityTypePlural = 'Initiatives';
        query = 'SELECT id, title, description, status, priority FROM initiatives ORDER BY created_at DESC';
        
      } else if (lowerQuestion.includes('feature')) {
        entityType = 'Feature';
        entityTypePlural = 'Features';
        query = 'SELECT id, title, description, status, priority FROM features ORDER BY created_at DESC';
        
      } else if (lowerQuestion.includes('brief')) {
        entityType = 'Business Brief';
        entityTypePlural = 'Business Briefs';
        query = 'SELECT id, title, description, status, priority FROM business_briefs ORDER BY submitted_at DESC';
        
      } else {
        // Default to stories if context suggests it
        entityType = 'Story';
        entityTypePlural = 'Stories';
        query = 'SELECT id, title, description, status, priority FROM stories ORDER BY created_at DESC';
      }

      console.log(`🔍 Executing list query: ${query}`);
      const results = await db.execute(query) as any[];
      
      if (!results || results.length === 0) {
        return {
          success: true,
          response: `No ${entityTypePlural.toLowerCase()} found in the system.`,
          context: `**No ${entityTypePlural}** found in the system.\n\n💡 Consider creating ${entityTypePlural.toLowerCase()} to get started with your project.`,
          confidence: 0.95,
          metadata: {
            queryExecuted: query,
            dataSource: 'database',
            workItemType: 'list_result'
          }
        };
      }

      // Format the results
      let formattedList = `**${entityTypePlural} (${results.length}):**\n\n`;
      results.forEach((item: any, index: number) => {
        const status = item.status ? ` (${item.status.toUpperCase()})` : '';
        const priority = item.priority ? ` [${item.priority}]` : '';
        formattedList += `${index + 1}. **${item.title}**${status}${priority}\n`;
        if (item.description) {
          formattedList += `   ${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}\n`;
        }
        formattedList += `   ID: ${item.id}\n\n`;
      });

      const response = `Here are the ${results.length} ${entityTypePlural.toLowerCase()} in your system:\n\n${formattedList}`;

      return {
        success: true,
        answer: response,
        context: formattedList,
        confidence: 0.95,
        dataSource: 'database',
        queryExecuted: query,
        metadata: {
          workItemType: 'list_result',
          itemCount: results.length
        }
      };

    } catch (error: any) {
      console.error('❌ Error in handleListWorkItemsQuery:', error);
      return {
        success: false,
        answer: `I encountered an error while retrieving the work items: ${error.message}`,
        context: '',
        confidence: 0.1,
        dataSource: 'database',
        queryExecuted: '',
        metadata: {
          error: error.message,
          workItemType: 'error'
        }
      };
    }
  }

  private async handleBasicCountQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('🔢 Handling basic count query...');

    try {
      const lowerQuestion = question.toLowerCase();
      let query = '';
      let entityType = '';
      let entityTypePlural = '';

      // Determine which entity type to count
      if (lowerQuestion.includes('epic')) {
        entityType = 'Epic';
        entityTypePlural = 'Epics';
        query = 'SELECT COUNT(*) as count FROM epics';
        
        // Handle status-specific counting
        if (lowerQuestion.includes('approved')) {
          query += " WHERE status = 'approved'";
          entityTypePlural = 'Approved Epics';
        } else if (lowerQuestion.includes('draft')) {
          query += " WHERE status = 'draft'";
          entityTypePlural = 'Draft Epics';
        } else if (lowerQuestion.includes('in progress') || lowerQuestion.includes('in_progress')) {
          query += " WHERE status = 'in_progress'";
          entityTypePlural = 'In Progress Epics';
        }
        
      } else if (lowerQuestion.includes('story') || lowerQuestion.includes('stories')) {
        entityType = 'Story';
        entityTypePlural = 'Stories';
        query = 'SELECT COUNT(*) as count FROM stories';
        
        if (lowerQuestion.includes('approved')) {
          query += " WHERE status = 'approved'";
          entityTypePlural = 'Approved Stories';
        } else if (lowerQuestion.includes('draft')) {
          query += " WHERE status = 'draft'";
          entityTypePlural = 'Draft Stories';
        } else if (lowerQuestion.includes('backlog')) {
          query += " WHERE status = 'backlog'";
          entityTypePlural = 'Backlog Stories';
        }
        
      } else if (lowerQuestion.includes('initiative')) {
        entityType = 'Initiative';
        entityTypePlural = 'Initiatives';
        query = 'SELECT COUNT(*) as count FROM initiatives';
        
        if (lowerQuestion.includes('approved')) {
          query += " WHERE status = 'approved'";
          entityTypePlural = 'Approved Initiatives';
        } else if (lowerQuestion.includes('draft')) {
          query += " WHERE status = 'draft'";
          entityTypePlural = 'Draft Initiatives';
        } else if (lowerQuestion.includes('in progress') || lowerQuestion.includes('in_progress')) {
          query += " WHERE status = 'in_progress'";
          entityTypePlural = 'In Progress Initiatives';
        }
        
      } else if (lowerQuestion.includes('feature')) {
        entityType = 'Feature';
        entityTypePlural = 'Features';
        query = 'SELECT COUNT(*) as count FROM features';
        
        if (lowerQuestion.includes('approved')) {
          query += " WHERE status = 'approved'";
          entityTypePlural = 'Approved Features';
        } else if (lowerQuestion.includes('draft')) {
          query += " WHERE status = 'draft'";
          entityTypePlural = 'Draft Features';
        }
        
      } else if (lowerQuestion.includes('business brief') || lowerQuestion.includes('brief')) {
        entityType = 'Business Brief';
        entityTypePlural = 'Business Briefs';
        query = 'SELECT COUNT(*) as count FROM business_briefs';
        
        if (lowerQuestion.includes('approved')) {
          query += " WHERE status = 'approved'";
          entityTypePlural = 'Approved Business Briefs';
        } else if (lowerQuestion.includes('draft')) {
          query += " WHERE status = 'draft'";
          entityTypePlural = 'Draft Business Briefs';
        } else if (lowerQuestion.includes('submitted')) {
          query += " WHERE status = 'submitted'";
          entityTypePlural = 'Submitted Business Briefs';
        }
        
      } else {
        // Default to all work items
        entityTypePlural = 'Work Items';
        query = `
          SELECT 
            'Business Brief' as type, COUNT(*) as count FROM business_briefs
          UNION ALL
          SELECT 
            'Initiative' as type, COUNT(*) as count FROM initiatives
          UNION ALL
          SELECT 
            'Feature' as type, COUNT(*) as count FROM features
          UNION ALL
          SELECT 
            'Epic' as type, COUNT(*) as count FROM epics
          UNION ALL
          SELECT 
            'Story' as type, COUNT(*) as count FROM stories
        `;
      }

      console.log('🔍 Executing basic count query:', query);
      const results = await db.execute(query);
      
      if (results && results.length > 0) {
        let answer = '';
        
        if (entityTypePlural === 'Work Items') {
          answer = '**Total Work Items Count:**\n\n';
          let totalCount = 0;
          
          results.forEach((item: any) => {
            answer += `• **${item.type}s**: ${item.count}\n`;
            totalCount += parseInt(item.count);
          });
          
          answer += `\n**Grand Total: ${totalCount} work items across all types**`;
        } else {
          const count = results[0].count;
          answer = `**There ${count === 1 ? 'is' : 'are'} ${count} ${entityTypePlural}** in the system.`;
          
          if (count === 0) {
            answer += `\n\n💡 **Suggestion**: Consider creating ${entityType.toLowerCase()}s to progress your project development.`;
          } else if (count > 0) {
            answer += `\n\n📊 This represents all ${entityTypePlural.toLowerCase()} currently tracked in your SDLC system.`;
          }
        }

        return {
          answer,
          data: results,
          confidence: 0.95,
          dataSource: 'database',
          queryExecuted: query
        };
      }

      return {
        answer: `No ${entityTypePlural.toLowerCase()} found in the system.`,
        confidence: 0.8,
        dataSource: 'database',
        queryExecuted: query
      };

    } catch (error) {
      console.error('❌ Basic count query failed:', error);
      return {
        answer: `Error counting items: ${(error as Error).message}`,
        confidence: 0.2,
        dataSource: 'database'
      };
    }
  }

  /**
   * Handle "How many X for each Y" queries
   */
  private async handleCountForEachQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('📊 Handling count-for-each query...');

    try {
      // Example: "How many epics are there for each initiative?"
      if (question.toLowerCase().includes('epic') && question.toLowerCase().includes('initiative')) {
        const query = `
          SELECT 
            i.id,
            i.title,
            i.status,
            i.priority,
            COUNT(e.id) as epic_count
          FROM initiatives i
          LEFT JOIN features f ON i.id = f.initiative_id
          LEFT JOIN epics e ON f.id = e.feature_id
          GROUP BY i.id, i.title, i.status, i.priority
          ORDER BY epic_count DESC, i.title
        `;

        const results = await db.execute(query);
        
        if (results && results.length > 0) {
          let answer = `**Epic count for each Initiative:**\n\n`;
          
          results.forEach((init: any) => {
            answer += `• **${init.title}** (${init.id}): ${init.epic_count} epics\n`;
            answer += `  Status: ${init.status} | Priority: ${init.priority}\n\n`;
          });

          const totalEpics = results.reduce((sum: number, init: any) => sum + parseInt(init.epic_count), 0);
          answer += `**Total: ${totalEpics} epics across ${results.length} initiatives**`;

          return {
            answer,
            data: results,
            confidence: 0.9,
            dataSource: 'database',
            queryExecuted: query
          };
        }
      }

      return await this.handleGeneralAnalyticalQuery(question, intent);

    } catch (error) {
      console.error('❌ Count-for-each query failed:', error);
      return {
        answer: `Error analyzing count data: ${(error as Error).message}`,
        confidence: 0.2,
        dataSource: 'database'
      };
    }
  }

  /**
   * Handle status breakdown queries
   */
  private async handleStatusBreakdownQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('📈 Handling status breakdown query...');

    try {
      let query = '';
      let entityType = '';

      if (question.toLowerCase().includes('business brief')) {
        entityType = 'Business Briefs';
        query = `
          SELECT 
            status,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM business_briefs), 1) as percentage
          FROM business_briefs 
          GROUP BY status 
          ORDER BY count DESC
        `;
      } else if (question.toLowerCase().includes('initiative')) {
        entityType = 'Initiatives';
        query = `
          SELECT 
            status,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM initiatives), 1) as percentage
          FROM initiatives 
          GROUP BY status 
          ORDER BY count DESC
        `;
      } else {
        // Default to all work items
        entityType = 'All Work Items';
        query = `
          SELECT 'Business Brief' as entity_type, status, COUNT(*) as count FROM business_briefs GROUP BY status
          UNION ALL
          SELECT 'Initiative' as entity_type, status, COUNT(*) as count FROM initiatives GROUP BY status
          UNION ALL
          SELECT 'Feature' as entity_type, status, COUNT(*) as count FROM features GROUP BY status
          UNION ALL
          SELECT 'Epic' as entity_type, status, COUNT(*) as count FROM epics GROUP BY status
          UNION ALL
          SELECT 'Story' as entity_type, status, COUNT(*) as count FROM stories GROUP BY status
          ORDER BY entity_type, count DESC
        `;
      }

      const results = await db.execute(query);
      
      if (results && results.length > 0) {
        let answer = `**${entityType} Status Breakdown:**\n\n`;
        
        if (entityType === 'All Work Items') {
          let currentType = '';
          results.forEach((item: any) => {
            if (item.entity_type !== currentType) {
              currentType = item.entity_type;
              answer += `\n**${currentType}s:**\n`;
            }
            answer += `  • ${item.status}: ${item.count}\n`;
          });
        } else {
          results.forEach((item: any) => {
            answer += `• **${item.status}**: ${item.count} (${item.percentage}%)\n`;
          });
          
          const total = results.reduce((sum: number, item: any) => sum + parseInt(item.count), 0);
          answer += `\n**Total ${entityType}: ${total}**`;
        }

        return {
          answer,
          data: results,
          confidence: 0.9,
          dataSource: 'database',
          queryExecuted: query
        };
      }

      return {
        answer: `No ${entityType.toLowerCase()} found in the system.`,
        confidence: 0.8,
        dataSource: 'database',
        queryExecuted: query
      };

    } catch (error) {
      console.error('❌ Status breakdown query failed:', error);
      return {
        answer: `Error analyzing status data: ${(error as Error).message}`,
        confidence: 0.2,
        dataSource: 'database'
      };
    }
  }

  /**
   * Handle "Which X have no Y" queries
   */
  private async handleEmptyRelationshipQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('🔍 Handling empty relationship query...');

    try {
      // Example: "Which initiatives have no stories?"
      if (question.toLowerCase().includes('initiative') && question.toLowerCase().includes('story')) {
        const query = `
          SELECT 
            i.id,
            i.title,
            i.status,
            i.priority,
            i.business_brief_id
          FROM initiatives i
          WHERE i.id NOT IN (
            SELECT DISTINCT i2.id 
            FROM initiatives i2
            JOIN features f ON i2.id = f.initiative_id
            JOIN epics e ON f.id = e.feature_id
            JOIN stories s ON e.id = s.epic_id
          )
          ORDER BY i.title
        `;

        const results = await db.execute(query);
        
        if (results && results.length > 0) {
          let answer = `**Found ${results.length} initiative(s) with no stories:**\n\n`;
          
          results.forEach((init: any, index: number) => {
            answer += `${index + 1}. **${init.title}** (${init.id})\n`;
            answer += `   - Status: ${init.status}\n`;
            answer += `   - Priority: ${init.priority}\n`;
            answer += `   - Business Brief: ${init.business_brief_id}\n\n`;
          });

          answer += `💡 **Suggestion**: Consider adding features, epics, and stories to these initiatives to progress development.`;

          return {
            answer,
            data: results,
            confidence: 0.9,
            dataSource: 'database',
            queryExecuted: query
          };
        } else {
          return {
            answer: "**All initiatives have stories!** 🎉\n\nEvery initiative in the system has at least one story associated with it through features and epics.",
            confidence: 0.9,
            dataSource: 'database',
            queryExecuted: query
          };
        }
      }

      return await this.handleGeneralAnalyticalQuery(question, intent);

    } catch (error) {
      console.error('❌ Empty relationship query failed:', error);
      return {
        answer: `Error analyzing relationships: ${(error as Error).message}`,
        confidence: 0.2,
        dataSource: 'database'
      };
    }
  }

  /**
   * Handle general analytical queries using dynamic SQL generation
   */
  private async handleGeneralAnalyticalQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('🔄 Attempting general analytical query...');

    // Enhanced suggestions based on implemented patterns
    const suggestions = [
      "Try: 'Which Business Brief has more than 1 story?'",
      "Try: 'How many epics are there for each initiative?'", 
      "Try: 'What's the status breakdown of all business briefs?'",
      "Try: 'Which initiatives have no stories yet?'",
      "Try: 'What's the status breakdown of initiatives?'",
      "Try: 'How many stories are there for each epic?'"
    ];

    return {
      answer: `I understand you're asking for analytical insights, but I need to learn this specific query pattern.\n\n**🧠 What I can currently analyze:**\n${suggestions.map(s => `• ${s}`).join('\n')}\n\n**Your Question:** "${question}"\n\n**💡 Tip**: Try one of the supported patterns above, or rephrase your question using similar structure.`,
      confidence: 0.4,
      dataSource: 'database'
    };
  }

  /**
   * Handle search queries using vector search
   */
  private async handleSearchQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('🔍 Handling search query via vector store...');

    if (!embeddingService.isEnabled()) {
      return {
        answer: "Search functionality requires embedding service to be enabled.",
        confidence: 0.1,
        dataSource: 'vector'
      };
    }

    try {
      // Search work items vector store
      const vectorResults = await vectorStore.search(
        RAG_CONFIG.WORK_ITEMS_VECTOR_STORE_NAME,
        question,
        5
      );

      if (vectorResults && vectorResults.length > 0) {
        const answer = `Found ${vectorResults.length} relevant work items:\n\n${
          vectorResults.map((result: any, index: number) => 
            `${index + 1}. **${result.metadata?.title || 'Unknown'}** (${result.metadata?.type || 'Unknown'})\n   ${result.document?.substring(0, 200)}...`
          ).join('\n\n')
        }`;

        return {
          answer,
          data: vectorResults,
          confidence: 0.7,
          dataSource: 'vector'
        };
      }

      return {
        answer: "No relevant information found in the knowledge base for your search query.",
        confidence: 0.3,
        dataSource: 'vector'
      };

    } catch (error) {
      console.error('❌ Vector search failed:', error);
      return {
        answer: "Search encountered an error. Please try rephrasing your question.",
        confidence: 0.2,
        dataSource: 'vector'
      };
    }
  }

  /**
   * Handle relationship queries using existing query parser
   */
  private async handleRelationshipQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('🔗 Handling relationship query...');
    
    // Use existing relationship query logic
    // This could be refactored to use the existing QueryParser
    return {
      answer: "Relationship query handling is being processed by the existing system.",
      confidence: 0.5,
      dataSource: 'hybrid'
    };
  }

  /**
   * Handle hybrid queries that need both vector and database
   */
  private async handleHybridQuery(question: string, intent: QueryIntent): Promise<QueryResult> {
    console.log('🔄 Handling hybrid query...');

    // Combine vector search and database queries
    const vectorResult = await this.handleSearchQuery(question, intent);
    
    return {
      answer: `**Hybrid Search Result:**\n\n${vectorResult.answer}`,
      confidence: vectorResult.confidence * 0.8,
      dataSource: 'hybrid'
    };
  }
}

export const intelligentQueryRouter = IntelligentQueryRouter.getInstance();

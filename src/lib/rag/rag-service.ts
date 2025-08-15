// RAG Service for Aura - Handles document queries and context-aware responses
import { vectorStore, embeddingService, databaseService } from '../database';
import { workItemService } from '../database/work-item-service';
import { workItemIndexer } from '../database/work-item-indexer';
import { QueryParser, QueryContext, WorkItemHierarchy } from './query-parser';
import { intelligentQueryRouter } from './intelligent-query-router';
import { RAG_CONFIG } from './config';
import type { ProcessedDocument, DocumentChunk } from './document-processor';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: RetrievedContext[];
}

export interface RetrievedContext {
  content: string;
  source: string;
  relevance: number;
  metadata: {
    fileName?: string;
    chunkIndex?: number;
    workItemId?: string;
    workItemType?: string;
  };
}

export interface ChatResponse {
  message: string;
  context: RetrievedContext[];
  sources: string[];
  confidence: number;
}

export interface SafeContext {
  stage: string;
  level: string;
  artifact?: string;
  guidance?: string;
}

export class RAGService {
  private openaiApiKey: string | null = null;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || process.env.AURA_EMBEDDING_API_KEY || null;
  }

  /**
   * Store processed document chunks in vector store
   */
  async storeDocument(document: ProcessedDocument): Promise<void> {
    console.log(`📚 Storing document ${document.fileName} in vector store...`);
    
    try {
      // First, store document metadata in the database
      await databaseService.createDocument({
        id: document.id,
        fileName: document.fileName,
        originalName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        filePath: `uploads/${document.fileName}`,
        uploadedBy: document.metadata.uploadedBy,
        uploadedAt: document.metadata.uploadedAt,
        processed: true,
        processedAt: new Date(),
        extractedText: document.extractedText,
        metadata: JSON.stringify(document.metadata)
      });

      // Prepare chunks for vector storage
      const vectorDocuments = document.chunks.map(chunk => ({
        id: `${document.id}_chunk_${chunk.metadata.chunkIndex}`,
        document: chunk.content,
        metadata: {
          source: chunk.metadata.source,
          fileName: chunk.metadata.fileName,
          fileType: chunk.metadata.fileType,
          chunkIndex: chunk.metadata.chunkIndex,
          totalChunks: chunk.metadata.totalChunks,
          documentId: document.id
        }
      }));

      // Store in vector database
      await vectorStore.insertDocuments(
        RAG_CONFIG.VECTOR_STORE_NAME,
        vectorDocuments
      );

      console.log(`✅ Document ${document.fileName} stored successfully with ${document.chunks.length} chunks`);
    } catch (error) {
      console.error(`❌ Failed to store document ${document.fileName}:`, error);
      throw error;
    }
  }

  /**
   * Query documents and work items for relevant context
   */
  async queryContext(question: string, maxResults = RAG_CONFIG.MAX_RETRIEVAL_RESULTS, conversationHistory: string[] = []): Promise<RetrievedContext[]> {
    console.log(`🔍 Querying context for: "${question.substring(0, 100)}..."`);
    
    // FIRST: Check if this is an analytical/aggregation query that needs intelligent routing
    const analyticalPatterns = [
      // Basic counting patterns (CRITICAL FIX)
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
      
      // Complex analytical patterns
      /which.*has more than|which.*have more than/i,
      /which.*contains.*more than/i,
      /list.*that have.*more than/i,
      /show.*where.*greater than/i,
      /find.*with.*count.*greater/i,
      /how many.*total|total.*count/i,
      /how many.*for each|how many.*per/i,
      /what.*percentage|what percent/i,
      /which.*most|which.*least/i,
      /compare.*between|comparison of/i,
      /analyze.*across|breakdown of/i,
      /status breakdown|breakdown.*status/i,
      /what.*status.*breakdown|what.*breakdown/i,
      /which.*have no|which.*without/i,
      /initiatives.*have no|epics.*have no|stories.*have no/i,
      /count.*for each|number.*for each/i
        ];
    
    const isAnalyticalQuery = analyticalPatterns.some(pattern => pattern.test(question));
    
    if (isAnalyticalQuery) {
      console.log('🧠 Detected analytical query - routing to intelligent query router');
      try {
        const intelligentResult = await intelligentQueryRouter.routeAndAnswer(question, conversationHistory);
        
        // Convert intelligent result to RetrievedContext format
        if (intelligentResult.confidence > 0.6) {
          return [{
            content: intelligentResult.answer,
            source: `Analytical Query - ${intelligentResult.dataSource}`,
            relevance: intelligentResult.confidence,
            metadata: {
              queryExecuted: intelligentResult.queryExecuted,
              dataSource: intelligentResult.dataSource,
              workItemType: 'analytical_result'
            }
          }];
        } else {
          console.log('⚠️ Intelligent router confidence too low, falling back to standard processing');
        }
      } catch (error) {
        console.error('❌ Intelligent query router failed, falling back:', error);
      }
    }
    
    // Parse query to understand intent (existing logic)
    const queryContext = QueryParser.parseQuery(question, conversationHistory);
    console.log(`📊 Query analysis:`, queryContext);
    
    const context: RetrievedContext[] = [];

    try {
      // Handle specific relationship queries
      if (queryContext.queryType === 'relationship' || queryContext.queryType === 'status') {
        const hierarchicalContext = await this.getHierarchicalContext(queryContext);
        context.push(...hierarchicalContext);
      }
      
      // Standard vector search for general queries
      if (queryContext.queryType === 'general' || context.length === 0) {
        // 1. Search document vectors
        const documentContext = await this.searchDocuments(question, maxResults);
        context.push(...documentContext);

        // 2. Search work items context
        const workItemContext = await this.searchWorkItems(question, maxResults);
        context.push(...workItemContext);
      }

      // 3. Check for SAFe-related queries
      if (this.isSafeRelatedQuery(question) || queryContext.requestedInfo === 'safe') {
        const safeContext = await this.searchSafeDocuments(question, maxResults);
        context.push(...safeContext);
      }

      // Sort by relevance and limit results
      context.sort((a, b) => b.relevance - a.relevance);
      return context.slice(0, maxResults * 2); // Allow more context for better responses

    } catch (error) {
      console.error('❌ Failed to query context:', error);
      return [];
    }
  }

  /**
   * Get hierarchical context for relationship queries
   */
  private async getHierarchicalContext(queryContext: QueryContext): Promise<RetrievedContext[]> {
    try {
      const hierarchy = await QueryParser.getWorkItemHierarchy(
        queryContext.workItemId,
        queryContext.workItemTitle
      );

      const context: RetrievedContext[] = [];

      // Build specific responses based on query type
      if (queryContext.requestedInfo === 'count') {
        context.push(this.buildCountResponse(hierarchy, queryContext));
      } else if (queryContext.requestedInfo === 'list') {
        context.push(...this.buildListResponse(hierarchy, queryContext));
      } else if (queryContext.requestedInfo === 'status') {
        context.push(...this.buildStatusResponse(hierarchy, queryContext));
      } else if (queryContext.requestedInfo === 'sdlc') {
        context.push(...this.buildSDLCResponse(hierarchy, queryContext));
      } else if (queryContext.requestedInfo === 'safe') {
        context.push(...this.buildSAFeResponse(hierarchy, queryContext));
      }

      return context;
    } catch (error) {
      console.error('❌ Failed to get hierarchical context:', error);
      return [];
    }
  }

  /**
   * Build count response for "how many" queries
   */
  private buildCountResponse(hierarchy: WorkItemHierarchy, queryContext: QueryContext): RetrievedContext {
    let content = '';
    let source = 'Work Item Count';

    // Handle count by work item ID (like BB-004)
    if (queryContext.workItemId?.startsWith('bb-')) {
      const businessBrief = hierarchy.businessBriefs[0];
      const epicCount = hierarchy.epics.length;
      const initiativeCount = hierarchy.initiatives.length;
      const featureCount = hierarchy.features.length;
      const storyCount = hierarchy.stories.length;

      if (queryContext.workItemType === 'epic') {
        if (epicCount > 0) {
          content = `**Yes, there are ${epicCount} epics for ${businessBrief?.title || queryContext.workItemId}:**\n\n`;
          hierarchy.epics.forEach(epic => {
            content += `• ${epic.title} (Status: ${epic.status}, Priority: ${epic.priority})\n`;
          });
        } else {
          content = `**There are 0 epics for ${businessBrief?.title || queryContext.workItemId}.**\n\nThe project currently has:\n- Initiatives: ${initiativeCount}\n- Features: ${featureCount}\n- Stories: ${storyCount}`;
        }
      } else {
        content = `BUSINESS BRIEF: ${businessBrief?.title || queryContext.workItemId}\n\nWORK ITEM BREAKDOWN:\n- Initiatives: ${initiativeCount}\n- Features: ${featureCount}\n- Epics: ${epicCount}\n- Stories: ${storyCount}`;
      }
      
      source = `${businessBrief?.title || queryContext.workItemId} - Count`;
    }
    
    // Handle count by work item title (like "Customer Portal Enhancement")
    else if (queryContext.workItemTitle) {
      const allItems = [
        ...hierarchy.businessBriefs.map(i => ({...i, type: 'Business Brief'})),
        ...hierarchy.initiatives.map(i => ({...i, type: 'Initiative'})),
        ...hierarchy.features.map(i => ({...i, type: 'Feature'})),
        ...hierarchy.epics.map(i => ({...i, type: 'Epic'})),
        ...hierarchy.stories.map(i => ({...i, type: 'Story'}))
      ];

      const requestedType = queryContext.workItemType === 'story' ? 'stories' : 
                           queryContext.workItemType === 'epic' ? 'epics' :
                           queryContext.workItemType === 'feature' ? 'features' :
                           queryContext.workItemType === 'initiative' ? 'initiatives' : 'items';

      const matchingItems = allItems.filter(item => 
        item.type.toLowerCase().includes(queryContext.workItemType || '') ||
        (queryContext.workItemType === 'story' && item.type === 'Story')
      );

      if (matchingItems.length > 0) {
        content = `**Yes, there ${matchingItems.length === 1 ? 'is' : 'are'} ${matchingItems.length} ${requestedType} for ${queryContext.workItemTitle}:**\n\n`;
        
        matchingItems.forEach(item => {
          content += `• ${item.title} (Status: ${item.status}, Priority: ${item.priority}`;
          if (item.completion_percentage !== undefined) {
            content += `, Completion: ${item.completion_percentage}%`;
          }
          content += `)\n`;
        });
        
        // Add hierarchy context if available
        if (hierarchy.businessBriefs.length > 0) {
          const mainProject = hierarchy.businessBriefs[0] || hierarchy.initiatives[0];
          if (mainProject) {
            content += `\nProject: ${mainProject.title}\nOverall Progress: ${mainProject.completion_percentage || 0}%`;
          }
        }
      } else {
        // Check if we found the project but no items of the requested type
        const hasProject = allItems.length > 0;
        if (hasProject) {
          content = `**There are 0 ${requestedType} for ${queryContext.workItemTitle}.**\n\nThe project currently has:\n`;
          const counts = {
            'Business Brief': allItems.filter(i => i.type === 'Business Brief').length,
            'Initiative': allItems.filter(i => i.type === 'Initiative').length,
            'Feature': allItems.filter(i => i.type === 'Feature').length,
            'Epic': allItems.filter(i => i.type === 'Epic').length,
            'Story': allItems.filter(i => i.type === 'Story').length,
          };
          
          Object.entries(counts).forEach(([type, count]) => {
            if (count > 0) {
              content += `- ${type}${count > 1 ? 's' : ''}: ${count}\n`;
            }
          });
        } else {
          content = `**No work items found for "${queryContext.workItemTitle}."**\n\nPlease check the project name spelling or try a different search term.`;
        }
      }
      
      source = `${queryContext.workItemTitle} - ${requestedType.charAt(0).toUpperCase() + requestedType.slice(1)} Count`;
    }

    return {
      content,
      source,
      relevance: 1.0,
      metadata: {
        queryType: 'count',
        workItemId: queryContext.workItemId,
        workItemTitle: queryContext.workItemTitle,
        workItemType: queryContext.workItemType
      }
    };
  }

  /**
   * Build list response for "list" queries
   */
  private buildListResponse(hierarchy: WorkItemHierarchy, queryContext: QueryContext): RetrievedContext[] {
    const context: RetrievedContext[] = [];

    // If searching by title (like "mobile payment integration")
    if (queryContext.workItemTitle) {
      // Find the main work item
      const allItems = [
        ...hierarchy.businessBriefs.map(i => ({...i, type: 'Business Brief'})),
        ...hierarchy.initiatives.map(i => ({...i, type: 'Initiative'})),
        ...hierarchy.features.map(i => ({...i, type: 'Feature'})),
        ...hierarchy.epics.map(i => ({...i, type: 'Epic'})),
        ...hierarchy.stories.map(i => ({...i, type: 'Story'}))
      ];

      const mainItem = allItems.find(item => 
        item.title.toLowerCase().includes(queryContext.workItemTitle!.toLowerCase())
      );

      if (mainItem) {
        // Build hierarchical listing
        let content = `${mainItem.type.toUpperCase()}: ${mainItem.title}
Status: ${mainItem.status}
Priority: ${mainItem.priority}
Workflow Stage: ${mainItem.workflow_stage}

RELATED WORK ITEMS:`;

        if (hierarchy.initiatives.length > 0) {
          content += `\n\nINITIATIVES (${hierarchy.initiatives.length}):`;
          hierarchy.initiatives.forEach(init => {
            content += `\n• ${init.title} (Status: ${init.status}, Priority: ${init.priority})`;
          });
        }

        if (hierarchy.features.length > 0) {
          content += `\n\nFEATURES (${hierarchy.features.length}):`;
          hierarchy.features.forEach(feature => {
            content += `\n• ${feature.title} (Status: ${feature.status}, Priority: ${feature.priority})`;
          });
        }

        if (hierarchy.epics.length > 0) {
          content += `\n\nEPICS (${hierarchy.epics.length}):`;
          hierarchy.epics.forEach(epic => {
            content += `\n• ${epic.title} (Status: ${epic.status}, Priority: ${epic.priority})`;
          });
        }

        if (hierarchy.stories.length > 0) {
          content += `\n\nSTORIES (${hierarchy.stories.length}):`;
          hierarchy.stories.forEach(story => {
            content += `\n• ${story.title} (Status: ${story.status}, Priority: ${story.priority})`;
          });
        }

        context.push({
          content,
          source: `${mainItem.title} - Hierarchical Breakdown`,
          relevance: 1.0,
          metadata: {
            queryType: 'list',
            mainItemType: mainItem.type,
            mainItemId: mainItem.id
          }
        });
      }
    }

    return context;
  }

  /**
   * Build status response for status queries
   */
  private buildStatusResponse(hierarchy: WorkItemHierarchy, queryContext: QueryContext): RetrievedContext[] {
    const context: RetrievedContext[] = [];

    // Combine all work items for status overview
    const allItems = [
      ...hierarchy.businessBriefs.map(i => ({...i, type: 'Business Brief'})),
      ...hierarchy.initiatives.map(i => ({...i, type: 'Initiative'})),
      ...hierarchy.features.map(i => ({...i, type: 'Feature'})), 
      ...hierarchy.epics.map(i => ({...i, type: 'Epic'})),
      ...hierarchy.stories.map(i => ({...i, type: 'Story'}))
    ];

    if (allItems.length > 0) {
      let content = 'WORK ITEM STATUS OVERVIEW:\n\n';

      allItems.forEach(item => {
        const sdlcStage = QueryParser.mapToSDLC(item.workflow_stage);
        content += `${item.type.toUpperCase()}: ${item.title}
• Status: ${item.status}
• Priority: ${item.priority}
• Workflow Stage: ${item.workflow_stage}
• SDLC Phase: ${sdlcStage}
• Completion: ${item.completion_percentage || 0}%

`;
      });

      context.push({
        content,
        source: 'Work Item Status Report',
        relevance: 1.0,
        metadata: {
          queryType: 'status',
          itemCount: allItems.length
        }
      });
    }

    return context;
  }

  /**
   * Build SDLC mapping response
   */
  private buildSDLCResponse(hierarchy: WorkItemHierarchy, queryContext: QueryContext): RetrievedContext[] {
    const context: RetrievedContext[] = [];

    const allItems = [
      ...hierarchy.businessBriefs.map(i => ({...i, type: 'Business Brief'})),
      ...hierarchy.initiatives.map(i => ({...i, type: 'Initiative'})),
      ...hierarchy.features.map(i => ({...i, type: 'Feature'})),
      ...hierarchy.epics.map(i => ({...i, type: 'Epic'})),
      ...hierarchy.stories.map(i => ({...i, type: 'Story'}))
    ];

    if (allItems.length > 0) {
      let content = 'SDLC STAGE MAPPING:\n\n';

      allItems.forEach(item => {
        const sdlcStage = QueryParser.mapToSDLC(item.workflow_stage);
        content += `${item.type.toUpperCase()}: ${item.title}
• Current Stage: ${item.workflow_stage}
• SDLC Phase: ${sdlcStage}
• Status: ${item.status}
• Completion: ${item.completion_percentage || 0}%

`;
      });

      context.push({
        content,
        source: 'SDLC Stage Mapping',
        relevance: 1.0,
        metadata: {
          queryType: 'sdlc',
          itemCount: allItems.length
        }
      });
    }

    return context;
  }

  /**
   * Build SAFe framework mapping response
   */
  private buildSAFeResponse(hierarchy: WorkItemHierarchy, queryContext: QueryContext): RetrievedContext[] {
    const context: RetrievedContext[] = [];

    const allItems = [
      ...hierarchy.businessBriefs.map(i => ({...i, type: 'businessBrief'})),
      ...hierarchy.initiatives.map(i => ({...i, type: 'initiative'})),
      ...hierarchy.features.map(i => ({...i, type: 'feature'})),
      ...hierarchy.epics.map(i => ({...i, type: 'epic'})),
      ...hierarchy.stories.map(i => ({...i, type: 'story'}))
    ];

    if (allItems.length > 0) {
      let content = 'SAFe FRAMEWORK MAPPING:\n\n';

      allItems.forEach(item => {
        const safeStage = QueryParser.mapToSAFe(item.workflow_stage, item.type);
        content += `${item.type.toUpperCase()}: ${item.title}
• Current Stage: ${item.workflow_stage}
• SAFe Process: ${safeStage}
• Status: ${item.status}
• Completion: ${item.completion_percentage || 0}%

`;
      });

      context.push({
        content,
        source: 'SAFe Framework Mapping',
        relevance: 1.0,
        metadata: {
          queryType: 'safe',
          itemCount: allItems.length
        }
      });
    }

    return context;
  }

  /**
   * Generate response using retrieved context
   */
  async generateResponse(question: string, context: RetrievedContext[]): Promise<ChatResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY or AURA_EMBEDDING_API_KEY environment variable.');
    }

    try {
      // Prepare context string
      const contextString = context
        .map(ctx => `Source: ${ctx.source}\nContent: ${ctx.content}`)
        .join('\n\n---\n\n');

      // Build prompt with context
      const prompt = RAG_CONFIG.CONTEXT_PROMPT
        .replace('{context}', contextString)
        .replace('{question}', question);

      // Call OpenAI API (simplified - would use actual OpenAI SDK)
      const response = await this.callOpenAI(prompt);
      
      const sources = [...new Set(context.map(ctx => ctx.source))];
      const confidence = this.calculateConfidence(context, question);

      return {
        message: response,
        context,
        sources,
        confidence
      };

    } catch (error) {
      console.error('❌ Failed to generate response:', error);
      throw error;
    }
  }

  /**
   * Search document vectors for relevant content
   */
  private async searchDocuments(query: string, maxResults: number): Promise<RetrievedContext[]> {
    try {
      // Check if vector store exists before searching
      const stores = await vectorStore.listVectorStores();
      if (!stores.includes(RAG_CONFIG.VECTOR_STORE_NAME)) {
        console.log(`📝 Vector store '${RAG_CONFIG.VECTOR_STORE_NAME}' doesn't exist yet. Create it by uploading documents.`);
        return [];
      }

      const results = await vectorStore.search(
        RAG_CONFIG.VECTOR_STORE_NAME,
        query,
        maxResults
      );

      return results.map((result: any) => ({
        content: result.content || result.document,
        source: result.metadata?.fileName || result.metadata?.source || 'Unknown Document',
        relevance: 1 - (result.distance || 0), // Convert distance to relevance score
        metadata: {
          fileName: result.metadata?.fileName,
          chunkIndex: result.metadata?.chunkIndex
        }
      }));
    } catch (error) {
      console.warn('⚠️ Document search failed:', error);
      return [];
    }
  }

  /**
   * Search work items for relevant context
   */
  private async searchWorkItems(query: string, maxResults: number): Promise<RetrievedContext[]> {
    try {
      // First try vector search for work items
      const vectorResults = await workItemIndexer.searchWorkItems(query, maxResults);
      
      if (vectorResults && vectorResults.length > 0) {
        console.log(`📊 Found ${vectorResults.length} work items via vector search`);
        return vectorResults.map((result) => ({
          content: result.content,
          source: `${result.metadata.type.toUpperCase()} - ${result.metadata.title}`,
          relevance: 1 - result.distance, // Convert distance to relevance (lower distance = higher relevance)
          metadata: {
            workItemId: result.metadata.id,
            workItemType: result.metadata.type,
            status: result.metadata.status,
            priority: result.metadata.priority
          }
        }));
      }

      // Fallback to text search if vector search doesn't find results
      console.log('📝 Falling back to text-based work item search');
      const searchResults = await workItemService.searchWorkItemsByText(query);
      
      if (!searchResults || searchResults.length === 0) {
        return [];
      }

      return searchResults.slice(0, maxResults).map((item) => ({
        content: `${item.title}: ${item.description}\nStatus: ${item.status}\nPriority: ${item.priority}${item.assignedTo ? `\nAssigned to: ${item.assignedTo}` : ''}`,
        source: `${item.type.replace('_', ' ').toUpperCase()} - ${item.title}`,
        relevance: 0.7, // Lower relevance for text search fallback
        metadata: {
          workItemId: item.id,
          workItemType: item.type
        }
      }));
    } catch (error) {
      console.warn('⚠️ Work item search failed:', error);
      return [];
    }
  }

  /**
   * Search SAFe documents for framework guidance
   */
  private async searchSafeDocuments(query: string, maxResults: number): Promise<RetrievedContext[]> {
    try {
      // Check if SAFe vector store exists before searching
      const stores = await vectorStore.listVectorStores();
      if (!stores.includes(RAG_CONFIG.SAFE_VECTOR_STORE)) {
        console.log(`📚 SAFe vector store '${RAG_CONFIG.SAFE_VECTOR_STORE}' doesn't exist yet. Upload SAFe documentation to enable SAFe-aware responses.`);
        return [];
      }

      const results = await vectorStore.search(
        RAG_CONFIG.SAFE_VECTOR_STORE,
        query,
        maxResults
      );

      return results.map((result: any) => ({
        content: result.content || result.document,
        source: `SAFe Framework - ${result.metadata?.source || 'Documentation'}`,
        relevance: 1 - (result.distance || 0),
        metadata: {
          fileName: result.metadata?.fileName
        }
      }));
    } catch (error) {
      console.warn('⚠️ SAFe document search failed:', error);
      return [];
    }
  }

  /**
   * Check if query is related to SAFe framework
   */
  private isSafeRelatedQuery(query: string): boolean {
    const safeKeywords = [
      'safe', 'scaled agile', 'agile framework', 'epic', 'feature', 'portfolio',
      'program increment', 'pi', 'art', 'agile release train', 'value stream',
      'lean', 'devops', 'continuous', 'solution', 'capability'
    ];
    
    const lowerQuery = query.toLowerCase();
    return safeKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Calculate confidence score based on context relevance
   */
  private calculateConfidence(context: RetrievedContext[], query: string): number {
    if (context.length === 0) return 0;
    
    const avgRelevance = context.reduce((sum, ctx) => sum + ctx.relevance, 0) / context.length;
    const contextCoverage = Math.min(context.length / RAG_CONFIG.MAX_RETRIEVAL_RESULTS, 1);
    
    return Math.round((avgRelevance * 0.7 + contextCoverage * 0.3) * 100) / 100;
  }

  /**
   * Simplified OpenAI API call (placeholder)
   */
  private async callOpenAI(prompt: string): Promise<string> {
    // Try to get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY || process.env.AURA_EMBEDDING_API_KEY;
    
    if (!apiKey) {
      console.log('🤖 Creating context-based response (OpenAI API not configured)');
      
      // Extract context from the prompt
      const contextMatch = prompt.match(/Context:([\s\S]*?)Please answer/);
      if (contextMatch) {
        const contextText = contextMatch[1].trim();
        
        // Parse context to find relevant work items
        const workItems = this.parseContextForWorkItems(contextText);
        
        if (workItems.length > 0) {
          return this.createContextualResponse(workItems, prompt);
        }
      }
      
      return `I found some relevant information but couldn't process it fully. To enable enhanced AI responses, please configure an OpenAI API key in your .env file.`;
    }

    try {
      // Use actual OpenAI API
      console.log('🤖 Calling OpenAI API with context and prompt');
      
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // More cost-effective than gpt-4o
        messages: [
          {
            role: 'system',
            content: 'You are Aura, an intelligent SDLC assistant. Provide helpful, concise answers about work items, project status, and development processes based on the provided context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message?.content || "I couldn't generate a response at this time.";
      
    } catch (error: any) {
      console.error('❌ OpenAI API Error:', error.message);
      
      // Fallback to context-based response
      const contextMatch = prompt.match(/Context:([\s\S]*?)Please answer/);
      if (contextMatch) {
        const contextText = contextMatch[1].trim();
        const workItems = this.parseContextForWorkItems(contextText);
        
        if (workItems.length > 0) {
          return this.createContextualResponse(workItems, prompt);
        }
      }
      
      return `I encountered an issue accessing the AI service. Please check your OpenAI API key configuration.`;
    }
  }

  /**
   * Parse context text to extract work item information
   */
  private parseContextForWorkItems(contextText: string): any[] {
    const workItems: any[] = [];
    const sources = contextText.split('---');
    
    sources.forEach(source => {
      const lines = source.split('\n').filter(line => line.trim());
      if (lines.length >= 2) {
        const sourceLine = lines.find(l => l.startsWith('Source:'));
        const contentLine = lines.find(l => l.startsWith('Content:'));
        
        if (sourceLine && contentLine) {
          const content = contentLine.replace('Content:', '').trim();
          const sourceInfo = sourceLine.replace('Source:', '').trim();
          
          // Parse content for work item details - handle multiline content
          const lines = content.split('\n');
          const titleMatch = content.match(/^([^:]+):/);
          const statusMatch = content.match(/Status:\s*(\w+)/i);
          const priorityMatch = content.match(/Priority:\s*(\w+)/i);
          
          // Debug logging
          console.log('🔍 Parsing content:', content);
          console.log('🔍 Status match:', statusMatch);
          console.log('🔍 Priority match:', priorityMatch);
          
          if (titleMatch) {
            workItems.push({
              title: titleMatch[1].trim(),
              status: statusMatch ? statusMatch[1] : 'unknown',
              priority: priorityMatch ? priorityMatch[1] : 'unknown',
              source: sourceInfo,
              content: content
            });
          }
        }
      }
    });
    
    return workItems;
  }

  /**
   * Create contextual response based on work items - simplified approach using raw content
   */
  private createContextualResponse(workItems: any[], originalPrompt: string): string {
    const question = originalPrompt.toLowerCase();
    
    // For now, let's just use the raw content directly since it's formatted well
    if (workItems.length === 1) {
      const item = workItems[0];
      
      if (question.includes('status') || question.includes('tell me about') || question.includes('what is')) {
        return `Here's what I found about your work item:

**${item.content}**

Source: ${item.source}

This information comes directly from your Aura database.`;
      }
    }
    
    // Handle multiple items
    if (workItems.length > 1) {
      if (question.includes('status') || question.includes('how many')) {
        const workItemsList = workItems.map(item => `• **${item.content}**`).join('\n\n');
        
        return `I found ${workItems.length} relevant work items:\n\n${workItemsList}\n\nAll items are tracked in your Aura database.`;
      }
    }
    
    // Generic response with all context
    const contentList = workItems.map(item => `• ${item.content}`).join('\n');
    return `Here's what I found:\n\n${contentList}\n\n*Source: Your Aura database*`;
  }

  /**
   * Get available vector stores
   */
  async getAvailableVectorStores(): Promise<string[]> {
    try {
      const stores = await vectorStore.listVectorStores();
      return stores;
    } catch (error) {
      console.warn('⚠️ Failed to list vector stores:', error);
      return [];
    }
  }

  /**
   * Clear vector store
   */
  async clearVectorStore(storeName: string): Promise<void> {
    await vectorStore.deleteVectorStore(storeName);
    await vectorStore.createVectorStore({ name: storeName });
  }
}

export default RAGService;

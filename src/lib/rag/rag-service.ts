// RAG Service for Aura - Handles document queries and context-aware responses
import { vectorStore, embeddingService, databaseService } from '../database';
import { workItemService } from '../database/work-item-service';
import { workItemIndexer } from '../database/work-item-indexer';
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
  async queryContext(question: string, maxResults = RAG_CONFIG.MAX_RETRIEVAL_RESULTS): Promise<RetrievedContext[]> {
    console.log(`🔍 Querying context for: "${question.substring(0, 100)}..."`);
    
    const context: RetrievedContext[] = [];

    try {
      // 1. Search document vectors
      const documentContext = await this.searchDocuments(question, maxResults);
      context.push(...documentContext);

      // 2. Search work items context
      const workItemContext = await this.searchWorkItems(question, maxResults);
      context.push(...workItemContext);

      // 3. Check for SAFe-related queries
      if (this.isSafeRelatedQuery(question)) {
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

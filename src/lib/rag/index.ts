// RAG System Main Export
export { DocumentProcessor } from './document-processor';
export { RAGService } from './rag-service';
export { RAG_CONFIG } from './config';

export type {
  DocumentChunk,
  ProcessedDocument,
  ChatMessage,
  RetrievedContext,
  ChatResponse,
  SafeContext
} from './document-processor';

export type {
  RetrievedContext as RAGRetrievedContext,
  ChatMessage as RAGChatMessage,
  ChatResponse as RAGChatResponse
} from './rag-service';

// Re-export config type
export type { RagConfig } from './config';

// Create singleton instances
import { DocumentProcessor } from './document-processor';
import { RAGService } from './rag-service';

export const documentProcessor = new DocumentProcessor();
export const ragService = new RAGService();

// Utility functions
export function isRagEnabled(): boolean {
  // Check multiple possible environment variable names for API keys
  const hasOpenAI = !!(process.env.OPENAI_API_KEY || process.env.OPENAI_KEY);
  const hasGoogle = !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const hasAuraEmbedding = !!process.env.AURA_EMBEDDING_API_KEY;
  
  console.log('🔍 RAG Enablement Check:', {
    hasOpenAI,
    hasGoogle, 
    hasAuraEmbedding,
    enabled: hasOpenAI || hasGoogle || hasAuraEmbedding
  });
  
  return hasOpenAI || hasGoogle || hasAuraEmbedding;
}

export function getRagStatus() {
  return {
    enabled: isRagEnabled(),
    embeddingService: process.env.AURA_EMBEDDING_PROVIDER || 'Not configured',
    apiKeyConfigured: !!(process.env.OPENAI_API_KEY || process.env.AURA_EMBEDDING_API_KEY),
    vectorStoreReady: true // Always true since we use MariaDB
  };
}

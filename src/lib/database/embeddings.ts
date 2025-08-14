// Embedding service for Aura's RAG functionality
import OpenAI from 'openai';
import { EMBEDDING_CONFIG, EMBEDDING_DIMENSIONS } from './config';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class EmbeddingService {
  private static instance: EmbeddingService;
  private openaiClient: OpenAI | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!EMBEDDING_CONFIG.enabled) {
      console.log('⚠️ Embedding service disabled - no provider configured');
      return;
    }

    try {
      switch (EMBEDDING_CONFIG.provider) {
        case 'openai':
          if (!EMBEDDING_CONFIG.apiKey) {
            throw new Error('OpenAI API key required for embedding service');
          }
          
          this.openaiClient = new OpenAI({
            apiKey: EMBEDDING_CONFIG.apiKey,
          });
          
          // Test the connection
          await this.testConnection();
          break;
          
        case 'gemini':
          throw new Error('Gemini embedding provider not yet implemented in Aura');
          
        case 'huggingface':
          throw new Error('HuggingFace embedding provider not yet implemented in Aura');
          
        default:
          throw new Error(`Unsupported embedding provider: ${EMBEDDING_CONFIG.provider}`);
      }

      this.isInitialized = true;
      console.log(`✅ Embedding service initialized with provider: ${EMBEDDING_CONFIG.provider}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize embedding service:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    if (EMBEDDING_CONFIG.provider === 'openai' && this.openaiClient) {
      try {
        // Test with a simple embedding request
        await this.openaiClient.embeddings.create({
          model: EMBEDDING_CONFIG.model || 'text-embedding-3-small',
          input: 'test connection',
        });
        console.log('✅ Embedding service connection test successful');
      } catch (error) {
        console.error('❌ Embedding service connection test failed:', error);
        throw error;
      }
    }
  }

  public async embed(
    text: string | string[], 
    model?: string
  ): Promise<EmbeddingResult | EmbeddingResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!EMBEDDING_CONFIG.enabled) {
      throw new Error('Embedding service not available - no provider configured');
    }

    const targetModel = model || EMBEDDING_CONFIG.model || 'text-embedding-3-small';
    const isArray = Array.isArray(text);
    const inputs = isArray ? text : [text];

    // Validate inputs
    if (inputs.some(input => !input || typeof input !== 'string')) {
      throw new Error('All inputs must be non-empty strings');
    }

    try {
      switch (EMBEDDING_CONFIG.provider) {
        case 'openai':
          return await this.embedWithOpenAI(inputs, targetModel, isArray);
          
        default:
          throw new Error(`Embedding provider ${EMBEDDING_CONFIG.provider} not implemented`);
      }
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      throw error;
    }
  }

  private async embedWithOpenAI(
    texts: string[], 
    model: string,
    returnArray: boolean
  ): Promise<EmbeddingResult | EmbeddingResult[]> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.embeddings.create({
      model,
      input: texts,
    });

    const results = response.data.map((item, index) => ({
      embedding: item.embedding,
      model: model,
      usage: index === 0 ? {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      } : undefined
    }));

    return returnArray ? results : results[0];
  }

  public getEmbeddingDimension(model?: string): number {
    const targetModel = model || EMBEDDING_CONFIG.model || 'text-embedding-3-small';
    
    if (EMBEDDING_CONFIG.provider === 'openai') {
      return EMBEDDING_DIMENSIONS[targetModel as keyof typeof EMBEDDING_DIMENSIONS] || 1536;
    }
    
    if (EMBEDDING_CONFIG.provider === 'gemini') {
      return EMBEDDING_DIMENSIONS.gemini[targetModel as keyof typeof EMBEDDING_DIMENSIONS.gemini] || 768;
    }
    
    return 1536; // Default dimension
  }

  public isEnabled(): boolean {
    return EMBEDDING_CONFIG.enabled && this.isInitialized;
  }

  public getProvider(): string | null {
    return EMBEDDING_CONFIG.provider;
  }

  public getModel(): string | null {
    return EMBEDDING_CONFIG.model || null;
  }

  // Utility method to convert embeddings to MariaDB VECTOR format
  public embeddingToVectorString(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  // Utility method to parse MariaDB VECTOR format back to array
  public vectorStringToEmbedding(vectorString: string): number[] {
    try {
      // Remove brackets and split by comma
      const cleaned = vectorString.replace(/^\[|\]$/g, '');
      return cleaned.split(',').map(num => parseFloat(num.trim()));
    } catch (error) {
      console.error('Error parsing vector string:', error);
      return [];
    }
  }
}

// Export singleton instance
export const embeddingService = EmbeddingService.getInstance();


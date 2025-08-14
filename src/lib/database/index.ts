// Main database module exports for Aura
export { db, DatabaseConnection } from './connection';
export { embeddingService, EmbeddingService } from './embeddings';
export { vectorStore, VectorStoreService } from './vector-store';
export { databaseService } from './service';
export type { DatabaseService } from './service';
export { workItemIndexer } from './work-item-indexer';
export { DatabaseSchema } from './schema';

// Import services for internal use
import { db } from './connection';
import { embeddingService } from './embeddings';
import { vectorStore } from './vector-store';
export { 
  DATABASE_CONFIG, 
  EMBEDDING_CONFIG, 
  validateConfig,
  OPENAI_MODELS,
  EMBEDDING_DIMENSIONS 
} from './config';

// Export types
export type {
  DatabaseConfig,
  EmbeddingConfig
} from './config';

export type {
  EmbeddingResult
} from './embeddings';

export type {
  VectorDocument,
  VectorSearchResult,
  VectorStoreConfig
} from './vector-store';

export type {
  BusinessBrief,
  Initiative,
  Feature,
  Epic,
  Story,
  TestCase,
  Document,
  SafeMapping
} from './schema';

// Initialization function for Aura
export async function initializeAuraDatabase(): Promise<{
  success: boolean;
  message: string;
  services: {
    database: boolean;
    embeddings: boolean;
    vectorStore: boolean;
  };
}> {
  const services = {
    database: false,
    embeddings: false,
    vectorStore: false
  };

  try {
    console.log('🚀 Initializing Aura Database System...');

    // Initialize main database service
    await databaseService.initialize();
    services.database = true;
    console.log('✅ Database service initialized');

    // Initialize embedding service if enabled
    try {
      await embeddingService.initialize();
      services.embeddings = embeddingService.isEnabled();
      if (services.embeddings) {
        console.log('✅ Embedding service initialized');
      } else {
        console.log('⚠️ Embedding service disabled (no provider configured)');
      }
    } catch (error) {
      console.warn('⚠️ Embedding service initialization failed:', error);
      services.embeddings = false;
    }

    // Vector store is available if embeddings are available
    services.vectorStore = services.embeddings;
    if (services.vectorStore) {
      console.log('✅ Vector store service available');
    } else {
      console.log('⚠️ Vector store service unavailable (requires embedding service)');
    }

    const successMessage = `Aura Database System initialized successfully! 
    Services: Database ✅ | Embeddings ${services.embeddings ? '✅' : '⚠️'} | Vector Store ${services.vectorStore ? '✅' : '⚠️'}`;

    return {
      success: true,
      message: successMessage,
      services
    };

  } catch (error) {
    const errorMessage = `Failed to initialize Aura Database System: ${error}`;
    console.error('❌', errorMessage);
    
    return {
      success: false,
      message: errorMessage,
      services
    };
  }
}

// Health check function
export async function checkAuraDatabaseHealth(): Promise<{
  healthy: boolean;
  services: {
    database: { connected: boolean; error?: string };
    embeddings: { enabled: boolean; provider?: string | null };
    vectorStore: { available: boolean; storeCount?: number };
  };
}> {
  const health = {
    healthy: true,
    services: {
      database: { connected: false },
      embeddings: { enabled: false },
      vectorStore: { available: false }
    }
  };

  try {
    // Check database connection
    try {
      health.services.database.connected = db.isConnected();
      
      if (!health.services.database.connected) {
        await db.initialize();
        health.services.database.connected = db.isConnected();
      }
    } catch (error) {
      health.services.database.connected = false;
      health.services.database.error = `Connection failed: ${error}`;
      health.healthy = false;
    }

    // Check embedding service
    try {
      health.services.embeddings.enabled = embeddingService.isEnabled();
      health.services.embeddings.provider = embeddingService.getProvider();
    } catch (error) {
      health.services.embeddings.enabled = false;
      health.services.embeddings.provider = null;
      console.warn('Embedding service check failed:', error);
    }

    // Check vector store
    health.services.vectorStore.available = health.services.embeddings.enabled;
    if (health.services.vectorStore.available) {
      try {
        const stores = await vectorStore.listVectorStores();
        health.services.vectorStore.storeCount = stores.length;
      } catch (error) {
        // Vector store check failed but service might still be available
        health.services.vectorStore.storeCount = 0;
      }
    }

  } catch (error) {
    health.healthy = false;
    console.error('Health check failed:', error);
  }

  return health;
}

// Utility function to create default vector stores for RAG functionality
export async function createDefaultVectorStores(): Promise<void> {
  if (!embeddingService.isEnabled()) {
    console.log('⚠️ Cannot create vector stores - embedding service not enabled');
    return;
  }

  const defaultStores = [
    {
      name: 'aura_documents',
      embeddingModel: embeddingService.getModel() || 'text-embedding-3-small',
      distanceFunction: 'cosine' as const,
    },
    {
      name: 'aura_safe_framework',
      embeddingModel: embeddingService.getModel() || 'text-embedding-3-small',
      distanceFunction: 'cosine' as const,
    },
    {
      name: 'aura_requirements',
      embeddingModel: embeddingService.getModel() || 'text-embedding-3-small',
      distanceFunction: 'cosine' as const,
    }
  ];

  for (const storeConfig of defaultStores) {
    try {
      await vectorStore.createVectorStore(storeConfig);
      console.log(`✅ Default vector store '${storeConfig.name}' ready`);
    } catch (error) {
      console.warn(`⚠️ Failed to create vector store '${storeConfig.name}':`, error);
    }
  }
}

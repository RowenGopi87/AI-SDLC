// RAG System Status API Route
import { NextResponse } from 'next/server';
import { ragService, isRagEnabled, getRagStatus } from '@/lib/rag';
import { embeddingService, vectorStore, db } from '@/lib/database';

export async function GET() {
  console.log('🔍 RAG Status check requested');
  
  try {
    const status = {
      timestamp: new Date().toISOString(),
      healthy: true,
      services: {
        rag: {
          enabled: false,
          ready: false,
          error: null as string | null
        },
        embedding: {
          enabled: false,
          provider: null as string | null,
          ready: false,
          error: null as string | null
        },
        vectorStore: {
          available: false,
          stores: [] as string[],
          ready: false,
          error: null as string | null
        },
        database: {
          connected: false,
          ready: false,
          error: null as string | null
        }
      },
      features: {
        documentUpload: false,
        contextualChat: false,
        workItemIntegration: false,
        safeIntegration: false
      },
      configuration: {
        maxFileSize: 0,
        allowedExtensions: [] as string[],
        chunkSize: 0,
        maxResults: 0
      }
    };

    // Check RAG service
    try {
      const ragStatus = getRagStatus();
      status.services.rag.enabled = ragStatus.enabled;
      status.services.rag.ready = ragStatus.apiKeyConfigured && ragStatus.vectorStoreReady;
    } catch (error: any) {
      status.services.rag.error = error.message;
      status.healthy = false;
    }

    // Check embedding service
    try {
      status.services.embedding.enabled = embeddingService.isEnabled();
      status.services.embedding.provider = embeddingService.getProvider();
      status.services.embedding.ready = status.services.embedding.enabled;
    } catch (error: any) {
      status.services.embedding.error = error.message;
      status.services.embedding.enabled = false;
    }

    // Check vector store
    try {
      if (status.services.embedding.enabled) {
        const stores = await ragService.getAvailableVectorStores();
        status.services.vectorStore.available = true;
        status.services.vectorStore.stores = stores;
        status.services.vectorStore.ready = stores.length > 0;
      }
    } catch (error: any) {
      status.services.vectorStore.error = error.message;
      status.services.vectorStore.available = false;
    }

    // Check database connection
    try {
      status.services.database.connected = db.isConnected();
      status.services.database.ready = status.services.database.connected;
    } catch (error: any) {
      status.services.database.error = error.message;
      status.services.database.connected = false;
      status.healthy = false;
    }

    // Set features based on service status
    status.features.documentUpload = status.services.rag.ready && status.services.database.ready;
    status.features.contextualChat = status.services.rag.ready && status.services.vectorStore.ready;
    status.features.workItemIntegration = status.services.database.ready;
    status.features.safeIntegration = status.services.vectorStore.ready;

    // Set configuration
    const { RAG_CONFIG } = await import('@/lib/rag/config');
    status.configuration = {
      maxFileSize: RAG_CONFIG.MAX_FILE_SIZE,
      allowedExtensions: RAG_CONFIG.ALLOWED_EXTENSIONS,
      chunkSize: RAG_CONFIG.CHUNK_SIZE,
      maxResults: RAG_CONFIG.MAX_RETRIEVAL_RESULTS
    };

    // Overall health check
    const criticalServices = [
      status.services.database.ready
    ];
    
    const optionalServices = [
      status.services.rag.ready,
      status.services.embedding.ready,
      status.services.vectorStore.ready
    ];

    // System is healthy if database is working (RAG features are optional)
    status.healthy = criticalServices.every(service => service);

    const httpStatus = status.healthy ? 200 : 503;
    
    console.log(`✅ RAG Status check completed (healthy: ${status.healthy})`);
    
    return NextResponse.json(status, { status: httpStatus });

  } catch (error: any) {
    console.error('❌ RAG Status check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      healthy: false,
      error: 'Status check failed',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Vector store service for Aura's RAG functionality using MariaDB
import { db } from './connection';
import { embeddingService, EmbeddingResult } from './embeddings';

export interface VectorDocument {
  id: string;
  document: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface VectorSearchResult {
  id: string;
  document: string;
  metadata: Record<string, any>;
  distance: number;
}

export interface VectorStoreConfig {
  name: string;
  embeddingModel?: string;
  distanceFunction?: 'cosine' | 'euclidean';
  dimension?: number;
}

export class VectorStoreService {
  private static instance: VectorStoreService;

  private constructor() {}

  public static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  /**
   * Create a new vector store table in MariaDB
   */
  public async createVectorStore(config: VectorStoreConfig): Promise<void> {
    const {
      name,
      embeddingModel = 'text-embedding-3-small',
      distanceFunction = 'cosine',
      dimension
    } = config;

    // Get embedding dimension
    const embeddingDim = dimension || embeddingService.getEmbeddingDimension(embeddingModel);
    
    // Validate inputs
    if (!name || !name.match(/^[a-zA-Z][a-zA-Z0-9_]*$/)) {
      throw new Error('Vector store name must be a valid identifier');
    }

    if (embeddingDim <= 0) {
      throw new Error('Invalid embedding dimension');
    }

    const distanceFunc = distanceFunction.toUpperCase();
    if (!['COSINE', 'EUCLIDEAN'].includes(distanceFunc)) {
      throw new Error('Distance function must be either cosine or euclidean');
    }

    // Check if table already exists
    const exists = await db.tableExists(name);
    if (exists) {
      console.log(`✅ Vector store '${name}' already exists`);
      return;
    }

    try {
      // Create the vector store table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${name}\` (
          id VARCHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
          document TEXT NOT NULL,
          embedding VECTOR(${embeddingDim}) NOT NULL,
          metadata JSON NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          VECTOR INDEX embedding_idx (embedding) DISTANCE=${distanceFunc}
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      await db.execute(createTableQuery);
      console.log(`✅ Vector store '${name}' created successfully with ${distanceFunc} distance`);
      
    } catch (error) {
      console.error(`❌ Failed to create vector store '${name}':`, error);
      throw error;
    }
  }

  /**
   * Insert documents into a vector store
   */
  public async insertDocuments(
    storeName: string,
    documents: VectorDocument[]
  ): Promise<{ inserted: number; errors: string[] }> {
    if (!documents || documents.length === 0) {
      throw new Error('No documents provided');
    }

    // Validate store exists
    const exists = await db.tableExists(storeName);
    if (!exists) {
      throw new Error(`Vector store '${storeName}' does not exist`);
    }

    let inserted = 0;
    const errors: string[] = [];

    try {
      // Process documents in batches to avoid overwhelming the embedding service
      const batchSize = 10;
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        // Extract text for embedding
        const texts = batch.map(doc => doc.document);
        
        try {
          // Generate embeddings for this batch
          const embeddingResults = await embeddingService.embed(texts) as EmbeddingResult[];
          const embeddings = Array.isArray(embeddingResults) ? embeddingResults : [embeddingResults];
          
          // Insert documents with embeddings
          for (let j = 0; j < batch.length; j++) {
            const doc = batch[j];
            const embedding = embeddings[j]?.embedding;
            
            if (!embedding) {
              errors.push(`Failed to generate embedding for document ${doc.id}`);
              continue;
            }

            try {
              const insertQuery = `
                INSERT INTO \`${storeName}\` (id, document, embedding, metadata)
                VALUES (?, ?, VEC_FromText(?), ?)
              `;
              
              const embeddingStr = JSON.stringify(embedding);
              const metadataStr = JSON.stringify(doc.metadata || {});
              
              await db.execute(insertQuery, [
                doc.id,
                doc.document,
                embeddingStr,
                metadataStr
              ]);
              
              inserted++;
              
            } catch (error) {
              console.error(`Error inserting document ${doc.id}:`, error);
              errors.push(`Failed to insert document ${doc.id}: ${error}`);
            }
          }
          
        } catch (error) {
          console.error('Error generating embeddings for batch:', error);
          batch.forEach(doc => {
            errors.push(`Failed to process document ${doc.id}: embedding generation failed`);
          });
        }
      }
      
      console.log(`✅ Inserted ${inserted}/${documents.length} documents into '${storeName}'`);
      
      return { inserted, errors };
      
    } catch (error) {
      console.error(`❌ Failed to insert documents into '${storeName}':`, error);
      throw error;
    }
  }

  /**
   * Search for similar documents in a vector store
   */
  public async search(
    storeName: string,
    query: string,
    limit: number = 5,
    threshold?: number
  ): Promise<VectorSearchResult[]> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    // Validate store exists
    const exists = await db.tableExists(storeName);
    if (!exists) {
      throw new Error(`Vector store '${storeName}' does not exist`);
    }

    try {
      // Generate embedding for the query
      const embeddingResult = await embeddingService.embed(query) as EmbeddingResult;
      const queryEmbedding = embeddingResult.embedding;
      
      if (!queryEmbedding) {
        throw new Error('Failed to generate embedding for search query');
      }

      // Perform vector search
      let searchQuery = `
        SELECT 
          id,
          document,
          metadata,
          VEC_DISTANCE_COSINE(embedding, VEC_FromText(?)) AS distance
        FROM \`${storeName}\`
        ORDER BY distance ASC
        LIMIT ?
      `;

      const params = [JSON.stringify(queryEmbedding), limit];

      // Add threshold filter if provided
      if (threshold !== undefined) {
        searchQuery = `
          SELECT 
            id,
            document,
            metadata,
            VEC_DISTANCE_COSINE(embedding, VEC_FromText(?)) AS distance
          FROM \`${storeName}\`
          WHERE VEC_DISTANCE_COSINE(embedding, VEC_FromText(?)) <= ?
          ORDER BY distance ASC
          LIMIT ?
        `;
        params.unshift(JSON.stringify(queryEmbedding));
        params.push(threshold);
      }

      const results = await db.execute<{
        id: string;
        document: string;
        metadata: string;
        distance: number;
      }>(searchQuery, params);

      // Parse and return results
      return results.map(row => ({
        id: row.id,
        document: row.document,
        metadata: this.parseMetadata(row.metadata),
        distance: row.distance
      }));

    } catch (error) {
      console.error(`❌ Vector search failed in '${storeName}':`, error);
      throw error;
    }
  }

  /**
   * List all vector stores
   */
  public async listVectorStores(): Promise<string[]> {
    try {
      // Find tables with VECTOR columns (indicating vector stores)
      const query = `
        SELECT DISTINCT TABLE_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND DATA_TYPE = 'VECTOR'
        ORDER BY TABLE_NAME
      `;
      
      const results = await db.execute<{ TABLE_NAME: string }>(query);
      return results.map(row => row.TABLE_NAME);
      
    } catch (error) {
      console.error('❌ Failed to list vector stores:', error);
      throw error;
    }
  }

  /**
   * Delete a vector store
   */
  public async deleteVectorStore(storeName: string): Promise<void> {
    // Validate store exists
    const exists = await db.tableExists(storeName);
    if (!exists) {
      throw new Error(`Vector store '${storeName}' does not exist`);
    }

    try {
      await db.execute(`DROP TABLE \`${storeName}\``);
      console.log(`✅ Vector store '${storeName}' deleted successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to delete vector store '${storeName}':`, error);
      throw error;
    }
  }

  /**
   * Get vector store statistics
   */
  public async getStoreStats(storeName: string): Promise<{
    name: string;
    documentCount: number;
    created: string;
    updated: string;
  }> {
    const exists = await db.tableExists(storeName);
    if (!exists) {
      throw new Error(`Vector store '${storeName}' does not exist`);
    }

    try {
      // Get document count
      const countResult = await db.execute<{ count: number }>(
        `SELECT COUNT(*) as count FROM \`${storeName}\``
      );
      
      // Get table creation info
      const tableInfo = await db.execute<{
        Create_time: string;
        Update_time: string;
      }>(`
        SELECT Create_time, Update_time 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      `, [storeName]);

      return {
        name: storeName,
        documentCount: countResult[0]?.count || 0,
        created: tableInfo[0]?.Create_time || '',
        updated: tableInfo[0]?.Update_time || ''
      };
      
    } catch (error) {
      console.error(`❌ Failed to get stats for vector store '${storeName}':`, error);
      throw error;
    }
  }

  private parseMetadata(metadataStr: string): Record<string, any> {
    try {
      return JSON.parse(metadataStr);
    } catch {
      return {};
    }
  }
}

// Export singleton instance
export const vectorStore = VectorStoreService.getInstance();


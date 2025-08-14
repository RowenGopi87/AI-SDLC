# Aura Database Integration

This module provides complete database integration for Aura's SDLC workflow, including MariaDB persistence and RAG capabilities with vector search.

## 🏗️ Architecture

```
Aura Database System
├── Connection Management (connection.ts)
├── Embedding Service (embeddings.ts)
├── Vector Store (vector-store.ts)
├── Database Schema (schema.ts)
├── Main Service (service.ts)
└── Configuration (config.ts)
```

## 🚀 Features

### ✅ **Complete SDLC Persistence**
- Business Briefs → Initiatives → Features → Epics → Stories → Test Cases
- Full hierarchical relationships with foreign keys
- Automatic timestamps and audit trails

### ✅ **Vector Search & RAG**
- MariaDB native VECTOR columns (no external ChromaDB needed)
- OpenAI, Gemini, or HuggingFace embeddings
- Semantic search with cosine/euclidean distance
- Document processing and storage

### ✅ **SAFe Framework Integration**
- Work item mapping to SAFe stages
- Contextual status queries
- Framework-aware responses

## 📋 Setup Instructions

### 1. Environment Configuration

Copy `database-config.env.example` contents to your `.env` file:

```bash
# MariaDB Configuration
AURA_DB_HOST=localhost
AURA_DB_PORT=3306
AURA_DB_USER=your_username
AURA_DB_PASSWORD=your_password
AURA_DB_NAME=aura_sdlc

# Embedding Service (Optional for RAG)
AURA_EMBEDDING_PROVIDER=openai
AURA_EMBEDDING_API_KEY=sk-your-openai-key
```

### 2. Install Dependencies

```bash
npm install mysql2 dotenv
```

### 3. Database Setup

The system will automatically:
- Create the `aura_sdlc` database
- Set up all required tables with proper relationships
- Create indexes for optimal performance

### 4. Initialize in Your App

```typescript
import { initializeAuraDatabase } from '@/lib/database';

// In your app initialization
const dbResult = await initializeAuraDatabase();
if (dbResult.success) {
  console.log('Database ready:', dbResult.message);
}
```

## 📊 Database Schema

### Core SDLC Tables
- `business_briefs` - Business ideas and requirements
- `initiatives` - High-level business initiatives  
- `features` - Major functional capabilities
- `epics` - Large bodies of work
- `stories` - Implementable user stories
- `test_cases` - Test scenarios and execution results

### Supporting Tables
- `documents` - Uploaded files and extracted content
- `safe_mappings` - SAFe framework stage mappings
- `aura_documents` (vector store) - Document embeddings
- `aura_safe_framework` (vector store) - SAFe knowledge base

## 🔧 Usage Examples

### Basic CRUD Operations

```typescript
import { databaseService } from '@/lib/database';

// Create a business brief
const brief = await databaseService.createBusinessBrief({
  title: "Mobile App Initiative",
  description: "Develop mobile application for customer engagement",
  status: "draft",
  priority: "high"
});

// Create initiatives from the brief
const initiative = await databaseService.createInitiative({
  businessBriefId: brief.id,
  title: "iOS App Development",
  description: "Native iOS application"
});

// Get full hierarchy
const hierarchy = await databaseService.getWorkItemHierarchy();
```

### Vector Search & RAG

```typescript
import { vectorStore, embeddingService } from '@/lib/database';

// Create a document store
await vectorStore.createVectorStore({
  name: 'project_docs',
  embeddingModel: 'text-embedding-3-small'
});

// Add documents
await vectorStore.insertDocuments('project_docs', [
  {
    id: 'doc1',
    document: 'SAFe framework defines portfolio, large solution, essential, and team levels...',
    metadata: { source: 'safe_guide.pdf', type: 'framework' }
  }
]);

// Search for context
const results = await vectorStore.search('project_docs', 'What are the SAFe levels?', 5);
```

### SAFe Integration

```typescript
import { databaseService } from '@/lib/database';

// Map work items to SAFe stages
await databaseService.createSafeMapping({
  workItemId: initiative.id,
  workItemType: 'initiative',
  safeStage: 'Program Increment Planning',
  safeLevel: 'essential',
  confidence: 0.85
});

// Query with SAFe context
const mapping = await databaseService.getSafeMappingByWorkItem(
  initiative.id, 
  'initiative'
);
```

## 🔍 Health Monitoring

```typescript
import { checkAuraDatabaseHealth } from '@/lib/database';

const health = await checkAuraDatabaseHealth();
console.log('Database Health:', health);
// Output: { healthy: true, services: { database: { connected: true }, ... } }
```

## 🛠️ Migration from Local Storage

The database service provides identical interfaces to current Zustand stores, making migration straightforward:

```typescript
// Before (Zustand)
const initiatives = useInitiativeStore(state => state.initiatives);

// After (Database)
const initiatives = await databaseService.getAllInitiatives();
```

## 🔧 Advanced Configuration

### Connection Pooling
```typescript
// Configured via environment variables
AURA_DB_MAX_POOL_SIZE=10    // Max concurrent connections
AURA_DB_TIMEOUT=30          // Connection timeout (seconds)
```

### Vector Store Optimization
```typescript
// Custom embedding dimensions
await vectorStore.createVectorStore({
  name: 'custom_store',
  dimension: 1536,
  distanceFunction: 'cosine'
});
```

### Performance Tuning
- Indexes on frequently queried columns
- Connection pooling for concurrent requests  
- Batch operations for bulk inserts
- Vector index optimization for search speed

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**
```
❌ Database configuration invalid: AURA_DB_USER environment variable is required
```
→ Check your `.env` file has all required database variables

**Embedding Service Disabled**
```
⚠️ Embedding service disabled - no provider configured
```
→ Set `AURA_EMBEDDING_PROVIDER=openai` and provide API key

**Vector Search Failing**
```
❌ Vector store 'aura_documents' does not exist
```
→ Call `createDefaultVectorStores()` to set up required stores

### Debug Logging

Enable detailed logging:
```bash
AURA_DB_LOG_LEVEL=DEBUG
AURA_DB_LOG_QUERIES=true
```

## 🚦 Integration Status

✅ **Phase 1 Complete**: Core database infrastructure embedded  
🔄 **Phase 2 Next**: Replace local storage with database calls  
⏳ **Phase 3 Planned**: Global RAG assistant integration  
⏳ **Phase 4 Planned**: Full coding/testing tab support  

This database integration provides the foundation for Aura's transition from local storage to a scalable, persistent, and intelligent data layer.


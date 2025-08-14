// RAG Configuration for Aura
export const RAG_CONFIG = {
  // Document Processing
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200,
  MAX_FILE_SIZE: 32 * 1024 * 1024, // 32MB
  ALLOWED_EXTENSIONS: ['pdf', 'txt', 'md', 'docx'],
  
  // Vector Store
  VECTOR_STORE_NAME: 'aura_documents',
  MAX_RETRIEVAL_RESULTS: 5,
  
  // OpenAI Configuration
  OPENAI_MODEL: 'gpt-4o',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 2,
  
  // Upload Configuration
  UPLOAD_FOLDER: './uploads',
  
  // SAFe Integration
  SAFE_VECTOR_STORE: 'safe_documents',
  WORK_ITEMS_VECTOR_STORE_NAME: 'work_items_context',
  
  // Chat Configuration
  SYSTEM_PROMPT: `You are an intelligent assistant for Aura SDLC management system. 
You help users with questions about their work items, project status, and provide guidance based on SAFe framework principles when applicable.

When answering questions:
1. First check if you have relevant context from uploaded documents
2. Then query the work items database for current status
3. If SAFe documentation is available, provide SAFe-aware guidance
4. Be concise but comprehensive in your responses

Always provide helpful, actionable information related to software development lifecycle management.`,

  CONTEXT_PROMPT: `Based on the following context from documents and work items:

Context: {context}

Please answer the user's question: {question}

If you cannot find relevant information in the context, say so and provide general guidance if possible.`
} as const;

export type RagConfig = typeof RAG_CONFIG;

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
export const DATABASE_CONFIG = {
  host: process.env.AURA_DB_HOST || 'localhost',
  port: parseInt(process.env.AURA_DB_PORT || '3306'),
  user: process.env.AURA_DB_USER || 'aura_user',
  password: process.env.AURA_DB_PASSWORD || '',
  database: process.env.AURA_DB_NAME || 'aura_sdlc',
  maxPoolSize: parseInt(process.env.AURA_DB_MAX_POOL_SIZE || '10'),
  ssl: process.env.AURA_DB_SSL === 'true'
};

// Embedding configuration
export const EMBEDDING_CONFIG = {
  enabled: !!(process.env.AURA_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY),
  provider: process.env.AURA_EMBEDDING_PROVIDER || 'openai',
  apiKey: process.env.AURA_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || '',
  model: process.env.AURA_EMBEDDING_MODEL || 'text-embedding-3-small'
};

// Configuration validation
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required database fields
  if (!DATABASE_CONFIG.host) {
    errors.push('AURA_DB_HOST environment variable is required');
  }
  if (!DATABASE_CONFIG.user) {
    errors.push('AURA_DB_USER environment variable is required');
  }
  if (!DATABASE_CONFIG.password) {
    errors.push('AURA_DB_PASSWORD environment variable is required');
  }
  if (!DATABASE_CONFIG.database) {
    errors.push('AURA_DB_NAME environment variable is required');
  }

  // Check for optional configurations and add warnings if missing
  if (!EMBEDDING_CONFIG.apiKey) {
    warnings.push('AURA_EMBEDDING_API_KEY not set - RAG functionality will be limited');
  }
  if (DATABASE_CONFIG.maxPoolSize > 50) {
    warnings.push('High max pool size detected - consider reducing for better resource management');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Embedding dimensions for different models
export const EMBEDDING_DIMENSIONS = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
} as const;

// Supported OpenAI models
export const OPENAI_MODELS = {
  EMBEDDING: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'],
  CHAT: ['gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo']
} as const;

// Export types
export type DatabaseConfig = typeof DATABASE_CONFIG;
export type EmbeddingConfig = typeof EMBEDDING_CONFIG;
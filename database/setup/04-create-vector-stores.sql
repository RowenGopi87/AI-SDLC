-- =============================================
-- Aura SDLC Database Setup - Step 4
-- Create Vector Stores for RAG Functionality
-- =============================================

USE aura_sdlc;

-- Create vector store for SAFe framework documents
-- This will be created via the application API since it depends on embedding dimensions
-- But we can prepare the structure here

-- Create a table to track vector stores
CREATE TABLE IF NOT EXISTS vector_stores (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  database_name VARCHAR(255) NOT NULL,
  embedding_provider VARCHAR(50),
  embedding_model VARCHAR(100),
  embedding_dimension INT,
  description TEXT,
  document_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_database_name (database_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a table to track document chunks and their metadata
CREATE TABLE IF NOT EXISTS document_chunks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  document_id VARCHAR(36) NOT NULL,
  vector_store_name VARCHAR(255) NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64),
  metadata JSON,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (vector_store_name) REFERENCES vector_stores(name) ON DELETE CASCADE,
  INDEX idx_document_id (document_id),
  INDEX idx_vector_store (vector_store_name),
  INDEX idx_content_hash (content_hash),
  UNIQUE KEY unique_document_chunk (document_id, chunk_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default vector store configurations
INSERT IGNORE INTO vector_stores (name, database_name, description) VALUES 
('safe_documents', 'aura_sdlc', 'SAFe framework documentation and guidelines'),
('work_items_context', 'aura_sdlc', 'Work items context for intelligent search'),
('design_documents', 'aura_sdlc', 'Design documents and technical specifications');

SELECT 'Vector store tables and configurations created successfully!' as Status;
SELECT * FROM vector_stores;

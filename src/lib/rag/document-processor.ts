// Document Processing for Aura RAG System
import { RAG_CONFIG } from './config';

export interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    page?: number;
    chunkIndex: number;
    totalChunks: number;
    fileName: string;
    fileType: string;
  };
}

export interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  chunks: DocumentChunk[];
  extractedText: string;
  metadata: {
    pageCount?: number;
    processingMethod: string;
    uploadedAt: Date;
    uploadedBy?: string;
  };
}

export class DocumentProcessor {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize = RAG_CONFIG.CHUNK_SIZE, chunkOverlap = RAG_CONFIG.CHUNK_OVERLAP) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Process a file and extract text chunks
   */
  async processFile(
    file: Buffer,
    fileName: string,
    fileType: string,
    uploadedBy?: string
  ): Promise<ProcessedDocument> {
    console.log(`🔄 Processing document: ${fileName} (${fileType})`);
    
    let extractedText: string;
    let pageCount: number | undefined;
    let processingMethod: string;

    try {
      // Extract text based on file type
      switch (fileType.toLowerCase()) {
        case 'pdf':
          const pdfResult = await this.processPDF(file);
          extractedText = pdfResult.text;
          pageCount = pdfResult.pageCount;
          processingMethod = 'PDF extraction';
          break;
        
        case 'txt':
        case 'md':
          extractedText = file.toString('utf-8');
          processingMethod = 'Text parsing';
          break;
        
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Create chunks
      const chunks = this.createChunks(extractedText, fileName, fileType);
      
      const processedDocument: ProcessedDocument = {
        id: this.generateId(),
        fileName,
        fileType,
        fileSize: file.length,
        chunks,
        extractedText,
        metadata: {
          pageCount,
          processingMethod,
          uploadedAt: new Date(),
          uploadedBy,
        }
      };

      console.log(`✅ Document processed: ${chunks.length} chunks created`);
      return processedDocument;

    } catch (error) {
      console.error(`❌ Failed to process document ${fileName}:`, error);
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process PDF file (simplified version - would need pdf-parse or similar library)
   */
  private async processPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
    // Note: This is a placeholder. In production, you'd use libraries like:
    // - pdf-parse for Node.js PDF parsing
    // - pdf2pic + tesseract for OCR capabilities
    
    try {
      // For now, we'll use a simple approach that assumes PDF is text-based
      // In a real implementation, you'd integrate pdf-parse here
      
      console.log('⚠️ PDF processing simplified - integrate pdf-parse library for full functionality');
      
      // Placeholder: In real implementation, extract actual PDF text
      const text = buffer.toString('utf-8', 0, Math.min(1000, buffer.length));
      
      return {
        text: text || 'PDF content could not be extracted (requires pdf-parse library)',
        pageCount: 1
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create text chunks using recursive character splitting
   */
  private createChunks(text: string, fileName: string, fileType: string): DocumentChunk[] {
    // Implement recursive character text splitting
    const chunks: string[] = this.recursiveCharacterSplit(text);
    
    return chunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        source: fileName,
        chunkIndex: index,
        totalChunks: chunks.length,
        fileName,
        fileType,
      }
    }));
  }

  /**
   * Recursive character text splitter (simplified version of LangChain's implementation)
   */
  private recursiveCharacterSplit(text: string): string[] {
    const separators = ['\n\n', '\n', ' ', ''];
    return this.splitTextRecursively(text, separators, 0);
  }

  private splitTextRecursively(text: string, separators: string[], separatorIndex: number): string[] {
    const separator = separators[separatorIndex];
    
    if (separatorIndex >= separators.length - 1) {
      // Last separator, split character by character if needed
      return this.splitByLength(text);
    }
    
    const splits = text.split(separator);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const split of splits) {
      const testChunk = currentChunk + (currentChunk ? separator : '') + split;
      
      if (testChunk.length <= this.chunkSize) {
        currentChunk = testChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        if (split.length > this.chunkSize) {
          // Split is too large, try next separator
          chunks.push(...this.splitTextRecursively(split, separators, separatorIndex + 1));
        } else {
          currentChunk = split;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  private splitByLength(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.chunkSize) {
      chunks.push(text.slice(i, i + this.chunkSize));
    }
    return chunks;
  }

  /**
   * Generate unique document ID
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Validate file type
   */
  static isFileTypeAllowed(fileType: string): boolean {
    return RAG_CONFIG.ALLOWED_EXTENSIONS.includes(fileType.toLowerCase());
  }

  /**
   * Validate file size
   */
  static isFileSizeValid(size: number): boolean {
    return size <= RAG_CONFIG.MAX_FILE_SIZE;
  }
}

export default DocumentProcessor;

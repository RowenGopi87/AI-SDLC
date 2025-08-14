// RAG Document Upload API Route
import { NextRequest, NextResponse } from 'next/server';
import { documentProcessor, ragService, RAG_CONFIG } from '@/lib/rag';
import { DocumentProcessor } from '@/lib/rag/document-processor';

export async function POST(request: NextRequest) {
  console.log('📤 RAG Upload endpoint called');
  
  try {
    // Check if RAG is enabled
    const embeddingEnabled = !!(process.env.OPENAI_API_KEY || process.env.AURA_EMBEDDING_API_KEY);
    if (!embeddingEnabled) {
      return NextResponse.json({
        success: false,
        message: 'RAG functionality is not enabled. Please configure OPENAI_API_KEY or AURA_EMBEDDING_API_KEY.'
      }, { status: 400 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }

    // Validate file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !DocumentProcessor.isFileTypeAllowed(fileExtension)) {
      return NextResponse.json({
        success: false,
        message: `Unsupported file type: ${fileExtension}. Allowed: ${RAG_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
      }, { status: 400 });
    }

    if (!DocumentProcessor.isFileSizeValid(file.size)) {
      return NextResponse.json({
        success: false,
        message: `File too large. Maximum size: ${RAG_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 });
    }

    console.log(`📄 Processing file: ${file.name} (${fileExtension}, ${(file.size / 1024).toFixed(1)}KB)`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document
    const processedDocument = await documentProcessor.processFile(
      buffer,
      file.name,
      fileExtension,
      uploadedBy || undefined
    );

    // Store in vector database
    await ragService.storeDocument(processedDocument);

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: {
        id: processedDocument.id,
        fileName: processedDocument.fileName,
        fileType: processedDocument.fileType,
        chunks: processedDocument.chunks.length,
        extractedText: processedDocument.extractedText.substring(0, 500) + '...',
        metadata: processedDocument.metadata
      }
    });

  } catch (error: any) {
    console.error('❌ RAG upload failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Upload failed',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Handle GET requests to show upload status
export async function GET() {
  try {
    const status = {
      enabled: !!(process.env.OPENAI_API_KEY || process.env.AURA_EMBEDDING_API_KEY),
      embeddingProvider: process.env.AURA_EMBEDDING_PROVIDER || 'openai',
      allowedExtensions: RAG_CONFIG.ALLOWED_EXTENSIONS,
      maxFileSize: RAG_CONFIG.MAX_FILE_SIZE,
      vectorStores: await ragService.getAvailableVectorStores()
    };

    return NextResponse.json({
      success: true,
      message: 'RAG upload service status',
      data: status
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to get upload status',
      error: error.message
    }, { status: 500 });
  }
}

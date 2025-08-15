// RAG Chat API Route
import { NextRequest, NextResponse } from 'next/server';
import { ragService, isRagEnabled } from '@/lib/rag';

export interface ChatRequest {
  message: string;
  conversationId?: string;
  includeContext?: boolean;
  conversationHistory?: string[];
}

export interface ChatApiResponse {
  success: boolean;
  message?: string;
  data?: {
    response: string;
    context: any[];
    sources: string[];
    confidence: number;
    conversationId: string;
    timestamp: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatApiResponse>> {
  console.log('💬 RAG Chat endpoint called');
  
  try {
    // Check if RAG is enabled
    if (!isRagEnabled()) {
      return NextResponse.json({
        success: false,
        message: 'RAG functionality is not enabled. Please configure OPENAI_API_KEY or AURA_EMBEDDING_API_KEY.',
        error: 'RAG_NOT_ENABLED'
      }, { status: 400 });
    }

    // Parse request body with error handling
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('❌ Invalid JSON in request body:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'INVALID_JSON',
        message: 'Request body is not valid JSON'
      }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      console.error('❌ Request body is not an object:', body);
      return NextResponse.json({
        success: false,
        error: 'INVALID_BODY',
        message: 'Request body must be a JSON object'
      }, { status: 400 });
    }

    const { message, conversationId, includeContext = true, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Message is required and must be a non-empty string',
        error: 'INVALID_MESSAGE'
      }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({
        success: false,
        message: 'Message too long. Maximum length is 1000 characters.',
        error: 'MESSAGE_TOO_LONG'
      }, { status: 400 });
    }

    console.log(`🔍 Processing chat query: "${message.substring(0, 100)}..."`);

    // Generate conversation ID if not provided
    const currentConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let context: any[] = [];
    let response: string;
    let sources: string[] = [];
    let confidence = 0;

    if (includeContext) {
      // Query for relevant context with conversation history
      console.log(`📚 Using conversation history: ${conversationHistory.length} previous messages`);
      context = await ragService.queryContext(message, 5, conversationHistory);
      
      if (context.length > 0) {
        // Generate context-aware response
        const chatResponse = await ragService.generateResponse(message, context);
        response = chatResponse.message;
        sources = chatResponse.sources;
        confidence = chatResponse.confidence;
      } else {
        // No relevant context found, provide general response
        response = generateFallbackResponse(message);
        confidence = 0.1;
      }
    } else {
      // Direct response without context (faster)
      response = generateFallbackResponse(message);
      confidence = 0.1;
    }

    console.log(`✅ Chat response generated (confidence: ${confidence}, sources: ${sources.length})`);

    return NextResponse.json({
      success: true,
      message: 'Response generated successfully',
      data: {
        response,
        context: includeContext ? context : [],
        sources,
        confidence,
        conversationId: currentConversationId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ RAG chat failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to generate response',
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Handle GET requests to show chat service status
export async function GET(): Promise<NextResponse> {
  try {
    const status = {
      enabled: isRagEnabled(),
      embeddingProvider: process.env.AURA_EMBEDDING_PROVIDER || 'openai',
      apiKeyConfigured: !!(process.env.OPENAI_API_KEY || process.env.AURA_EMBEDDING_API_KEY),
      vectorStores: await ragService.getAvailableVectorStores(),
      features: {
        contextualResponses: true,
        workItemIntegration: true,
        safeFrameworkAware: true,
        multipleVectorStores: true
      }
    };

    return NextResponse.json({
      success: true,
      message: 'RAG chat service status',
      data: status
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to get chat service status',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Generate fallback response when no context is available
 */
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for common SDLC-related queries
  if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
    return `I can help you check work item status and progress. To provide specific information, I'd need access to your work items or relevant documentation. You can upload documents or ask about specific work items by name.`;
  }
  
  if (lowerMessage.includes('safe') || lowerMessage.includes('scaled agile')) {
    return `I can provide guidance on the Scaled Agile Framework (SAFe). For specific SAFe questions, consider uploading your SAFe documentation so I can provide more targeted advice based on your organization's implementation.`;
  }
  
  if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
    return `I can help with testing strategies and test case management. If you have specific test cases or testing documentation, I can provide more targeted guidance.`;
  }
  
  if (lowerMessage.includes('design') || lowerMessage.includes('architecture')) {
    return `I can assist with design and architecture questions. For specific guidance, consider uploading your design documents or asking about particular work items.`;
  }
  
  // Generic helpful response
  return `I'm here to help with your software development lifecycle questions. I can assist with:

• Work item status and progress tracking
• SAFe framework guidance (upload SAFe docs for specific advice)
• Testing strategies and test case management  
• Design and architecture discussions
• General SDLC best practices

Feel free to ask specific questions or upload relevant documents for more contextual responses!`;
}

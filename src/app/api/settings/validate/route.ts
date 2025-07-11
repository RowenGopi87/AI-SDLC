import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would get these from a database or secure storage
    // For now, we'll simulate getting them from headers or return a structure
    // that indicates the frontend should provide them
    
    // Get settings from request headers (sent by frontend)
    const provider = request.headers.get('x-llm-provider');
    const model = request.headers.get('x-llm-model');
    const apiKey = request.headers.get('x-llm-api-key');
    const temperature = request.headers.get('x-llm-temperature');
    const maxTokens = request.headers.get('x-llm-max-tokens');

    // Check if we have the minimal required settings
    const isValid = !!(provider && model && apiKey);

    if (isValid) {
      return NextResponse.json({
        isValid: true,
        settings: {
          provider,
          model,
          apiKey,
          temperature: temperature ? parseFloat(temperature) : 0.7,
          maxTokens: maxTokens ? parseInt(maxTokens) : 4000,
        },
      });
    } else {
      return NextResponse.json({
        isValid: false,
        message: 'LLM settings not configured. Please configure in Settings page.',
      });
    }
  } catch (error) {
    console.error('Error validating settings:', error);
    return NextResponse.json(
      {
        isValid: false,
        error: 'Failed to validate settings',
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { FieldMapper } from '@/lib/document-parser/field-mapper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No document uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload a PDF or Word document.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    try {
      if (file.type === 'application/pdf') {
        // Parse PDF
        extractedText = await parsePDF(buffer);
      } else {
        // Parse Word document
        extractedText = await parseWord(buffer);
      }
    } catch (parseError) {
      console.error('Document parsing error:', parseError);
      return NextResponse.json(
        { success: false, message: 'Failed to extract text from document' },
        { status: 500 }
      );
    }

    // Extract fields using the FieldMapper utility
    const basicExtraction = FieldMapper.extractFields(extractedText);
    const enhancedFields = FieldMapper.enhanceWithAI(extractedText, basicExtraction);

    return NextResponse.json({
      success: true,
      data: enhancedFields,
      metadata: {
        filename: file.name,
        fileSize: file.size,
        extractedTextLength: extractedText.length,
        fieldsExtracted: Object.keys(enhancedFields).filter(key => enhancedFields[key as keyof typeof enhancedFields]).length
      }
    });

  } catch (error) {
    console.error('Business brief parsing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid issues with server-side rendering
    const pdf = await import('pdf-parse/lib/pdf-parse.js');
    const data = await pdf.default(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    // Fallback: basic text extraction attempt
    throw new Error('Failed to parse PDF document');
  }
}

async function parseWord(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for Word parsing
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Word parsing error:', error);
    throw new Error('Failed to parse Word document');
  }
}



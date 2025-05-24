import { NextRequest, NextResponse } from 'next/server';
import { executeOCR } from '../../../lib/ai/tools/ocrTool';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a valid image file (JPG, PNG, GIF, BMP, WebP).' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    console.log('[OCR API] Processing file:', file.name, file.type, `${(file.size / 1024).toFixed(1)}KB`);

    // Execute OCR using the direct function
    const result = await executeOCR({
      imageData: base64Data,
      mimeType: file.type,
      prompt: 'Extract all visible text and math formulas from the image. Format math using LaTeX. Keep the text readable and well structured.',
      includeStructure: true,
      mathFormat: 'latex'
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.errorMessage || 'OCR processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      extractedText: result.extractedText,
      hasFormulas: result.hasFormulas,
      confidence: result.confidence,
      processingTime: result.processingTime,
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      message: `Successfully extracted text from "${file.name}"`
    });

  } catch (error: unknown) {
    console.error('OCR processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        error: `OCR processing failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
} 
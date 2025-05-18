import { NextRequest, NextResponse } from 'next/server';
import { addDocument } from '../../../lib/ai/documents';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    
    // Use filename as title
    const title = file.name;
    
    // Add document to database with embeddings
    const documentId = await addDocument(title, fileContent);
    
    return NextResponse.json({ 
      success: true, 
      documentId,
      message: `Document "${title}" uploaded and processed successfully`
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
} 
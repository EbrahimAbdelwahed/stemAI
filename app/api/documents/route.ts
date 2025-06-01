import { NextRequest, NextResponse } from 'next/server';
import { addDocument } from '../../../lib/ai/documents';
import { trackAPIPerformance } from '../../../lib/analytics/api-performance-middleware';
import pdf from 'pdf-parse';

async function documentsHandler(req: NextRequest) {
  try {
    // Check if RAG is enabled first
    if (process.env.RAG_ENABLED !== 'true') {
      return NextResponse.json(
        { 
          error: 'Document upload is disabled. RAG_ENABLED environment variable is not set to "true".',
          details: 'Please configure RAG_ENABLED=true in your .env.local file and ensure DATABASE_URL is set.'
        },
        { status: 503 }
      );
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: 'Database not configured. DATABASE_URL environment variable is missing.',
          details: 'Please set DATABASE_URL in your .env.local file with your Neon PostgreSQL connection string.'
        },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 
                         'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx)$/i)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.' },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Extract text content based on file type
    let fileContent: string;
    let processingMethod: string;
    
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Handle PDF files by extracting text
        processingMethod = 'PDF text extraction';
        const arrayBuffer = await file.arrayBuffer();
        const pdfData = await pdf(arrayBuffer);
        fileContent = pdfData.text;
        
        // Additional PDF metadata could be useful
        console.log(`PDF processed: ${pdfData.numpages} pages, ${pdfData.text.length} characters`);
        
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        // Handle text files normally
        processingMethod = 'Text file reading';
        fileContent = await file.text();
        
      } else if (file.name.toLowerCase().match(/\.(doc|docx)$/)) {
        // For now, read as text (this might not work well for binary Word docs)
        // TODO: Add proper Word document processing with mammoth.js or similar
        processingMethod = 'Document file reading (limited support)';
        try {
          fileContent = await file.text();
        } catch (error) {
          return NextResponse.json(
            { 
              error: 'Word document processing not fully supported yet.',
              details: 'Please convert to PDF or TXT format for best results.'
            },
            { status: 400 }
          );
        }
        
      } else {
        // Fallback to text reading
        processingMethod = 'Generic text extraction';
        fileContent = await file.text();
      }
      
    } catch (extractionError) {
      console.error('File content extraction error:', extractionError);
      return NextResponse.json(
        { 
          error: 'Failed to extract text from file.',
          details: extractionError instanceof Error ? extractionError.message : 'File format may not be supported or file may be corrupted.'
        },
        { status: 400 }
      );
    }
    
    // Validate content
    if (!fileContent.trim()) {
      return NextResponse.json(
        { error: 'File appears to be empty or no text could be extracted.' },
        { status: 400 }
      );
    }

    // Use filename as title
    const title = file.name;
    
    console.log(`Processing document: ${title}, Method: ${processingMethod}, Content length: ${fileContent.length} characters`);
    
    // Add document to database with embeddings
    const documentId = await addDocument(title, fileContent);
    
    // Check if addDocument actually succeeded
    if (!documentId) {
      return NextResponse.json(
        { 
          error: 'Failed to process document. Database connection or embedding generation failed.',
          details: 'Please check your DATABASE_URL and OPENAI_API_KEY configuration.'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      documentId,
      message: `Document "${title}" uploaded and processed successfully`,
      fileSize: file.size,
      charactersProcessed: fileContent.length,
      processingMethod
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process document';
    let details = 'An unexpected error occurred.';
    
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL')) {
        errorMessage = 'Database connection failed';
        details = 'Please check your DATABASE_URL configuration in .env.local';
      } else if (error.message.includes('OpenAI') || error.message.includes('embedding')) {
        errorMessage = 'AI processing failed';
        details = 'Please check your OPENAI_API_KEY configuration in .env.local';
      } else if (error.message.includes('invalid byte sequence') || error.message.includes('UTF8')) {
        errorMessage = 'File encoding issue';
        details = 'The file contains binary data that cannot be processed as text. Please ensure the file is a valid text document or PDF.';
      } else {
        details = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: details
      },
      { status: 500 }
    );
  }
}

// Export the wrapped handler with performance tracking
export const POST = trackAPIPerformance(documentsHandler); 
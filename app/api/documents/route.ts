import { NextRequest, NextResponse } from 'next/server';
import { addDocument } from '../../../lib/ai/documents';
import { trackAPIPerformance } from '../../../lib/analytics/api-performance-middleware';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import pdf from 'pdf-parse';

// Text sanitization function to remove problematic characters for PostgreSQL
function sanitizeTextForDatabase(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    // Remove null bytes (0x00) and other control characters that PostgreSQL can't handle
    let sanitized = text
      // Remove null bytes
      .replace(/\x00/g, '')
      // Remove other problematic control characters but keep common ones like \n, \r, \t
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize Unicode and handle potential encoding issues
      .normalize('NFKC')
      // Remove any remaining problematic sequences
      .replace(/\uFFFD/g, '') // Replace unicode replacement characters
      .replace(/\0/g, ''); // Additional null byte cleanup

    // Ensure the text is valid UTF-8 by encoding and decoding
    const buffer = Buffer.from(sanitized, 'utf8');
    sanitized = buffer.toString('utf8');

    // Trim excessive whitespace but preserve paragraph structure
    sanitized = sanitized
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing text:', error);
    // If sanitization fails, try basic cleanup
    return text
      .replace(/\x00/g, '')
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
  }
}

// GET endpoint to list user's documents
async function getDocumentsHandler(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to view documents' },
        { status: 401 }
      );
    }

    const userDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        isPublic: documents.isPublic,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.userId, session.user.id))
      .orderBy(documents.createdAt);

    return NextResponse.json({
      success: true,
      documents: userDocuments,
      count: userDocuments.length
    });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

async function documentsHandler(req: NextRequest) {
  try {
    // Get user session for authentication
    const session = await auth();
    
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
        
        // Clean the extracted text to remove null bytes and problematic characters
        const rawText = pdfData.text || '';
        fileContent = sanitizeTextForDatabase(rawText);
        
        // Verify that we actually extracted meaningful content
        if (!fileContent.trim()) {
          return NextResponse.json(
            { 
              error: 'No readable text could be extracted from the PDF.',
              details: 'The PDF may be image-based, corrupted, or password-protected. Please try a different PDF or convert it to text format.'
            },
            { status: 400 }
          );
        }
        
        console.log(`PDF processed: ${pdfData.numpages} pages, ${rawText.length} raw characters, ${fileContent.length} cleaned characters`);
        
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        // Handle text files normally - also sanitize to be safe
        processingMethod = 'Text file reading';
        const rawText = await file.text();
        fileContent = sanitizeTextForDatabase(rawText);
        
      } else if (file.name.toLowerCase().match(/\.(doc|docx)$/)) {
        // For now, read as text (this might not work well for binary Word docs)
        // TODO: Add proper Word document processing with mammoth.js or similar
        processingMethod = 'Document file reading (limited support)';
        try {
          const rawText = await file.text();
          fileContent = sanitizeTextForDatabase(rawText);
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
        // Fallback to text reading - also sanitize
        processingMethod = 'Generic text extraction';
        const rawText = await file.text();
        fileContent = sanitizeTextForDatabase(rawText);
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

    // Additional validation to ensure content is safe for database storage
    if (fileContent.includes('\x00')) {
      return NextResponse.json(
        { 
          error: 'Text extraction failed - file contains binary data.',
          details: 'The extracted text contains null bytes that cannot be stored in the database. This may indicate the file is corrupted or contains binary content.'
        },
        { status: 400 }
      );
    }

    // Use filename as title
    const title = file.name;
    
    console.log(`Processing document: ${title}, Method: ${processingMethod}, Content length: ${fileContent.length} characters`);
    
    // Add document to database with embeddings and user context
    const userId = session?.user?.id || null; // Allow anonymous uploads but track them
    const documentId = await addDocument(title, fileContent, userId);
    
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
      processingMethod,
      userContext: userId ? 'authenticated' : 'anonymous',
      privacyNote: userId ? 'This document is private to your account' : 'This document is anonymous and may be accessible to other users'
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
      } else if (error.message.includes('invalid byte sequence') || error.message.includes('UTF8') || error.message.includes('null value') || error.message.includes('0x00')) {
        errorMessage = 'File encoding issue - null bytes detected';
        details = 'The file contains binary data (null bytes) that cannot be stored in PostgreSQL. This often happens with corrupted PDFs or files that contain embedded binary content. Try: 1) Re-saving the PDF, 2) Converting to a different format, or 3) Using a different PDF viewer to export as text.';
      } else if (error.message.includes('pdf-parse') || error.message.includes('PDF')) {
        errorMessage = 'PDF processing failed';
        details = 'Failed to extract text from PDF. The file may be password-protected, corrupted, or contain only images. Try using a different PDF or convert it to text format first.';
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

// Export the wrapped handlers with performance tracking
export const GET = trackAPIPerformance(getDocumentsHandler);
export const POST = trackAPIPerformance(documentsHandler); 
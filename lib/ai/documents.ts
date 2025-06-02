import { db, documents, chunks } from '../db';
import { generateEmbeddings } from './embedding';

// Add a document and its embeddings to the database
export async function addDocument(title: string, content: string, userId?: string | null) {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping addDocument.');
    // Consider throwing an error or returning a specific status if preferred
    return null; 
  }
  // First, insert the document with user association
  const [document] = await db
    .insert(documents)
    .values({
      title,
      content,
      userId: userId || null, // Associate with user if authenticated, null for anonymous
    })
    .returning({ id: documents.id });

  // Generate embeddings for the document
  const embeddedChunks = await generateEmbeddings(content);

  // Insert the chunks with their embeddings
  for (const chunk of embeddedChunks) {
    await db.insert(chunks).values({
      documentId: document.id,
      content: chunk.content,
      embedding: chunk.embedding,
    });
  }

  return document.id;
}

// Search for relevant document chunks based on a query with user context
export async function searchDocuments(query: string, limit = 5, userId?: string | null) {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping searchDocuments.');
    return []; // Return empty array as if no documents were found
  }
  // Generate embedding for the query
  const [queryEmbedding] = await generateEmbeddings(query);
  
  // Format the embedding as a proper vector literal for PostgreSQL
  const embeddingVector = `[${queryEmbedding.embedding.join(',')}]`;
  
  // Build WHERE clause for user filtering
  let whereClause = '';
  if (userId) {
    // Authenticated user: search their documents + public documents
    whereClause = `WHERE (documents.userId = '${userId}' OR documents.isPublic = true OR documents.userId IS NULL)`;
  } else {
    // Anonymous user: only search public documents and documents uploaded anonymously
    whereClause = `WHERE (documents.isPublic = true OR documents.userId IS NULL)`;
  }
  
  // Search for the most similar chunks with user filtering
  const result = await db.execute(`
    SELECT 
      chunks.id,
      chunks.content,
      chunks.document_id,
      documents.title,
      documents.userId,
      documents.isPublic,
      1 - (chunks.embedding <=> '${embeddingVector}'::vector) AS similarity
    FROM chunks
    JOIN documents ON chunks.document_id = documents.id
    ${whereClause}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);
  
  // Convert the result to a usable array
  const rows = result.rows as Array<{
    id: number;
    content: string;
    document_id: number;
    title: string;
    userId: string | null;
    isPublic: boolean;
    similarity: number;
  }>;
  
  return rows;
} 
import { db, documents, chunks } from '../db';
import { generateEmbeddings } from './embedding';
import { ragCache } from './smart-rag-cache';

interface DocumentChunk {
  id: number;
  content: string;
  document_id: number;
  title: string;
  userId: string | null;
  isPublic: boolean;
  similarity: number;
}

// Add a document and its embeddings to the database with user context
export async function addDocument(title: string, content: string, userId?: string | null) {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping addDocument.');
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

// Fast heuristic to detect simple queries that don't need RAG
export function detectSimpleQuery(query: string): boolean {
  const content = query.toLowerCase().trim();
  const simplePatterns = [
    /^(hi|hello|hey|thanks|thank you)/,
    /^(what is|define|explain)(?!.*(document|paper|research|uploaded|file))/,
    /^(calculate|compute|solve|find)/,
    /^(how to|how do|can you help)/,
  ];
  
  return simplePatterns.some(pattern => pattern.test(content));
}

// Optimized search with caching, pre-filtering, and user context
export async function searchDocumentsOptimized(
  query: string, 
  limit = 5,
  userId?: string | null
): Promise<DocumentChunk[]> {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping searchDocuments.');
    return [];
  }

  const startTime = performance.now();

  // 1. Create cache key that includes user context for proper isolation
  const cacheKey = userId ? `${userId}:${query}` : `anonymous:${query}`;
  const cached = await ragCache.getCachedResults(cacheKey);
  if (cached) {
    const duration = performance.now() - startTime;
    console.log(`[Optimized RAG] Cache hit - query completed in ${duration.toFixed(2)}ms`);
    return cached;
  }

  // 2. Generate embedding for the query
  const [queryEmbedding] = await generateEmbeddings(query);
  const embeddingTime = performance.now();
  console.log(`[Optimized RAG] Embedding generated in ${(embeddingTime - startTime).toFixed(2)}ms`);
  
  // 3. Format the embedding as a proper vector literal for PostgreSQL
  const embeddingVector = `[${queryEmbedding.embedding.join(',')}]`;
  
  // 4. Build WHERE clause for user filtering and similarity threshold
  let whereClause = 'WHERE 1 - (chunks.embedding <=> \'' + embeddingVector + '\'::vector) > 0.5';
  if (userId) {
    // Authenticated user: search their documents + public documents + anonymous documents
    whereClause += ` AND (documents.userId = '${userId}' OR documents.isPublic = true OR documents.userId IS NULL)`;
  } else {
    // Anonymous user: only search public documents and documents uploaded anonymously
    whereClause += ` AND (documents.isPublic = true OR documents.userId IS NULL)`;
  }
  
  // 5. Use optimized vector search with pre-filtering and user context
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

  const searchTime = performance.now();
  console.log(`[Optimized RAG] Vector search completed in ${(searchTime - embeddingTime).toFixed(2)}ms`);

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
  
  // 6. Cache results for future use with user-specific cache key
  ragCache.cacheResults(cacheKey, queryEmbedding.embedding, rows);
  
  const totalTime = performance.now() - startTime;
  console.log(`[Optimized RAG] Total search completed in ${totalTime.toFixed(2)}ms with ${rows.length} results for user: ${userId || 'anonymous'}`);
  
  return rows;
}

// Legacy function for backward compatibility - now with user context support
export async function searchDocuments(query: string, limit = 5, userId?: string | null): Promise<DocumentChunk[]> {
  return searchDocumentsOptimized(query, limit, userId);
} 
import { db, documents, chunks } from '../db';
import { generateEmbeddings } from './embedding';
import { ragCache } from './smart-rag-cache';

interface DocumentChunk {
  id: number;
  content: string;
  document_id: number;
  title: string;
  similarity: number;
}

// Add a document and its embeddings to the database (same as original)
export async function addDocument(title: string, content: string) {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping addDocument.');
    return null; 
  }
  
  // First, insert the document
  const [document] = await db
    .insert(documents)
    .values({
      title,
      content,
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

// Optimized search with caching and pre-filtering
export async function searchDocumentsOptimized(
  query: string, 
  limit = 5
): Promise<DocumentChunk[]> {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping searchDocuments.');
    return [];
  }

  const startTime = performance.now();

  // 1. Check cache first
  const cached = await ragCache.getCachedResults(query);
  if (cached) {
    const duration = performance.now() - startTime;
    console.log(`[Optimized RAG] Cache hit - query completed in ${duration.toFixed(2)}ms`);
    return cached;
  }

  // 2. Generate embedding for the query
  const [queryEmbedding] = await generateEmbeddings(query);
  const embeddingTime = performance.now();
  console.log(`[Optimized RAG] Embedding generated in ${(embeddingTime - startTime).toFixed(2)}ms`);
  
  // 3. Use optimized vector search with pre-filtering
  const result = await db.execute(`
    SELECT 
      chunks.id,
      chunks.content,
      chunks.document_id,
      documents.title,
      1 - (chunks.embedding <=> '${JSON.stringify(queryEmbedding.embedding)}') AS similarity
    FROM chunks
    JOIN documents ON chunks.document_id = documents.id
    WHERE 1 - (chunks.embedding <=> '${JSON.stringify(queryEmbedding.embedding)}') > 0.5  -- Pre-filter low similarity
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
    similarity: number;
  }>;
  
  // 4. Cache results for future use
  ragCache.cacheResults(query, queryEmbedding.embedding, rows);
  
  const totalTime = performance.now() - startTime;
  console.log(`[Optimized RAG] Total search completed in ${totalTime.toFixed(2)}ms with ${rows.length} results`);
  
  return rows;
}

// Legacy function for backward compatibility
export async function searchDocuments(query: string, limit = 5): Promise<DocumentChunk[]> {
  return searchDocumentsOptimized(query, limit);
} 
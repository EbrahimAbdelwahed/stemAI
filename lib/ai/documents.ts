import { db, documents, chunks } from '../db';
import { generateEmbeddings } from './embedding';

// Add a document and its embeddings to the database
export async function addDocument(title: string, content: string) {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping addDocument.');
    // Consider throwing an error or returning a specific status if preferred
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

// Search for relevant document chunks based on a query
export async function searchDocuments(query: string, limit = 5) {
  if (process.env.RAG_ENABLED !== 'true' || !db) {
    console.warn('RAG is disabled or DB is not initialized. Skipping searchDocuments.');
    return []; // Return empty array as if no documents were found
  }
  // Generate embedding for the query
  const [queryEmbedding] = await generateEmbeddings(query);
  
  // Search for the most similar chunks
  const result = await db.execute(`
    SELECT 
      chunks.id,
      chunks.content,
      chunks.document_id,
      documents.title,
      1 - (chunks.embedding <=> '${JSON.stringify(queryEmbedding.embedding)}') AS similarity
    FROM chunks
    JOIN documents ON chunks.document_id = documents.id
    ORDER BY similarity DESC
    LIMIT ${limit}
  `);
  
  // Convert the result to a usable array
  const rows = result.rows as Array<{
    id: number;
    content: string;
    document_id: number;
    title: string;
    similarity: number;
  }>;
  
  return rows;
} 
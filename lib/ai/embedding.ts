import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const embeddingModel = openai.embedding('text-embedding-3-small');

// Split text into smaller chunks for embedding
const generateChunks = (input: string, maxChunkSize = 512): string[] => {
  const sentences = input
    .replace(/([.?!])\s+/g, '$1\n')
    .split('\n')
    .filter(sentence => sentence.trim() !== '');
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed max chunk size, save current chunk and start a new one
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

export async function generateEmbeddings(
  content: string
): Promise<Array<{ embedding: number[]; content: string }>> {
  if (process.env.RAG_ENABLED !== 'true') {
    console.warn('RAG is disabled. Skipping generateEmbeddings.');
    // Return empty array or handle as appropriate for your application
    // This will prevent calling embedMany and thus avoid OpenAI API key issues if RAG is off
    return []; 
  }
  const chunks = generateChunks(content);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  
  return chunks.map((chunk, index) => ({
    content: chunk,
    embedding: embeddings[index],
  }));
} 
import { createHash } from 'crypto';
import { generateEmbeddings } from './embedding';

interface DocumentChunk {
  id: number;
  content: string;
  document_id: number;
  title: string;
  similarity: number;
}

interface QueryCacheEntry {
  embedding: number[];
  results: DocumentChunk[];
  timestamp: number;
  queryHash: string;
}

class SmartRAGCache {
  private cache = new Map<string, QueryCacheEntry>();
  private readonly SIMILARITY_THRESHOLD = 0.85;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;

  private hashQuery(query: string): string {
    return createHash('sha256').update(query.toLowerCase().trim()).digest('hex');
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async getQueryEmbedding(query: string): Promise<number[]> {
    const [embedding] = await generateEmbeddings(query);
    return embedding.embedding;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [hash, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(hash);
      }
    }
  }

  private evictOldestEntry(): void {
    if (this.cache.size === 0) return;
    
    let oldestHash = '';
    let oldestTimestamp = Date.now();
    
    for (const [hash, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestHash = hash;
      }
    }
    
    if (oldestHash) {
      this.cache.delete(oldestHash);
    }
  }

  async getCachedResults(query: string): Promise<DocumentChunk[] | null> {
    // Clean up expired entries first
    this.cleanupExpiredEntries();
    
    const queryHash = this.hashQuery(query);
    const cached = this.cache.get(queryHash);
    
    // Direct cache hit
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[RAG Cache] Direct hit for query: ${query.substring(0, 50)}...`);
      return cached.results;
    }

    // Check for similar queries using embedding similarity
    try {
      const queryEmbedding = await this.getQueryEmbedding(query);
      
      for (const [hash, entry] of this.cache.entries()) {
        if (Date.now() - entry.timestamp > this.CACHE_TTL) {
          continue;
        }

        const similarity = this.cosineSimilarity(queryEmbedding, entry.embedding);
        if (similarity > this.SIMILARITY_THRESHOLD) {
          console.log(`[RAG Cache] Similar query found (${similarity.toFixed(3)} similarity): ${query.substring(0, 50)}...`);
          return entry.results;
        }
      }
    } catch (error) {
      console.error('[RAG Cache] Error checking similarity:', error);
      // Fall through to return null if embedding fails
    }

    return null;
  }

  cacheResults(query: string, embedding: number[], results: DocumentChunk[]): void {
    // Ensure we don't exceed max cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntry();
    }

    const queryHash = this.hashQuery(query);
    this.cache.set(queryHash, {
      embedding,
      results,
      timestamp: Date.now(),
      queryHash,
    });

    console.log(`[RAG Cache] Cached results for query: ${query.substring(0, 50)}... (${results.length} results)`);
  }

  // Get cache statistics for monitoring
  getStats() {
    this.cleanupExpiredEntries();
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
    };
  }

  // Clear all cache entries (useful for testing)
  clear(): void {
    this.cache.clear();
    console.log('[RAG Cache] Cache cleared');
  }
}

// Export a singleton instance
export const ragCache = new SmartRAGCache(); 
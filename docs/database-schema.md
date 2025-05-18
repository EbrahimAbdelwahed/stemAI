# Database Schema

This document outlines the database schema used in the STEM AI Assistant application for storing documents and embeddings.

## Overview

The STEM AI Assistant uses a PostgreSQL database with the pgvector extension to store and query documents and their vector embeddings. The database enables the retrieval-augmented generation (RAG) capabilities of the application.

## Tables

The database has two main tables:

1. **documents**: Stores the original document metadata and content
2. **chunks**: Stores chunks of text from documents along with their embeddings

### Documents Table

The `documents` table stores the metadata and content of uploaded documents.

**Schema**:

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing identifier |
| `title` | VARCHAR(255) | Document title (typically the filename) |
| `content` | TEXT | Full text content of the document |
| `created_at` | TIMESTAMP | When the document was added |
| `updated_at` | TIMESTAMP | When the document was last updated |

### Chunks Table

The `chunks` table stores smaller chunks of text extracted from documents, along with their vector embeddings for semantic search.

**Schema**:

```sql
CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  document_id SERIAL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key, auto-incrementing identifier |
| `document_id` | SERIAL | Foreign key reference to the documents table |
| `content` | TEXT | Text content of this specific chunk |
| `embedding` | VECTOR(1536) | Vector embedding of the chunk content (1536 dimensions) |
| `created_at` | TIMESTAMP | When the chunk was added |
| `updated_at` | TIMESTAMP | When the chunk was last updated |

## Relationships

- Each document can have multiple chunks (one-to-many relationship)
- When a document is deleted, all its chunks are also deleted (CASCADE delete)

## Embedding Vector Details

The application uses OpenAI's `text-embedding-3-small` model for generating embeddings, which produces 1536-dimensional vectors. These vectors are stored in the `embedding` column of the `chunks` table.

The pgvector extension provides specialized operators for vector similarity search:

- `<=>`: Cosine distance operator 
- `<->`: Euclidean distance operator
- `<#>`: Negative inner product operator

The application uses cosine distance (`<=>`) for semantic similarity searches, where lower values indicate higher similarity.

## Example Queries

### Inserting a Document

```sql
INSERT INTO documents (title, content)
VALUES ('Introduction to Quantum Physics', 'Quantum physics is the study of matter and energy at its most fundamental level...')
RETURNING id;
```

### Inserting a Chunk with Embedding

```sql
INSERT INTO chunks (document_id, content, embedding)
VALUES (
  1, 
  'Quantum physics is the study of matter and energy at its most fundamental level',
  '[0.123, 0.456, 0.789, ...]'::vector
);
```

### Semantic Search Query

```sql
SELECT 
  chunks.id,
  chunks.content,
  chunks.document_id,
  documents.title,
  1 - (chunks.embedding <=> '[0.234, 0.567, 0.890, ...]'::vector) AS similarity
FROM chunks
JOIN documents ON chunks.document_id = documents.id
ORDER BY similarity DESC
LIMIT 5;
```

## Database Configuration

The database connection is configured in `lib/db/index.ts` using the Neon serverless Postgres client and Drizzle ORM:

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

neonConfig.fetchOptions = {
  cache: 'no-store',
};

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

The schema is defined in `lib/db/schema.ts` using Drizzle ORM's schema definition:

```typescript
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { pgvector } from 'pgvector/drizzle-orm';

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chunks = pgTable('chunks', {
  id: serial('id').primaryKey(),
  documentId: serial('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: pgvector.vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Database Operations in the Application

### Adding Documents

When a user uploads a document, the application:

1. Inserts the document metadata into the `documents` table
2. Splits the document content into manageable chunks
3. Generates embeddings for each chunk using the OpenAI embedding model
4. Inserts each chunk and its embedding into the `chunks` table

This is implemented in the `addDocument` function in `lib/ai/documents.ts`.

### Searching Documents

When a user sends a message, the application:

1. Takes the user's query and generates an embedding for it
2. Performs a vector similarity search to find the most relevant chunks
3. Retrieves the top N most similar chunks
4. Includes these chunks as context for the AI response

This is implemented in the `searchDocuments` function in `lib/ai/documents.ts`.

## Performance Considerations

### Indexing

For production deployments with large document collections, consider adding indexes to improve search performance:

```sql
CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Chunking Strategy

The current implementation uses a simple sentence-based chunking strategy with a maximum chunk size of 512 characters. This balance ensures:

1. Chunks are small enough for efficient embedding and retrieval
2. Chunks contain enough context to be meaningful
3. Related information stays together

For more advanced applications, consider implementing:
- Overlapping chunks to prevent information loss at boundaries
- Hierarchical chunking for multi-level retrieval
- Semantic-aware chunking that keeps related concepts together

## Database Scaling

The current schema is designed for small to medium-sized document collections. For larger collections, consider:

1. **Partitioning**: Partition the chunks table by document_id
2. **Approximate Nearest Neighbor**: Use approximate search algorithms for faster retrieval
3. **Caching**: Cache frequently accessed embeddings and search results
4. **Document Filtering**: Add metadata to enable pre-filtering before vector search 
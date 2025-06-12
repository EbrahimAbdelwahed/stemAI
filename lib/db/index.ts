import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let sql: any = null;
let db: NeonHttpDatabase<typeof schema> | null = null;

// Always initialize database connection if DATABASE_URL is available
// This ensures auth functionality works even if RAG is disabled
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found, initializing database connection...');
  
  sql = neon(process.env.DATABASE_URL, { 
    fetchOptions: { cache: 'no-store' } 
  });
  db = drizzle(sql, { schema });
  console.log('Database connection initialized successfully.');
  
  if (process.env.RAG_ENABLED === 'true') {
    console.log('RAG_ENABLED is true - full RAG functionality available.');
  } else {
    console.log('RAG_ENABLED is not true - RAG features disabled, but auth/core features available.');
  }
} else {
  // Only warn on the server; on the client we never expect DATABASE_URL to be present
  if (typeof window === 'undefined') {
    console.error('DATABASE_URL environment variable is not set. Database features will be unavailable.');
  }
}

export { db, sql };
export * from './schema'; 
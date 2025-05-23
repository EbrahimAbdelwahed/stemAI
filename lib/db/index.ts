import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let sql: any = null;
let db: NeonHttpDatabase<typeof schema> | null = null;

if (process.env.RAG_ENABLED === 'true') {
  console.log('RAG_ENABLED is true, attempting to initialize database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set, but RAG_ENABLED is true.');
    throw new Error('DATABASE_URL environment variable is not set, but RAG_ENABLED is true.');
  }
  
  sql = neon(process.env.DATABASE_URL, { 
    fetchOptions: { cache: 'no-store' } 
  });
  db = drizzle(sql, { schema });
  console.log('Database initialized for RAG.');
} else {
  console.log('RAG_ENABLED is not true (or not set), skipping database initialization.');
}

export { db, sql };
export * from './schema'; 
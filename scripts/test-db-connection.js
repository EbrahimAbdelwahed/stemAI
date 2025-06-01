#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests if the database is accessible and has the required schema
 */

const fs = require('fs');
const path = require('path');

// Parse .env.local file manually
function parseEnvFile(filePath) {
  const envVars = {};
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (error) {
    console.log('❌ Error reading .env.local file:', error.message);
  }
  return envVars;
}

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  // Load environment variables from .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envVars = parseEnvFile(envPath);

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`RAG_ENABLED: ${envVars.RAG_ENABLED}`);
  console.log(`DATABASE_URL: ${envVars.DATABASE_URL ? '[SET]' : '[NOT SET]'}`);
  console.log('');

  if (envVars.RAG_ENABLED !== 'true') {
    console.log('❌ RAG_ENABLED is not set to "true"');
    return;
  }

  if (!envVars.DATABASE_URL) {
    console.log('❌ DATABASE_URL is not set');
    return;
  }

  try {
    console.log('🔗 Testing database connection...');
    
    // Check if @neondatabase/serverless is installed
    let neon;
    try {
      const neonModule = require('@neondatabase/serverless');
      neon = neonModule.neon;
    } catch (error) {
      console.log('❌ @neondatabase/serverless package not found');
      console.log('💡 Install it with: npm install @neondatabase/serverless');
      return;
    }
    
    const sql = neon(envVars.DATABASE_URL);
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log(`Current time from database: ${result[0].current_time}`);
    console.log('');

    // Check if required tables exist
    console.log('🗃️ Checking database schema...');
    
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('documents', 'chunks')
      ORDER BY table_name
    `;
    
    const existingTables = tablesResult.map(row => row.table_name);
    console.log(`Found tables: ${existingTables.length > 0 ? existingTables.join(', ') : 'none'}`);
    
    const requiredTables = ['documents', 'chunks'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables exist!');
      
      // Test if we can insert a test document
      console.log('\n🧪 Testing document insertion...');
      try {
        const testDoc = await sql`
          INSERT INTO documents (title, content) 
          VALUES ('Test Document', 'Test content') 
          RETURNING id
        `;
        console.log(`✅ Test document created with ID: ${testDoc[0].id}`);
        
        // Clean up test document
        await sql`DELETE FROM documents WHERE id = ${testDoc[0].id}`;
        console.log('✅ Test document cleaned up');
        
      } catch (insertError) {
        console.log('❌ Failed to insert test document:', insertError.message);
      }
      
    } else {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('\n🔧 To create missing tables, run this SQL in your database:');
      console.log(`
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "isPublic" BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create chunks table
CREATE TABLE IF NOT EXISTS chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;
      `);
    }

    // Check vector extension
    console.log('\n🔍 Checking vector extension...');
    try {
      const vectorCheck = await sql`
        SELECT * FROM pg_extension WHERE extname = 'vector'
      `;
      if (vectorCheck.length > 0) {
        console.log('✅ Vector extension is installed');
      } else {
        console.log('❌ Vector extension is not installed');
        console.log('💡 Run: CREATE EXTENSION IF NOT EXISTS vector;');
      }
    } catch (vectorError) {
      console.log('❌ Error checking vector extension:', vectorError.message);
    }

  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n🔧 Possible fixes:');
    console.log('1. Check your DATABASE_URL format');
    console.log('2. Ensure your database server is running');
    console.log('3. Verify network connectivity to your database');
    
    // Show more specific error information
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('4. DNS resolution failed - check your database hostname');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('4. Connection refused - check if database is running and accessible');
    } else if (error.message.includes('authentication failed')) {
      console.log('4. Authentication failed - check username/password in DATABASE_URL');
    }
  }
}

// Run the test
testDatabaseConnection().catch(console.error); 
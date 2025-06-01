# Document Upload Fix Guide

## Issue: Document Upload Not Working

If document upload isn't working even after setting up your Neon database, this guide will help you diagnose and fix the problem.

## Quick Diagnosis

Run this command to check your setup:

```bash
node scripts/verify-setup.js
```

This will identify exactly what's missing in your configuration.

## Most Common Issue: Missing .env.local File

The most likely cause is that your `.env.local` file is missing or incorrectly configured.

### Step 1: Create .env.local File

Create a `.env.local` file in your project root with these essential variables:

```bash
# Essential Configuration for Document Upload
RAG_ENABLED=true
DATABASE_URL=postgresql://username:password@your-neon-db-host.com/dbname
OPENAI_API_KEY=sk-your-openai-api-key

# Optional but recommended
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 2: Get Your Database URL from Neon

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your database project
3. Go to "Connection Details"
4. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb
   ```

### Step 3: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### Step 4: Update .env.local

Replace the placeholder values in your `.env.local` file:

```bash
RAG_ENABLED=true
DATABASE_URL=postgresql://your-actual-username:your-actual-password@your-actual-host.neon.tech/your-actual-database
OPENAI_API_KEY=sk-your-actual-openai-api-key
```

## Testing Your Fix

### Method 1: Use the Verification Script

```bash
node scripts/verify-setup.js
```

### Method 2: Check Browser Developer Console

1. Start your server: `npm run dev`
2. Go to `http://localhost:3000/chat`
3. Open browser developer tools (F12)
4. Try uploading a document
5. Check the console for error messages

### Method 3: Check Server Logs

Watch your terminal where `npm run dev` is running for error messages when you try to upload a document.

## Common Error Messages and Fixes

### Error: "Document upload is disabled"
**Cause**: `RAG_ENABLED` is not set to `true`
**Fix**: Add `RAG_ENABLED=true` to your `.env.local`

### Error: "Database not configured"
**Cause**: `DATABASE_URL` is missing
**Fix**: Add your Neon PostgreSQL connection string to `.env.local`

### Error: "Failed to process document"
**Possible Causes**:
1. **OpenAI API key missing**: Add `OPENAI_API_KEY` to `.env.local`
2. **Database connection failed**: Check your `DATABASE_URL` format
3. **Database schema missing**: Run the schema creation script

## Verifying Database Schema

If your environment variables are correct but upload still fails, check your database schema:

### Option 1: Quick Check via Neon Console

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Run this query to check if tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('documents', 'chunks');
```

You should see both `documents` and `chunks` tables.

### Option 2: Create Missing Tables

If tables are missing, run this in your Neon SQL Editor:

```sql
-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "isPublic" BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;
```

## Complete Working Example

Here's a complete `.env.local` file example:

```bash
# STEM AI Assistant Configuration
RAG_ENABLED=true
DATABASE_URL=postgresql://myuser:mypassword@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb
OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef

# Authentication (optional)
NEXTAUTH_SECRET=my-super-secret-nextauth-key
NEXTAUTH_URL=http://localhost:3000

# Performance tuning (optional)
RAG_CHUNK_SIZE=512
RAG_CHUNK_OVERLAP=50
RAG_MAX_RESULTS=5
```

## Testing Document Upload

Once configured:

1. Start your server: `npm run dev`
2. Go to `http://localhost:3000/chat`
3. Click the "Upload documents" button
4. Select a text file (.txt) or PDF
5. You should see a success message

## Troubleshooting Tips

### Still Not Working?

1. **Restart your development server** after changing `.env.local`
2. **Check file size**: Max 10MB per file
3. **Check file type**: Only .txt, .pdf, .doc, .docx are supported
4. **Check browser console** for JavaScript errors
5. **Check server terminal** for backend errors

### Getting More Help

If you're still having issues:

1. Run `node scripts/verify-setup.js` and share the output
2. Check the browser Network tab to see the exact API error
3. Look at your server logs for detailed error messages
4. Ensure your Neon database is running and accessible

## Success Indicators

You'll know document upload is working when:

1. ✅ Verification script shows all green checkmarks
2. ✅ Upload button responds without errors
3. ✅ You see "Document uploaded successfully" message
4. ✅ You can ask questions about uploaded documents
5. ✅ Database shows new entries in `documents` and `chunks` tables

That's it! Your document upload should now be working. 🚀 
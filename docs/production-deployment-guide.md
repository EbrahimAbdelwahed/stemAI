# Production Deployment Guide: RAG MVP with Molecular Database

## Prerequisites

- ✅ Neon PostgreSQL account (or similar PostgreSQL provider)
- ✅ Vercel account for deployment
- ✅ OpenAI API key
- ✅ OAuth provider credentials (GitHub/Google)

## Step 1: Production Database Setup

### 1.1 Create Production Database

**Option A: Neon PostgreSQL (Recommended)**
1. Go to [Neon Console](https://console.neon.tech/)
2. Create new project: "stemai-production"
3. Choose region closest to your users
4. Note down the connection string

**Option B: Other PostgreSQL Providers**
- Supabase, Railway, or any PostgreSQL provider
- Ensure PostgreSQL version 14+ with pgvector support

### 1.2 Enable Required Extensions

Connect to your production database and run:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');
```

## Step 2: Schema Migration to Production

### 2.1 Full Production Schema

Run this complete schema on your production database:

```sql
-- ============================================
-- STEM AI Assistant - Production Schema
-- ============================================

-- Authentication Tables (NextAuth.js)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMP,
  image TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  CONSTRAINT accounts_pkey PRIMARY KEY (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (identifier, token)
);

-- Chat History Tables
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  model VARCHAR(50) NOT NULL,
  "isArchived" BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  parts JSONB,
  "tokenUsage" JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS tool_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "messageId" UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  "toolName" VARCHAR(100) NOT NULL,
  parameters JSONB,
  result JSONB,
  "executionTime" INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Document Storage and RAG Tables
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Added for compatibility
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  document_type VARCHAR(50) DEFAULT 'user_upload',
  "isPublic" BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Added for compatibility
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  "documentId" INTEGER REFERENCES documents(id) ON DELETE CASCADE, -- Added for compatibility
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Molecular Database Tables
CREATE TABLE IF NOT EXISTS molecules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  common_names TEXT[], -- Array of alternative names
  pdb_id VARCHAR(10), -- Protein Data Bank ID
  pubchem_cid BIGINT, -- PubChem Compound ID
  smiles_notation TEXT, -- SMILES string
  molecular_formula VARCHAR(100), -- Chemical formula
  molecular_weight DECIMAL(10,3), -- Molecular weight
  description TEXT, -- Description
  structure_type VARCHAR(20) DEFAULT 'small_molecule', -- Type classification
  
  -- Search and indexing
  search_vector TSVECTOR, -- Full-text search
  embedding VECTOR(1536), -- Semantic embedding
  
  -- Metadata
  source VARCHAR(50), -- Data source
  confidence_score DECIMAL(3,2) DEFAULT 1.0, -- Quality score
  last_validated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT molecules_name_not_empty CHECK (LENGTH(name) > 0),
  CONSTRAINT molecules_has_identifier CHECK (
    pdb_id IS NOT NULL OR 
    pubchem_cid IS NOT NULL OR 
    smiles_notation IS NOT NULL
  ),
  CONSTRAINT molecules_confidence_range CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0)
);

-- Performance and Caching Tables
CREATE TABLE IF NOT EXISTS cached_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,
  result JSONB NOT NULL,
  query_type VARCHAR(20) DEFAULT 'search',
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  queries_count INTEGER DEFAULT 0,
  uploads_count INTEGER DEFAULT 0,
  molecule_lookups_count INTEGER DEFAULT 0,
  storage_mb INTEGER DEFAULT 0,
  last_reset TIMESTAMP DEFAULT NOW()
);

-- Analytics Tables
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  session_id VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  page VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id SERIAL PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  cls REAL,
  inp REAL,
  fcp REAL,
  lcp REAL,
  ttfb REAL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  session_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS api_metrics (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  duration REAL NOT NULL,
  response_size INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  session_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  referrer VARCHAR(255),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  session_id VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions("sessionToken");

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations("userId");
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages("conversationId");
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tool_invocations_message_id ON tool_invocations("messageId");

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents("userId");
CREATE INDEX IF NOT EXISTS idx_documents_user_id_compat ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id_compat ON chunks("documentId");

-- Vector search indexes (using ivfflat for approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_molecules_embedding ON molecules USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Molecular database indexes
CREATE INDEX IF NOT EXISTS idx_molecules_name_gin ON molecules USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_molecules_name_btree ON molecules(name);
CREATE INDEX IF NOT EXISTS idx_molecules_pdb_id ON molecules(pdb_id) WHERE pdb_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_molecules_pubchem_cid ON molecules(pubchem_cid) WHERE pubchem_cid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_molecules_search_vector ON molecules USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_molecules_structure_type ON molecules(structure_type);
CREATE INDEX IF NOT EXISTS idx_molecules_created_at ON molecules(created_at);

-- Cache and usage indexes
CREATE INDEX IF NOT EXISTS idx_cached_results_hash ON cached_results(query_hash);
CREATE INDEX IF NOT EXISTS idx_cached_results_type ON cached_results(query_type);
CREATE INDEX IF NOT EXISTS idx_cached_results_created_at ON cached_results(created_at);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Update search vector for molecules
CREATE OR REPLACE FUNCTION update_molecules_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(array_to_string(NEW.common_names, ' '), '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.molecular_formula, '')
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_molecules_search_vector_trigger
  BEFORE INSERT OR UPDATE ON molecules
  FOR EACH ROW EXECUTE FUNCTION update_molecules_search_vector();

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chunks_updated_at BEFORE UPDATE ON chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Populate Initial Molecular Data

After schema creation, add essential molecules:

```sql
-- Insert common molecules for immediate functionality
INSERT INTO molecules (name, common_names, pubchem_cid, smiles_notation, molecular_formula, molecular_weight, description, structure_type, source) VALUES
('Water', ARRAY['H2O', 'Dihydrogen monoxide'], 962, 'O', 'H2O', 18.015, 'Essential molecule for life, universal solvent', 'small_molecule', 'pubchem'),
('Glucose', ARRAY['Dextrose', 'D-glucose', 'Blood sugar'], 5793, 'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O', 'C6H12O6', 180.156, 'Primary energy source for cellular respiration', 'small_molecule', 'pubchem'),
('Caffeine', ARRAY['1,3,7-trimethylxanthine'], 2519, 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C', 'C8H10N4O2', 194.194, 'Central nervous system stimulant', 'small_molecule', 'pubchem'),
('Aspirin', ARRAY['Acetylsalicylic acid', 'ASA'], 2244, 'CC(=O)OC1=CC=CC=C1C(=O)O', 'C9H8O4', 180.158, 'Analgesic and anti-inflammatory drug', 'small_molecule', 'pubchem'),
('Penicillin G', ARRAY['Benzylpenicillin'], 5904, 'CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C', 'C16H18N2O4S', 334.390, 'Beta-lactam antibiotic', 'small_molecule', 'pubchem'),
('ATP', ARRAY['Adenosine triphosphate'], 5957, 'C1=NC(=C2C(=N1)N(C=N2)[C@H]3[C@@H]([C@@H]([C@H](O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)N', 'C10H16N5O13P3', 507.181, 'Universal energy currency of the cell', 'small_molecule', 'pubchem'),
('Cholesterol', ARRAY['Cholest-5-en-3-ol'], 5997, 'C[C@H](CCCC(C)C)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C', 'C27H46O', 386.653, 'Essential structural component of animal cell membranes', 'small_molecule', 'pubchem');

-- Insert protein and nucleic acid molecules with PDB IDs or alternative identifiers
INSERT INTO molecules (name, common_names, pdb_id, molecular_formula, molecular_weight, description, structure_type, source) VALUES
('Crambin', ARRAY['Plant seed protein'], '1CRN', 'C202H315N55O64S6', 4730.0, 'Small plant seed protein, commonly used for crystallography', 'protein', 'pdb'),
('Lysozyme', ARRAY['Muramidase'], '1LYZ', 'C613H959N193O185S10', 14300.0, 'Antimicrobial enzyme that breaks down bacterial cell walls', 'protein', 'pdb'),
('Insulin (crystal structure)', ARRAY['Human insulin crystal'], '1INS', 'C254H377N65O75S6', 5808.0, 'Crystal structure of human insulin', 'protein', 'pdb'),
('Myoglobin', ARRAY['Muscle oxygen carrier'], '1MBN', 'C769H1213N203O218S2Fe', 17800.0, 'Oxygen-binding protein in muscle cells', 'protein', 'pdb'),
('Cytochrome C', ARRAY['Electron transport protein'], '1HRC', 'C357H573N103O113S2Fe', 12400.0, 'Electron transport protein in mitochondria', 'protein', 'pdb');

-- Insert complex molecules with SMILES notation where available
INSERT INTO molecules (name, common_names, smiles_notation, molecular_formula, molecular_weight, description, structure_type, source) VALUES
('Hemoglobin subunit', ARRAY['Hb alpha chain'], 'Complex_protein_structure', 'C2952H4664N812O832S8Fe4', 64500.0, 'Oxygen-carrying protein subunit in red blood cells', 'protein', 'literature'),
('DNA nucleotide (Adenine)', ARRAY['dAMP', 'Deoxyadenosine monophosphate'], 'C1=NC2=C(N1[C@H]3C[C@@H](O[C@@H]3CO)OP(=O)(O)O)N=CN=C2N', 'C10H14N5O6P', 331.222, 'DNA building block containing adenine base', 'nucleic_acid', 'pubchem');

-- Verify data insertion
SELECT COUNT(*) as total_molecules FROM molecules;
SELECT structure_type, COUNT(*) FROM molecules GROUP BY structure_type;
```

## Step 3: Production Environment Configuration

### 3.1 Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@your-prod-neon-db.com/dbname
RAG_ENABLED=true

# AI Configuration
OPENAI_API_KEY=sk-your-production-openai-key

# Authentication
NEXTAUTH_SECRET=your-strong-production-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# OAuth Providers
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Performance Settings
RAG_CHUNK_SIZE=512
RAG_CHUNK_OVERLAP=50
RAG_MAX_RESULTS=5
RAG_SIMILARITY_THRESHOLD=0.5
RAG_CACHE_TTL=3600
RAG_ENABLE_CACHING=true

# Molecular Settings
MOLECULE_CACHE_TTL=86400
ENABLE_MOLECULE_SEARCH=true

# Analytics (Optional)
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### 3.2 Production-Specific Settings

Create `vercel.json` for production optimizations:

```json
{
  "functions": {
    "app/api/chat/route.ts": { 
      "maxDuration": 30 
    },
    "app/api/documents/route.ts": { 
      "maxDuration": 60 
    },
    "app/api/ocr/route.ts": { 
      "maxDuration": 30 
    }
  },
  "env": {
    "RAG_ENABLED": "true"
  }
}
```

## Step 4: Deploy to Production

### 4.1 Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or link and deploy
vercel link
vercel --prod
```

### 4.2 Deploy via GitHub Integration

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Push to main branch
4. Automatic deployment will trigger

## Step 5: Post-Deployment Verification

### 5.1 Database Connection Test

Test database connectivity:

```bash
# Connect to your production DB and verify
psql "your-production-database-url"

# Check tables
\dt

# Verify molecular data
SELECT COUNT(*) FROM molecules;
SELECT name, pdb_id, pubchem_cid FROM molecules LIMIT 5;
```

### 5.2 Application Health Check

1. **Authentication Test**: Sign in with OAuth providers
2. **Document Upload**: Upload a test document
3. **RAG Search**: Ask questions about uploaded documents
4. **Molecular Search**: Search for "caffeine" or "water"
5. **3D Visualization**: Test molecular structure display

### 5.3 Performance Monitoring

Monitor these metrics:
- Database query performance (<200ms for vector searches)
- API response times
- Error rates
- User authentication flow

## Step 6: Production Maintenance

### 6.1 Regular Database Maintenance

```sql
-- Weekly maintenance (run via cron or scheduled function)

-- Update table statistics
ANALYZE molecules;
ANALYZE chunks;
ANALYZE documents;

-- Clean old cache entries (older than 30 days)
DELETE FROM cached_results 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Reset monthly usage counters (run monthly)
UPDATE user_usage SET 
  queries_count = 0,
  uploads_count = 0,
  molecule_lookups_count = 0,
  last_reset = NOW()
WHERE last_reset < DATE_TRUNC('month', NOW());
```

### 6.2 Backup Strategy

1. **Neon Automatic Backups**: Verify enabled in Neon console
2. **Manual Backups**: Export important data periodically
3. **Schema Versioning**: Keep schema changes in version control

### 6.3 Scaling Considerations

**When to Scale:**
- Vector search >500ms consistently
- >1000 concurrent users
- >100GB document storage

**Scaling Options:**
- Upgrade Neon plan for better performance
- Implement read replicas for analytics
- Add Redis for application-level caching
- Consider migrating to dedicated PostgreSQL + FAISS

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Test connection
psql "your-production-database-url" -c "SELECT version();"

# Check environment variables
vercel env ls
```

### Vector Search Performance
```sql
-- Check index usage
EXPLAIN ANALYZE SELECT * FROM chunks ORDER BY embedding <=> '[...]' LIMIT 5;

-- Rebuild indexes if needed
REINDEX INDEX idx_chunks_embedding;
```

### Authentication Problems
- Verify OAuth app configurations
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

Your production deployment is now complete! 🚀

**Next Steps:**
- Monitor application performance
- Add more molecular data as needed
- Implement user feedback collection
- Plan for future scaling 
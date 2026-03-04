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

## Appendix A: Inserting Complete Molecular Datasets

### A.1 Data Sources for Molecular Information

#### Option 1: PubChem Database (Recommended for Small Molecules)
PubChem provides comprehensive chemical information with REST API access:

```typescript
// lib/data/pubchem-importer.ts
interface PubChemCompound {
  cid: number;
  molecular_formula: string;
  molecular_weight: number;
  iupac_name: string;
  synonyms: string[];
  smiles: string;
  description?: string;
}

export class PubChemImporter {
  private readonly baseUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
  private readonly batchSize = 100;

  async fetchCompoundsBatch(cids: number[]): Promise<PubChemCompound[]> {
    const cidList = cids.join(',');
    const url = `${this.baseUrl}/compound/cid/${cidList}/JSON`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      return data.PC_Compounds.map((compound: any) => ({
        cid: compound.id.id.cid,
        molecular_formula: this.extractProperty(compound, 'Molecular Formula'),
        molecular_weight: this.extractProperty(compound, 'Molecular Weight'),
        iupac_name: this.extractProperty(compound, 'IUPAC Name'),
        synonyms: this.extractSynonyms(compound),
        smiles: this.extractProperty(compound, 'SMILES'),
        description: this.extractProperty(compound, 'Description')
      }));
    } catch (error) {
      console.error(`Error fetching compounds ${cidList}:`, error);
      return [];
    }
  }

  private extractProperty(compound: any, propertyName: string): string {
    const props = compound.props || [];
    const prop = props.find((p: any) => 
      p.urn?.label === propertyName || p.urn?.name === propertyName
    );
    return prop?.value?.sval || prop?.value?.fval?.toString() || '';
  }

  private extractSynonyms(compound: any): string[] {
    // Extract synonyms from compound data
    const synonyms = compound.synonyms || [];
    return synonyms.slice(0, 10); // Limit to first 10 synonyms
  }
}
```

#### Option 2: Protein Data Bank (PDB) for Protein Structures

```typescript
// lib/data/pdb-importer.ts
interface PDBStructure {
  pdb_id: string;
  title: string;
  molecular_formula: string;
  molecular_weight: number;
  organism: string;
  resolution: number;
  method: string;
}

export class PDBImporter {
  private readonly baseUrl = 'https://data.rcsb.org/rest/v1/core';

  async fetchStructureInfo(pdbId: string): Promise<PDBStructure | null> {
    try {
      const url = `${this.baseUrl}/entry/${pdbId}`;
      const response = await fetch(url);
      const data = await response.json();

      return {
        pdb_id: pdbId.toUpperCase(),
        title: data.struct?.title || 'Unknown',
        molecular_formula: data.chem_comp?.formula || 'Unknown',
        molecular_weight: data.exptl?.[0]?.details || 0,
        organism: data.rcsb_entity_source_organism?.[0]?.ncbi_scientific_name || 'Unknown',
        resolution: data.refine?.[0]?.ls_d_res_high || 0,
        method: data.exptl?.[0]?.method || 'Unknown'
      };
    } catch (error) {
      console.error(`Error fetching PDB ${pdbId}:`, error);
      return null;
    }
  }

  async fetchAllStructures(limit: number = 1000): Promise<string[]> {
    // Get list of all PDB IDs
    const url = 'https://data.rcsb.org/rest/v1/holdings/current/entry_ids';
    const response = await fetch(url);
    const pdbIds = await response.json();
    return pdbIds.slice(0, limit);
  }
}
```

### A.2 Batch Import Strategy

Create a comprehensive import script:

```typescript
// scripts/import-molecules.ts
import { db } from '@/lib/db';
import { molecules } from '@/lib/db/schema';
import { PubChemImporter } from '@/lib/data/pubchem-importer';
import { PDBImporter } from '@/lib/data/pdb-importer';
import { OpenAI } from 'openai';

interface ImportConfig {
  pubchemCids?: number[];
  pdbIds?: string[];
  batchSize: number;
  generateEmbeddings: boolean;
  validateData: boolean;
}

export class MoleculeImporter {
  private pubchem = new PubChemImporter();
  private pdb = new PDBImporter();
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async importDataset(config: ImportConfig) {
    console.log('Starting molecular dataset import...');
    
    let totalImported = 0;
    const startTime = Date.now();

    try {
      // Import PubChem compounds
      if (config.pubchemCids?.length) {
        totalImported += await this.importPubChemCompounds(
          config.pubchemCids, 
          config
        );
      }

      // Import PDB structures
      if (config.pdbIds?.length) {
        totalImported += await this.importPDBStructures(
          config.pdbIds, 
          config
        );
      }

      const duration = (Date.now() - startTime) / 1000;
      console.log(`Import completed: ${totalImported} molecules in ${duration}s`);

    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  private async importPubChemCompounds(cids: number[], config: ImportConfig): Promise<number> {
    const batches = this.chunkArray(cids, config.batchSize);
    let imported = 0;

    for (const [index, batch] of batches.entries()) {
      console.log(`Processing PubChem batch ${index + 1}/${batches.length}`);
      
      const compounds = await this.pubchem.fetchCompoundsBatch(batch);
      
      for (const compound of compounds) {
        try {
          if (config.validateData && !this.validatePubChemCompound(compound)) {
            console.warn(`Skipping invalid compound CID ${compound.cid}`);
            continue;
          }

          const embedding = config.generateEmbeddings 
            ? await this.generateEmbedding(compound.iupac_name || `CID ${compound.cid}`)
            : null;

          await db.insert(molecules).values({
            name: compound.iupac_name || `Compound ${compound.cid}`,
            common_names: compound.synonyms,
            pubchem_cid: compound.cid,
            smiles_notation: compound.smiles,
            molecular_formula: compound.molecular_formula,
            molecular_weight: parseFloat(compound.molecular_weight.toString()),
            description: compound.description,
            structure_type: 'small_molecule',
            source: 'pubchem',
            embedding
          }).onConflictDoNothing();

          imported++;
        } catch (error) {
          console.error(`Error importing compound ${compound.cid}:`, error);
        }
      }

      // Rate limiting - wait between batches
      await this.sleep(1000);
    }

    return imported;
  }

  private async importPDBStructures(pdbIds: string[], config: ImportConfig): Promise<number> {
    let imported = 0;

    for (const [index, pdbId] of pdbIds.entries()) {
      if (index % 100 === 0) {
        console.log(`Processing PDB structures: ${index}/${pdbIds.length}`);
      }

      try {
        const structure = await this.pdb.fetchStructureInfo(pdbId);
        if (!structure) continue;

        if (config.validateData && !this.validatePDBStructure(structure)) {
          console.warn(`Skipping invalid PDB ${pdbId}`);
          continue;
        }

        const embedding = config.generateEmbeddings 
          ? await this.generateEmbedding(structure.title)
          : null;

        await db.insert(molecules).values({
          name: structure.title,
          pdb_id: structure.pdb_id,
          molecular_formula: structure.molecular_formula,
          molecular_weight: structure.molecular_weight,
          description: `${structure.method} structure from ${structure.organism}`,
          structure_type: 'protein',
          source: 'pdb',
          embedding
        }).onConflictDoNothing();

        imported++;
      } catch (error) {
        console.error(`Error importing PDB ${pdbId}:`, error);
      }

      // Rate limiting
      await this.sleep(200);
    }

    return imported;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  private validatePubChemCompound(compound: any): boolean {
    return !!(
      compound.cid &&
      (compound.smiles || compound.molecular_formula) &&
      compound.molecular_weight > 0
    );
  }

  private validatePDBStructure(structure: any): boolean {
    return !!(
      structure.pdb_id &&
      structure.title &&
      structure.pdb_id.length === 4
    );
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### A.3 Pre-curated Dataset Options

#### Option 1: ChEMBL Database Export
Download curated drug molecules:

```bash
# Download ChEMBL compound set (requires registration)
wget https://ftp.ebi.ac.uk/pub/databases/chembl/ChEMBLdb/latest/chembl_XX_chemreps.txt.gz

# Or use a smaller FDA-approved drugs dataset
curl -o fda_drugs.sdf "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/source/FDA%20Orange%20Book/SDF"
```

#### Option 2: Essential Molecules Dataset
Create a curated list of essential molecules:

```typescript
// data/essential-molecules.ts
export const essentialMolecules = {
  // Energy metabolism
  energyMolecules: [
    { name: 'ATP', pubchem_cid: 5957 },
    { name: 'ADP', pubchem_cid: 6022 },
    { name: 'AMP', pubchem_cid: 6083 },
    { name: 'Glucose', pubchem_cid: 5793 },
    { name: 'Pyruvate', pubchem_cid: 1060 },
    { name: 'Acetyl-CoA', pubchem_cid: 444493 }
  ],
  
  // Amino acids
  aminoAcids: [
    { name: 'Alanine', pubchem_cid: 5950 },
    { name: 'Glycine', pubchem_cid: 750 },
    { name: 'Serine', pubchem_cid: 5951 },
    { name: 'Threonine', pubchem_cid: 6288 },
    // ... all 20 standard amino acids
  ],
  
  // Neurotransmitters
  neurotransmitters: [
    { name: 'Dopamine', pubchem_cid: 681 },
    { name: 'Serotonin', pubchem_cid: 5202 },
    { name: 'Acetylcholine', pubchem_cid: 187 },
    { name: 'GABA', pubchem_cid: 119 }
  ],
  
  // Common drugs
  drugs: [
    { name: 'Aspirin', pubchem_cid: 2244 },
    { name: 'Ibuprofen', pubchem_cid: 3672 },
    { name: 'Penicillin', pubchem_cid: 5904 },
    { name: 'Caffeine', pubchem_cid: 2519 }
  ],
  
  // Important proteins (PDB IDs)
  proteins: [
    { name: 'Insulin', pdb_id: '1INS' },
    { name: 'Hemoglobin', pdb_id: '1HHO' },
    { name: 'Lysozyme', pdb_id: '1LYZ' },
    { name: 'DNA Polymerase', pdb_id: '1KLN' }
  ]
};

// Usage script
async function importEssentialMolecules() {
  const importer = new MoleculeImporter();
  
  const config: ImportConfig = {
    pubchemCids: [
      ...essentialMolecules.energyMolecules.map(m => m.pubchem_cid),
      ...essentialMolecules.aminoAcids.map(m => m.pubchem_cid),
      ...essentialMolecules.neurotransmitters.map(m => m.pubchem_cid),
      ...essentialMolecules.drugs.map(m => m.pubchem_cid)
    ],
    pdbIds: essentialMolecules.proteins.map(p => p.pdb_id),
    batchSize: 50,
    generateEmbeddings: true,
    validateData: true
  };

  await importer.importDataset(config);
}
```

### A.4 Running the Import

Create a Next.js API endpoint for importing:

```typescript
// app/api/admin/import-molecules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MoleculeImporter } from '@/scripts/import-molecules';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(request: NextRequest) {
  // Check admin permissions
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { dataset, options } = await request.json();
    const importer = new MoleculeImporter();

    let config;
    switch (dataset) {
      case 'essential':
        config = {
          pubchemCids: [5957, 5793, 2519, 2244, 681, 5202], // Essential molecules
          batchSize: 20,
          generateEmbeddings: true,
          validateData: true
        };
        break;
      
      case 'drugs':
        config = {
          pubchemCids: Array.from({length: 1000}, (_, i) => i + 1), // First 1000 compounds
          batchSize: 50,
          generateEmbeddings: options?.embeddings || false,
          validateData: true
        };
        break;
      
      case 'proteins':
        config = {
          pdbIds: ['1INS', '1LYZ', '1HHO', '1MBN', '1CRN'], // Common proteins
          batchSize: 10,
          generateEmbeddings: true,
          validateData: true
        };
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid dataset' }, { status: 400 });
    }

    await importer.importDataset(config);
    return NextResponse.json({ success: true, message: 'Import completed' });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
```

### A.5 Command Line Import Script

For large datasets, use a standalone script:

```typescript
// scripts/bulk-import.ts
import { MoleculeImporter, ImportConfig } from './import-molecules';

async function main() {
  const args = process.argv.slice(2);
  const dataset = args[0] || 'essential';
  
  const configs: Record<string, ImportConfig> = {
    essential: {
      pubchemCids: [5957, 5793, 2519, 2244, 681, 5202], // 6 molecules
      batchSize: 5,
      generateEmbeddings: true,
      validateData: true
    },
    
    small_drugs: {
      pubchemCids: Array.from({length: 100}, (_, i) => i + 1), // 100 compounds
      batchSize: 20,
      generateEmbeddings: true,
      validateData: true
    },
    
    large_drugs: {
      pubchemCids: Array.from({length: 10000}, (_, i) => i + 1), // 10K compounds
      batchSize: 100,
      generateEmbeddings: false, // Skip embeddings for speed
      validateData: true
    },
    
    proteins: {
      pdbIds: ['1INS', '1LYZ', '1HHO', '1MBN', '1CRN', '2HHB', '1A3N'], 
      batchSize: 5,
      generateEmbeddings: true,
      validateData: true
    }
  };

  const config = configs[dataset];
  if (!config) {
    console.error(`Unknown dataset: ${dataset}`);
    console.log('Available datasets:', Object.keys(configs).join(', '));
    process.exit(1);
  }

  const importer = new MoleculeImporter();
  await importer.importDataset(config);
}

// Run the script
main().catch(console.error);
```

### A.6 Usage Examples

```bash
# Install dependencies and run imports
npm install

# Import essential molecules (fast, ~2 minutes)
npx tsx scripts/bulk-import.ts essential

# Import 100 drug compounds (medium, ~10 minutes)
npx tsx scripts/bulk-import.ts small_drugs

# Import common proteins (medium, ~5 minutes)
npx tsx scripts/bulk-import.ts proteins

# Import large dataset without embeddings (slow, ~2 hours)
npx tsx scripts/bulk-import.ts large_drugs
```

### A.7 Performance Optimization

For large datasets (>10K molecules):

1. **Disable embeddings initially**:
```typescript
const config = {
  generateEmbeddings: false, // Import structure first
  // ... other options
};
```

2. **Generate embeddings separately**:
```sql
-- Add embeddings in batches
UPDATE molecules 
SET embedding = generate_embedding(name || ' ' || COALESCE(description, ''))
WHERE embedding IS NULL 
LIMIT 100;
```

3. **Use database transactions**:
```typescript
await db.transaction(async (tx) => {
  for (const molecule of batch) {
    await tx.insert(molecules).values(molecule);
  }
});
```

4. **Monitor progress**:
```sql
-- Check import progress
SELECT 
  COUNT(*) as total,
  COUNT(embedding) as with_embeddings,
  structure_type,
  source
FROM molecules 
GROUP BY structure_type, source;
```

This comprehensive approach allows you to build a substantial molecular database tailored to your specific needs! 🧬 
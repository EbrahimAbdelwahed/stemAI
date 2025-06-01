import { db } from '../db';
import { molecules, cachedResults, userUsage } from '../db/schema';
import { eq, like, ilike, sql, desc, and, or } from 'drizzle-orm';
import { generateEmbeddings } from './embedding';
import crypto from 'crypto';

export interface MoleculeSearchResult {
  id: string;
  name: string;
  commonNames?: string[];
  pdbId?: string;
  pubchemCid?: number;
  smilesNotation?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  description?: string;
  structureType: string;
  similarity?: number;
  source?: string;
}

export interface MolecularIdentifier {
  type: 'name' | 'pdb' | 'cid' | 'smiles' | 'formula';
  value: string;
  confidence: number;
}

// Type for raw database results from semantic search
interface RawSemanticResult {
  id: string;
  name: string;
  commonNames: string[] | null;
  pdbId: string | null;
  pubchemCid: number | null;
  smilesNotation: string | null;
  molecularFormula: string | null;
  molecularWeight: string | null;
  description: string | null;
  structureType: string;
  source: string | null;
  similarity: number;
}

/**
 * Search molecules by name, formula, or description
 */
export async function searchMolecules(
  query: string, 
  limit = 10,
  useEmbedding = true
): Promise<MoleculeSearchResult[]> {
  if (!db || process.env.RAG_ENABLED !== 'true') {
    console.warn('Molecular search disabled or DB not available');
    return [];
  }

  const startTime = performance.now();
  const queryHash = crypto.createHash('md5').update(`molecules:${query}`).digest('hex');

  try {
    // Check cache first
    const cached = await db.select()
      .from(cachedResults)
      .where(and(
        eq(cachedResults.queryHash, queryHash),
        eq(cachedResults.queryType, 'molecule_search')
      ))
      .limit(1);

    if (cached.length > 0) {
      console.log(`[Molecular] Cache hit for query: ${query}`);
      await db.update(cachedResults)
        .set({ 
          accessCount: sql`${cachedResults.accessCount} + 1`,
          lastAccessed: new Date()
        })
        .where(eq(cachedResults.id, cached[0].id));
      
      return cached[0].result as MoleculeSearchResult[];
    }

    let results: MoleculeSearchResult[] = [];

    if (useEmbedding && query.length > 3) {
      // Semantic search using embeddings
      const [queryEmbedding] = await generateEmbeddings(query);
      
      const semanticResults = await db.execute(sql`
        SELECT 
          id,
          name,
          common_names as "commonNames",
          pdb_id as "pdbId", 
          pubchem_cid as "pubchemCid",
          smiles_notation as "smilesNotation",
          molecular_formula as "molecularFormula",
          molecular_weight as "molecularWeight",
          description,
          structure_type as "structureType",
          source,
          1 - (embedding <=> ${JSON.stringify(queryEmbedding.embedding)}) as similarity
        FROM molecules 
        WHERE embedding IS NOT NULL
        ORDER BY similarity DESC
        LIMIT ${limit}
      `);

      // Properly type and convert the raw results
      const rawResults = semanticResults.rows as unknown as RawSemanticResult[];
      results = rawResults.map(row => ({
        id: row.id,
        name: row.name,
        commonNames: row.commonNames || undefined,
        pdbId: row.pdbId || undefined,
        pubchemCid: row.pubchemCid || undefined,
        smilesNotation: row.smilesNotation || undefined,
        molecularFormula: row.molecularFormula || undefined,
        molecularWeight: row.molecularWeight ? parseFloat(row.molecularWeight) : undefined,
        description: row.description || undefined,
        structureType: row.structureType,
        similarity: row.similarity,
        source: row.source || undefined,
      }));
    }

    // If no semantic results or query is short, fall back to text search
    if (results.length === 0) {
      const textResults = await db.select({
        id: molecules.id,
        name: molecules.name,
        commonNames: molecules.commonNames,
        pdbId: molecules.pdbId,
        pubchemCid: molecules.pubchemCid,
        smilesNotation: molecules.smilesNotation,
        molecularFormula: molecules.molecularFormula,
        molecularWeight: molecules.molecularWeight,
        description: molecules.description,
        structureType: molecules.structureType,
        source: molecules.source,
      })
      .from(molecules)
      .where(or(
        ilike(molecules.name, `%${query}%`),
        ilike(molecules.description, `%${query}%`),
        ilike(molecules.molecularFormula, `%${query}%`),
        sql`${molecules.commonNames} && ARRAY[${query}]` // Check if query is in common names array
      ))
      .orderBy(desc(molecules.name))
      .limit(limit);

      // Convert text results to proper format
      results = textResults.map(row => ({
        id: row.id,
        name: row.name,
        commonNames: row.commonNames || undefined,
        pdbId: row.pdbId || undefined,
        pubchemCid: row.pubchemCid || undefined,
        smilesNotation: row.smilesNotation || undefined,
        molecularFormula: row.molecularFormula || undefined,
        molecularWeight: row.molecularWeight ? parseFloat(row.molecularWeight) : undefined,
        description: row.description || undefined,
        structureType: row.structureType,
        source: row.source || undefined,
      }));
    }

    // Cache the results
    if (results.length > 0) {
      await db.insert(cachedResults).values({
        queryHash,
        result: results,
        queryType: 'molecule_search',
        accessCount: 1,
      }).onConflictDoNothing();
    }

    const duration = performance.now() - startTime;
    console.log(`[Molecular] Search for "${query}" completed in ${duration.toFixed(2)}ms - found ${results.length} results`);

    return results;

  } catch (error) {
    console.error('Error in molecular search:', error);
    return [];
  }
}

/**
 * Get molecule by specific identifier
 */
export async function getMoleculeByIdentifier(
  type: 'pdb' | 'cid' | 'name',
  value: string
): Promise<MoleculeSearchResult | null> {
  if (!db || process.env.RAG_ENABLED !== 'true') {
    return null;
  }

  try {
    let result;
    
    switch (type) {
      case 'pdb':
        result = await db.select().from(molecules)
          .where(eq(molecules.pdbId, value.toUpperCase()))
          .limit(1);
        break;
      case 'cid':
        result = await db.select().from(molecules)
          .where(eq(molecules.pubchemCid, parseInt(value)))
          .limit(1);
        break;
      case 'name':
        result = await db.select().from(molecules)
          .where(ilike(molecules.name, value))
          .limit(1);
        break;
    }

    if (result && result.length > 0) {
      const molecule = result[0];
      return {
        id: molecule.id,
        name: molecule.name,
        commonNames: molecule.commonNames || undefined,
        pdbId: molecule.pdbId || undefined,
        pubchemCid: molecule.pubchemCid || undefined,
        smilesNotation: molecule.smilesNotation || undefined,
        molecularFormula: molecule.molecularFormula || undefined,
        molecularWeight: molecule.molecularWeight ? Number(molecule.molecularWeight) : undefined,
        description: molecule.description || undefined,
        structureType: molecule.structureType,
        source: molecule.source || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error getting molecule by ${type}:`, error);
    return null;
  }
}

/**
 * Analyze query to extract molecular identifiers
 */
export function extractMolecularIdentifiers(query: string): MolecularIdentifier[] {
  const identifiers: MolecularIdentifier[] = [];
  
  // PDB ID pattern (4 characters, first is number, rest alphanumeric)
  const pdbPattern = /\b(\d[A-Za-z0-9]{3})\b/g;
  let pdbMatch;
  while ((pdbMatch = pdbPattern.exec(query)) !== null) {
    identifiers.push({
      type: 'pdb',
      value: pdbMatch[1].toUpperCase(),
      confidence: 0.9
    });
  }

  // PubChem CID pattern (CID: followed by numbers)
  const cidPattern = /(?:CID:?\s*)(\d+)/gi;
  let cidMatch;
  while ((cidMatch = cidPattern.exec(query)) !== null) {
    identifiers.push({
      type: 'cid',
      value: cidMatch[1],
      confidence: 0.95
    });
  }

  // Molecular formula pattern (basic chemical formula)
  const formulaPattern = /\b([A-Z][a-z]?\d*)+\b/g;
  let formulaMatch;
  while ((formulaMatch = formulaPattern.exec(query)) !== null) {
    const formula = formulaMatch[0];
    // Basic validation: should contain at least one letter and might contain numbers
    if (/[A-Z]/.test(formula) && formula.length > 1 && formula.length < 50) {
      identifiers.push({
        type: 'formula',
        value: formula,
        confidence: 0.6
      });
    }
  }

  // SMILES pattern (basic detection - contains specific chemical notation)
  const smilesPattern = /\b[A-Za-z0-9@\[\]()=\-+#\\\/]+\b/g;
  let smilesMatch;
  while ((smilesMatch = smilesPattern.exec(query)) !== null) {
    const smiles = smilesMatch[0];
    // Basic SMILES validation - should contain chemical bonds or ring notation
    if ((/[=\-#]/.test(smiles) || /[\[\]()]/.test(smiles)) && smiles.length > 3) {
      identifiers.push({
        type: 'smiles',
        value: smiles,
        confidence: 0.7
      });
    }
  }

  return identifiers;
}

/**
 * Track molecular usage for analytics
 */
export async function trackMolecularUsage(userId?: string): Promise<void> {
  if (!db || !userId) return;

  try {
    await db.insert(userUsage).values({
      userId,
      moleculeLookupsCount: 1,
    }).onConflictDoUpdate({
      target: userUsage.userId,
      set: {
        moleculeLookupsCount: sql`${userUsage.moleculeLookupsCount} + 1`,
      },
    });
  } catch (error) {
    console.error('Error tracking molecular usage:', error);
  }
}

/**
 * Add or update molecule in database
 */
export async function addMolecule(moleculeData: {
  name: string;
  commonNames?: string[];
  pdbId?: string;
  pubchemCid?: number;
  smilesNotation?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  description?: string;
  structureType?: string;
  source?: string;
}): Promise<string | null> {
  if (!db || process.env.RAG_ENABLED !== 'true') {
    return null;
  }

  try {
    // Generate embedding for the molecule
    const embeddingText = `${moleculeData.name} ${moleculeData.description || ''} ${moleculeData.molecularFormula || ''}`;
    const [embedding] = await generateEmbeddings(embeddingText);

    const [result] = await db.insert(molecules).values({
      name: moleculeData.name,
      commonNames: moleculeData.commonNames,
      pdbId: moleculeData.pdbId,
      pubchemCid: moleculeData.pubchemCid,
      smilesNotation: moleculeData.smilesNotation,
      molecularFormula: moleculeData.molecularFormula,
      molecularWeight: moleculeData.molecularWeight?.toString(),
      description: moleculeData.description,
      structureType: moleculeData.structureType || 'small_molecule',
      source: moleculeData.source || 'user_input',
      embedding: embedding.embedding,
    }).returning({ id: molecules.id });

    console.log(`[Molecular] Added molecule: ${moleculeData.name} (ID: ${result.id})`);
    return result.id;

  } catch (error) {
    console.error('Error adding molecule:', error);
    return null;
  }
} 
import { pgTable, serial, text, timestamp, varchar, integer, real, jsonb, boolean, uuid, primaryKey, decimal } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';

// Authentication Tables (NextAuth.js)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] })
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
}));

// Chat History Tables
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  isArchived: boolean('isArchived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversationId').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  parts: jsonb('parts'),
  tokenUsage: jsonb('tokenUsage'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const toolInvocations = pgTable('tool_invocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('messageId').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  toolName: varchar('toolName', { length: 100 }).notNull(),
  parameters: jsonb('parameters'),
  result: jsonb('result'),
  executionTime: integer('executionTime'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isPublic: boolean('isPublic').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chunks = pgTable('chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analytics Tables for Real Data Collection
export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  eventData: jsonb('event_data'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sessionId: varchar('session_id', { length: 255 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  page: varchar('page', { length: 255 }),
});

export const webVitalsMetrics = pgTable('web_vitals_metrics', {
  id: serial('id').primaryKey(),
  page: varchar('page', { length: 255 }).notNull(),
  cls: real('cls'),
  inp: real('inp'), 
  fcp: real('fcp'),
  lcp: real('lcp'),
  ttfb: real('ttfb'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sessionId: varchar('session_id', { length: 255 }),
});

export const apiMetrics = pgTable('api_metrics', {
  id: serial('id').primaryKey(),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code'),
  duration: real('duration').notNull(),
  responseSize: integer('response_size'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sessionId: varchar('session_id', { length: 255 }),
});

export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  page: varchar('page', { length: 255 }).notNull(),
  referrer: varchar('referrer', { length: 255 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sessionId: varchar('session_id', { length: 255 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
});

// Molecular Database Tables
export const molecules = pgTable('molecules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  commonNames: text('common_names').array(),
  pdbId: varchar('pdb_id', { length: 10 }),
  pubchemCid: integer('pubchem_cid'),
  smilesNotation: text('smiles_notation'),
  molecularFormula: varchar('molecular_formula', { length: 100 }),
  molecularWeight: decimal('molecular_weight', { precision: 10, scale: 3 }),
  description: text('description'),
  structureType: varchar('structure_type', { length: 20 }).default('small_molecule'),
  
  // Search and indexing
  embedding: vector('embedding', { dimensions: 1536 }),
  
  // Metadata
  source: varchar('source', { length: 50 }),
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }).default('1.0'),
  lastValidated: timestamp('last_validated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cachedResults = pgTable('cached_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  queryHash: varchar('query_hash', { length: 64 }).notNull().unique(),
  result: jsonb('result').notNull(),
  queryType: varchar('query_type', { length: 20 }).default('search'),
  accessCount: integer('access_count').default(0),
  lastAccessed: timestamp('last_accessed').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userUsage = pgTable('user_usage', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  queriesCount: integer('queries_count').default(0),
  uploadsCount: integer('uploads_count').default(0),
  moleculeLookupsCount: integer('molecule_lookups_count').default(0),
  storageMb: integer('storage_mb').default(0),
  lastReset: timestamp('last_reset').defaultNow(),
}); 
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';

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
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 
-- ============================================
-- Auth.js Database Tables Setup
-- ============================================
-- Run this script in your PostgreSQL database SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user table (singular - matches Drizzle adapter default)
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create account table (singular - this is what the adapter is looking for)
CREATE TABLE IF NOT EXISTS "account" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
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
    CONSTRAINT account_provider_providerAccountId_key UNIQUE (provider, "providerAccountId"),
    CONSTRAINT account_userId_fkey FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create session table (singular)
CREATE TABLE IF NOT EXISTS "session" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT session_userId_fkey FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create verificationToken table (singular)
CREATE TABLE IF NOT EXISTS "verificationToken" (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT verificationToken_pkey PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");
CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Auth.js tables created successfully with singular names!';
    RAISE NOTICE 'Tables created: user, account, session, verificationToken';
    RAISE NOTICE 'You can now test GitHub OAuth authentication.';
END $$; 
-- ================================================================
-- AUTHENTIFICATOR - COMPLETE DATABASE INITIALIZATION SCRIPT
-- ================================================================
-- This script creates all necessary tables for the authentication system
-- with JWT storage, OAuth support, and login tracking.
--
-- Database: PostgreSQL 12+
-- Compatible with: Neon, Supabase, AWS RDS, Local PostgreSQL
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- USERS TABLE - Store authenticated users
-- ================================================================
CREATE TABLE IF NOT EXISTS "User" (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Basic info
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  
  -- Role and permissions
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  
  -- JWT Token Management
  "currentToken" TEXT,
  "tokenExpiresAt" TIMESTAMP WITH TIME ZONE,
  "lastTokenRefresh" TIMESTAMP WITH TIME ZONE,
  
  -- OAuth Provider info
  "githubId" TEXT UNIQUE,
  "googleId" TEXT UNIQUE,
  provider TEXT CHECK (provider IN ('github', 'google', 'email')),
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  -- Indexes
  CONSTRAINT "unique_email" UNIQUE (email),
  CONSTRAINT "unique_github_id" UNIQUE ("githubId"),
  CONSTRAINT "unique_google_id" UNIQUE ("googleId")
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"(email);
CREATE INDEX IF NOT EXISTS "idx_user_github_id" ON "User"("githubId");
CREATE INDEX IF NOT EXISTS "idx_user_google_id" ON "User"("googleId");
CREATE INDEX IF NOT EXISTS "idx_user_current_token" ON "User"("currentToken");

-- ================================================================
-- LOGIN_LOG TABLE - Track authentication attempts
-- ================================================================
CREATE TABLE IF NOT EXISTS "LoginLog" (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Foreign key
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Login details
  "appName" TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'google', 'email')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  
  -- Error tracking
  "errorMessage" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_login_log_user_id" ON "LoginLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_login_log_created_at" ON "LoginLog"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_login_log_provider" ON "LoginLog"(provider);

-- ================================================================
-- SESSION TABLE (Optional - for additional session tracking)
-- ================================================================
CREATE TABLE IF NOT EXISTS "Session" (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Foreign key
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Session details
  token TEXT UNIQUE NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "lastActivityAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "Session"(token);
CREATE INDEX IF NOT EXISTS "idx_session_is_active" ON "Session"("isActive");
CREATE INDEX IF NOT EXISTS "idx_session_expires_at" ON "Session"("expiresAt");

-- ================================================================
-- OAUTH_TOKENS TABLE (Optional - for token refresh)
-- ================================================================
CREATE TABLE IF NOT EXISTS "OAuthToken" (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Foreign key
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- OAuth provider details
  provider TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "tokenType" TEXT DEFAULT 'Bearer',
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  CONSTRAINT "unique_provider_per_user" UNIQUE ("userId", provider)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_oauth_token_user_id" ON "OAuthToken"("userId");
CREATE INDEX IF NOT EXISTS "idx_oauth_token_provider" ON "OAuthToken"(provider);

-- ================================================================
-- AUDIT_LOG TABLE (Optional - for security audit)
-- ================================================================
CREATE TABLE IF NOT EXISTS "AuditLog" (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  -- Foreign key
  "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  
  -- Action details
  action TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "oldValues" JSONB,
  "newValues" JSONB,
  
  -- Context
  "ipAddress" TEXT,
  "userAgent" TEXT,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_audit_log_user_id" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_log_action" ON "AuditLog"(action);
CREATE INDEX IF NOT EXISTS "idx_audit_log_created_at" ON "AuditLog"("createdAt");

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================

-- Insert a test admin user (replace with real data)
INSERT INTO "User" (email, name, avatar, role, provider, "createdAt", "updatedAt")
VALUES (
  'admin@authentificator.app',
  'Admin User',
  'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff',
  'admin',
  'email',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- TRIGGERS for updating timestamps
-- ================================================================

-- Create function to update updatedAt
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to User table
DROP TRIGGER IF EXISTS "trigger_update_user_timestamp" ON "User";
CREATE TRIGGER "trigger_update_user_timestamp"
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Apply trigger to OAuthToken table
DROP TRIGGER IF EXISTS "trigger_update_oauth_token_timestamp" ON "OAuthToken";
CREATE TRIGGER "trigger_update_oauth_token_timestamp"
  BEFORE UPDATE ON "OAuthToken"
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ================================================================
-- VIEWS for common queries
-- ================================================================

-- View for recent successful logins
CREATE OR REPLACE VIEW "RecentSuccessfulLogins" AS
SELECT 
  u.id,
  u.email,
  u.name,
  ll."appName",
  ll.provider,
  ll."createdAt"
FROM "User" u
JOIN "LoginLog" ll ON u.id = ll."userId"
WHERE ll.status = 'success'
ORDER BY ll."createdAt" DESC
LIMIT 100;

-- View for active sessions
CREATE OR REPLACE VIEW "ActiveSessions" AS
SELECT 
  s.id,
  s."userId",
  u.email,
  u.name,
  s."ipAddress",
  s."createdAt",
  s."expiresAt",
  s."lastActivityAt"
FROM "Session" s
JOIN "User" u ON s."userId" = u.id
WHERE s."isActive" = true AND s."expiresAt" > CURRENT_TIMESTAMP
ORDER BY s."lastActivityAt" DESC;

-- ================================================================
-- COMMENTS for documentation
-- ================================================================

COMMENT ON TABLE "User" IS 'Stores authenticated users with OAuth and JWT token management';
COMMENT ON TABLE "LoginLog" IS 'Tracks all login attempts for security audit';
COMMENT ON TABLE "Session" IS 'Manages active user sessions';
COMMENT ON TABLE "OAuthToken" IS 'Stores OAuth provider tokens for refresh capability';
COMMENT ON TABLE "AuditLog" IS 'Records all important actions for security compliance';

COMMENT ON COLUMN "User"."currentToken" IS 'Current active JWT token';
COMMENT ON COLUMN "User"."tokenExpiresAt" IS 'JWT expiration time (default 7 days)';
COMMENT ON COLUMN "User"."lastTokenRefresh" IS 'Last token refresh timestamp';
COMMENT ON COLUMN "User"."githubId" IS 'GitHub user ID for OAuth';
COMMENT ON COLUMN "User"."googleId" IS 'Google user ID for OAuth';

-- ================================================================
-- GRANT PERMISSIONS (adjust as needed for your setup)
-- ================================================================

-- For Vercel/Neon users, permissions are typically handled by connection string
-- For local PostgreSQL, uncomment and adjust as needed:
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- ================================================================
-- END OF INITIALIZATION SCRIPT
-- ================================================================
-- Tables created:
-- - User (with JWT and OAuth support)
-- - LoginLog (authentication audit)
-- - Session (active sessions)
-- - OAuthToken (provider token storage)
-- - AuditLog (security audit)
--
-- Views created:
-- - RecentSuccessfulLogins
-- - ActiveSessions
--
-- Total tables: 5
-- Total views: 2
-- Total indexes: 15
-- ================================================================

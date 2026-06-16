-- -----------------------------------------------------------------------------
-- Authentifictor Service - PostgreSQL Schema (Reset & Recreate)
-- -----------------------------------------------------------------------------

-- WARNING: This will delete all existing data!
DROP TABLE IF EXISTS "LoginLog" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 1. Users Table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. LoginLog Table
CREATE TABLE "LoginLog" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "provider" TEXT NOT NULL, -- 'google' ou 'github'
    "status" TEXT NOT NULL,   -- 'success' ou 'failure'
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Performance Indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "LoginLog_userId_idx" ON "LoginLog"("userId");
CREATE INDEX "LoginLog_appName_idx" ON "LoginLog"("appName");
CREATE INDEX "LoginLog_timestamp_idx" ON "LoginLog"("timestamp" DESC);

-- 4. Seed Data (Mock Data for Logistix Dashboard)
INSERT INTO "User" ("id", "email", "name", "avatar", "createdAt") VALUES
('usr_1', 'danielle.garner@info.com', 'Danielle Garner', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', NOW() - INTERVAL '10 days'),
('usr_2', 'john.doe@gmail.com', 'John Doe', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NOW() - INTERVAL '9 days'),
('usr_3', 'jane.smith@gmail.com', 'Jane Smith', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', NOW() - INTERVAL '8 days'),
('usr_4', 'mike.johnson@gmail.com', 'Mike Johnson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', NOW() - INTERVAL '7 days'),
('usr_5', 'emily.davis@gmail.com', 'Emily Davis', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', NOW() - INTERVAL '6 days'),
('usr_6', 'admin@info.com', 'Admin Logistix', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', NOW() - INTERVAL '15 days');

INSERT INTO "LoginLog" ("id", "userId", "appName", "provider", "status", "timestamp") VALUES
('log_1', 'usr_6', 'Admin Console', 'google', 'success', NOW() - INTERVAL '5 minutes'),
('log_2', 'usr_2', 'Fleet Management', 'github', 'success', NOW() - INTERVAL '15 minutes'),
('log_3', 'usr_3', 'Logistics Dashboard', 'google', 'success', NOW() - INTERVAL '35 minutes'),
('log_4', 'usr_4', 'Warehouse Inventory', 'google', 'success', NOW() - INTERVAL '1 hour'),
('log_5', 'usr_5', 'Logistics Dashboard', 'github', 'success', NOW() - INTERVAL '2 hours'),
('log_6', 'usr_2', 'Order Management', 'github', 'success', NOW() - INTERVAL '4 hours'),
('log_7', 'usr_3', 'Logistics Dashboard', 'google', 'failure', NOW() - INTERVAL '5 hours'),
('log_8', 'usr_4', 'Warehouse Inventory', 'google', 'failure', NOW() - INTERVAL '6 hours'),
('log_9', 'usr_1', 'Logistics Dashboard', 'google', 'success', NOW() - INTERVAL '8 hours'),
('log_10', 'usr_2', 'Fleet Management', 'github', 'success', NOW() - INTERVAL '12 hours'),
('log_11', 'usr_5', 'Logistics Dashboard', 'github', 'success', NOW() - INTERVAL '15 hours'),
('log_12', 'usr_6', 'Admin Console', 'google', 'success', NOW() - INTERVAL '1 day'),
('log_13', 'usr_3', 'Reports', 'google', 'success', NOW() - INTERVAL '1 day'),
('log_14', 'usr_4', 'Reports', 'google', 'success', NOW() - INTERVAL '2 days'),
('log_15', 'usr_2', 'Fleet Management', 'github', 'failure', NOW() - INTERVAL '2 days'),
('log_16', 'usr_5', 'Order Management', 'github', 'success', NOW() - INTERVAL '3 days'),
('log_17', 'usr_1', 'Invoices', 'google', 'success', NOW() - INTERVAL '3 days'),
('log_18', 'usr_3', 'Logistics Dashboard', 'google', 'success', NOW() - INTERVAL '4 days'),
('log_19', 'usr_4', 'Warehouse Inventory', 'google', 'success', NOW() - INTERVAL '4 days'),
('log_20', 'usr_6', 'Admin Console', 'google', 'success', NOW() - INTERVAL '5 days');

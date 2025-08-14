-- =============================================
-- Aura SDLC Database Setup - Step 1
-- Create Database
-- =============================================

-- Create the main database for Aura SDLC
CREATE DATABASE IF NOT EXISTS aura_sdlc 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Verify database creation
SHOW DATABASES LIKE 'aura_sdlc';

SELECT 'Database aura_sdlc created successfully!' as Status;

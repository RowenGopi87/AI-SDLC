-- =============================================
-- Aura SDLC Database Setup - Step 2
-- Create Users and Grant Permissions
-- =============================================

-- Create the aura_user for application connections
-- Support different host patterns for flexibility
CREATE USER IF NOT EXISTS 'aura_user'@'localhost' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'127.0.0.1' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'%' IDENTIFIED BY 'aura_password_123';

-- Grant all privileges on the aura_sdlc database
GRANT ALL PRIVILEGES ON aura_sdlc.* TO 'aura_user'@'localhost';
GRANT ALL PRIVILEGES ON aura_sdlc.* TO 'aura_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON aura_sdlc.* TO 'aura_user'@'%';

-- Also grant global privileges for vector store operations
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'localhost';
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'aura_user';

SELECT 'Users created and permissions granted successfully!' as Status;

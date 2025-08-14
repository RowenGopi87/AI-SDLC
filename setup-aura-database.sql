-- AURA Database Setup Script
-- Run this after connecting to MariaDB as root

-- Create the database
CREATE DATABASE IF NOT EXISTS aura_sdlc;

-- Create users (both localhost and wildcard for different connection types)
CREATE USER IF NOT EXISTS 'aura_user'@'localhost' IDENTIFIED BY 'aura_password_123';
CREATE USER IF NOT EXISTS 'aura_user'@'%' IDENTIFIED BY 'aura_password_123';

-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'localhost';
GRANT ALL PRIVILEGES ON *.* TO 'aura_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify setup
SELECT 'Database and user created successfully!' as Result;
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'aura_user';


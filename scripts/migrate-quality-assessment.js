/**
 * Migration script to add quality_assessment column to business_briefs table
 * Run this manually if needed: node scripts/migrate-quality-assessment.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔧 Starting quality assessment column migration...');

    // Create connection to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'aura_user',
      password: process.env.DB_PASSWORD || 'aura_dev_2024',
      database: process.env.DB_NAME || 'aura_sdlc'
    });

    console.log('✅ Connected to database');

    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'business_briefs' AND COLUMN_NAME = 'quality_assessment'
    `, [process.env.DB_NAME || 'aura_sdlc']);

    if (columns.length > 0) {
      console.log('✅ quality_assessment column already exists');
      return;
    }

    // Read migration SQL
    const migrationPath = path.join(__dirname, '../database/setup/08-add-quality-assessment-column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await connection.execute(migrationSQL);
    console.log('✅ Successfully added quality_assessment column');

    await connection.end();
    console.log('🎉 Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Note: You may need to run this migration manually in your database:');
    console.error('ALTER TABLE business_briefs ADD COLUMN quality_assessment TEXT DEFAULT NULL;');
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

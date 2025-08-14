// Database connection manager for Aura's MariaDB integration
import mysql from 'mysql2/promise';
import { DATABASE_CONFIG, validateConfig } from './config';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: mysql.Pool | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized && this.pool) {
      return;
    }

    // Validate configuration
    const validation = validateConfig();
    if (!validation.isValid) {
      throw new Error(`Database configuration invalid: ${validation.errors.join(', ')}`);
    }
    
    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Database configuration warnings:', validation.warnings.join(', '));
    }

    try {
      // Create connection pool
      this.pool = mysql.createPool({
        host: DATABASE_CONFIG.host,
        port: DATABASE_CONFIG.port,
        user: DATABASE_CONFIG.user,
        password: DATABASE_CONFIG.password,
        database: DATABASE_CONFIG.database,
        waitForConnections: true,
        connectionLimit: DATABASE_CONFIG.maxPoolSize,
        queueLimit: 0,
        ssl: DATABASE_CONFIG.ssl
      });

      // Test the connection
      await this.testConnection();
      this.isInitialized = true;
      
      console.log('✅ Aura Database connection initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const connection = await this.pool.getConnection();
    try {
      await connection.ping();
      console.log('✅ Database connection test successful');
    } finally {
      connection.release();
    }
  }

  public async execute<T = any>(
    query: string, 
    params: any[] = []
  ): Promise<T[]> {
    if (!this.pool) {
      await this.initialize();
    }

    if (!this.pool) {
      throw new Error('Database connection not available');
    }

    try {
      const [rows] = await this.pool.execute(query, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      console.error('Query:', query);
      console.error('Params:', params);
      throw error;
    }
  }

  public async query<T = any>(
    sql: string, 
    params: any[] = []
  ): Promise<T[]> {
    return this.execute<T>(sql, params);
  }

  public async transaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      await this.initialize();
    }

    if (!this.pool) {
      throw new Error('Database connection not available');
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('✅ Database connection closed');
    }
  }

  public isConnected(): boolean {
    return this.isInitialized && this.pool !== null;
  }

  // Database introspection methods
  public async listDatabases(): Promise<string[]> {
    const rows = await this.execute<{Database: string}>('SHOW DATABASES');
    return rows.map(row => row.Database);
  }

  public async listTables(database?: string): Promise<string[]> {
    let query = 'SHOW TABLES';
    if (database) {
      query = `SHOW TABLES FROM \`${database}\``;
    }
    
    const rows = await this.execute(query);
    return rows.map(row => Object.values(row)[0] as string);
  }

  public async getTableSchema(
    tableName: string, 
    database?: string
  ): Promise<any[]> {
    let query = `DESCRIBE \`${tableName}\``;
    if (database) {
      query = `DESCRIBE \`${database}\`.\`${tableName}\``;
    }
    
    return this.execute(query);
  }

  public async databaseExists(databaseName: string): Promise<boolean> {
    const databases = await this.listDatabases();
    return databases.includes(databaseName);
  }

  public async tableExists(tableName: string, database?: string): Promise<boolean> {
    try {
      const tables = await this.listTables(database);
      return tables.includes(tableName);
    } catch (error) {
      return false;
    }
  }

  public async createDatabase(databaseName: string): Promise<void> {
    await this.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`✅ Database '${databaseName}' created or already exists`);
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();

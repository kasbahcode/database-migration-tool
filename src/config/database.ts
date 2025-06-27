import { config } from 'dotenv';
import { DatabaseConfig } from '../types';

config();

export function getDatabaseConfig(): DatabaseConfig {
  const dbType = process.env.DB_TYPE as DatabaseConfig['type'];
  
  if (!dbType) {
    throw new Error('DB_TYPE is required in environment variables');
  }

  const baseConfig: DatabaseConfig = {
    type: dbType,
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'default'
  };

  switch (dbType) {
    case 'mysql':
    case 'postgresql':
      return {
        ...baseConfig,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || (dbType === 'mysql' ? '3306' : '5432')),
        username: process.env.DB_USER || process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || ''
      };
    
    case 'sqlite':
      return {
        ...baseConfig,
        filename: process.env.DB_FILENAME || process.env.DB_PATH || './database.sqlite'
      };
    
    case 'mongodb':
      return {
        ...baseConfig,
        url: process.env.DB_URL || process.env.MONGODB_URL || 'mongodb://localhost:27017',
        database: process.env.DB_NAME || 'default'
      };
    
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}

export function validateConfig(config: DatabaseConfig): void {
  if (!config.type) {
    throw new Error('Database type is required');
  }

  switch (config.type) {
    case 'mysql':
    case 'postgresql':
      if (!config.host || !config.database) {
        throw new Error(`Host and database are required for ${config.type}`);
      }
      break;
    
    case 'sqlite':
      if (!config.filename) {
        throw new Error('Filename is required for SQLite');
      }
      break;
    
    case 'mongodb':
      if (!config.url || !config.database) {
        throw new Error('URL and database are required for MongoDB');
      }
      break;
  }
} 
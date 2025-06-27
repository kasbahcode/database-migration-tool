import { DatabaseConfig, DatabaseAdapter } from '../types';
import { MySQLAdapter } from './mysql';
import { PostgreSQLAdapter } from './postgresql';
import { SQLiteAdapter } from './sqlite';
import { MongoDBAdapter } from './mongodb';

export function createAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.type) {
    case 'mysql':
      return new MySQLAdapter(config);
    case 'postgresql':
      return new PostgreSQLAdapter(config);
    case 'sqlite':
      return new SQLiteAdapter(config);
    case 'mongodb':
      return new MongoDBAdapter(config);
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

export * from './base';
export * from './mysql';
export * from './postgresql';
export * from './sqlite';
export * from './mongodb'; 
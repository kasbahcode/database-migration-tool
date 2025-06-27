import { DatabaseAdapter, DatabaseConfig, Migration, Seed } from '../types';

export abstract class BaseAdapter implements DatabaseAdapter {
  protected config: DatabaseConfig;
  protected connection: any;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract createMigrationsTable(): Promise<void>;
  abstract createSeedsTable(): Promise<void>;
  abstract getMigrations(): Promise<Migration[]>;
  abstract getSeeds(): Promise<Seed[]>;
  abstract executeMigration(migration: Migration): Promise<void>;
  abstract rollbackMigration(migration: Migration): Promise<void>;
  abstract executeSeed(seed: Seed): Promise<void>;
  abstract markMigrationExecuted(migrationId: string): Promise<void>;
  abstract markMigrationRolledBack(migrationId: string): Promise<void>;
  abstract markSeedExecuted(seedId: string): Promise<void>;

  protected generateMigrationsTableQuery(): string {
    return `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        executed BOOLEAN DEFAULT TRUE
      )
    `;
  }

  protected generateSeedsTableQuery(): string {
    return `
      CREATE TABLE IF NOT EXISTS seeds (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        executed BOOLEAN DEFAULT TRUE
      )
    `;
  }
} 
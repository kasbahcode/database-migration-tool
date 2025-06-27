export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  filename?: string; // for SQLite
  url?: string; // for MongoDB
}

export interface Migration {
  id: string;
  name: string;
  filename: string;
  timestamp: Date;
  executed: boolean;
  up: string;
  down: string;
}

export interface Seed {
  id: string;
  name: string;
  filename: string;
  timestamp: Date;
  executed: boolean;
  data: string;
}

export interface MigrationState {
  version: string;
  migrations: Migration[];
  seeds: Seed[];
  lastExecuted?: string;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  createMigrationsTable(): Promise<void>;
  createSeedsTable(): Promise<void>;
  getMigrations(): Promise<Migration[]>;
  getSeeds(): Promise<Seed[]>;
  executeMigration(migration: Migration): Promise<void>;
  rollbackMigration(migration: Migration): Promise<void>;
  executeSeed(seed: Seed): Promise<void>;
  markMigrationExecuted(migrationId: string): Promise<void>;
  markMigrationRolledBack(migrationId: string): Promise<void>;
  markSeedExecuted(seedId: string): Promise<void>;
} 
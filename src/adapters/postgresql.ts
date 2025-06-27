import { Client } from 'pg';
import { BaseAdapter } from './base';
import { DatabaseConfig, Migration, Seed } from '../types';

export class PostgreSQLAdapter extends BaseAdapter {
  protected client!: Client;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
    }
  }

  async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        executed BOOLEAN DEFAULT TRUE
      )
    `;
    await this.client.query(query);
  }

  async createSeedsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS seeds (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        executed BOOLEAN DEFAULT TRUE
      )
    `;
    await this.client.query(query);
  }

  async getMigrations(): Promise<Migration[]> {
    const result = await this.client.query(
      'SELECT * FROM migrations ORDER BY executed_at ASC'
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      filename: row.filename,
      timestamp: row.executed_at,
      executed: row.executed,
      up: '',
      down: ''
    }));
  }

  async getSeeds(): Promise<Seed[]> {
    const result = await this.client.query(
      'SELECT * FROM seeds ORDER BY executed_at ASC'
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      filename: row.filename,
      timestamp: row.executed_at,
      executed: row.executed,
      data: ''
    }));
  }

  async executeMigration(migration: Migration): Promise<void> {
    await this.client.query(migration.up);
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    await this.client.query(migration.down);
  }

  async executeSeed(seed: Seed): Promise<void> {
    await this.client.query(seed.data);
  }

  async markMigrationExecuted(migrationId: string): Promise<void> {
    await this.client.query(
      'UPDATE migrations SET executed = TRUE, executed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [migrationId]
    );
  }

  async markMigrationRolledBack(migrationId: string): Promise<void> {
    await this.client.query(
      'UPDATE migrations SET executed = FALSE WHERE id = $1',
      [migrationId]
    );
  }

  async markSeedExecuted(seedId: string): Promise<void> {
    await this.client.query(
      'UPDATE seeds SET executed = TRUE, executed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [seedId]
    );
  }
} 
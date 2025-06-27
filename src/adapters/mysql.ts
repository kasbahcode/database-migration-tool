import mysql from 'mysql2/promise';
import { BaseAdapter } from './base';
import { DatabaseConfig, Migration, Seed } from '../types';

export class MySQLAdapter extends BaseAdapter {
  protected connection!: mysql.Connection;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async createMigrationsTable(): Promise<void> {
    const query = this.generateMigrationsTableQuery();
    await this.connection.execute(query);
  }

  async createSeedsTable(): Promise<void> {
    const query = this.generateSeedsTableQuery();
    await this.connection.execute(query);
  }

  async getMigrations(): Promise<Migration[]> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM migrations ORDER BY executed_at ASC'
    );
    
    return (rows as any[]).map(row => ({
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
    const [rows] = await this.connection.execute(
      'SELECT * FROM seeds ORDER BY executed_at ASC'
    );
    
    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      filename: row.filename,
      timestamp: row.executed_at,
      executed: row.executed,
      data: ''
    }));
  }

  async executeMigration(migration: Migration): Promise<void> {
    await this.connection.execute(migration.up);
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    await this.connection.execute(migration.down);
  }

  async executeSeed(seed: Seed): Promise<void> {
    await this.connection.execute(seed.data);
  }

  async markMigrationExecuted(migrationId: string): Promise<void> {
    await this.connection.execute(
      'UPDATE migrations SET executed = TRUE, executed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [migrationId]
    );
  }

  async markMigrationRolledBack(migrationId: string): Promise<void> {
    await this.connection.execute(
      'UPDATE migrations SET executed = FALSE WHERE id = ?',
      [migrationId]
    );
  }

  async markSeedExecuted(seedId: string): Promise<void> {
    await this.connection.execute(
      'UPDATE seeds SET executed = TRUE, executed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [seedId]
    );
  }
} 
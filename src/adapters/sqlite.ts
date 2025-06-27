import sqlite3 from 'sqlite3';
import { BaseAdapter } from './base';
import { DatabaseConfig, Migration, Seed } from '../types';

export class SQLiteAdapter extends BaseAdapter {
  private db!: sqlite3.Database;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.config.filename!, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            this.db = undefined as any;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  async createMigrationsTable(): Promise<void> {
    const query = this.generateMigrationsTableQuery();
    return this.runQuery(query);
  }

  async createSeedsTable(): Promise<void> {
    const query = this.generateSeedsTableQuery();
    return this.runQuery(query);
  }

  async getMigrations(): Promise<Migration[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM migrations ORDER BY executed_at ASC',
        (err, rows: any[]) => {
          if (err) reject(err);
          else {
            const migrations = rows.map(row => ({
              id: row.id,
              name: row.name,
              filename: row.filename,
              timestamp: new Date(row.executed_at),
              executed: Boolean(row.executed),
              up: '',
              down: ''
            }));
            resolve(migrations);
          }
        }
      );
    });
  }

  async getSeeds(): Promise<Seed[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM seeds ORDER BY executed_at ASC',
        (err, rows: any[]) => {
          if (err) reject(err);
          else {
            const seeds = rows.map(row => ({
              id: row.id,
              name: row.name,
              filename: row.filename,
              timestamp: new Date(row.executed_at),
              executed: Boolean(row.executed),
              data: ''
            }));
            resolve(seeds);
          }
        }
      );
    });
  }

  async executeMigration(migration: Migration): Promise<void> {
    // For SQLite, require the migration file and execute it
    const path = require('path');
    const migrationPath = path.resolve(process.cwd(), 'migrations', migration.filename);
    delete require.cache[migrationPath];
    const migrationModule = require(migrationPath);
    await migrationModule.up(this.getDbContext());
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    // For SQLite, require the migration file and execute rollback
    const path = require('path');
    const migrationPath = path.resolve(process.cwd(), 'migrations', migration.filename);
    delete require.cache[migrationPath];
    const migrationModule = require(migrationPath);
    await migrationModule.down(this.getDbContext());
  }

  async executeSeed(seed: Seed): Promise<void> {
    // For SQLite, require the seed file and execute it
    const path = require('path');
    const seedPath = path.resolve(process.cwd(), 'seeds', seed.filename);
    delete require.cache[seedPath];
    const seedModule = require(seedPath);
    await seedModule.seed(this.getDbContext());
  }

  async markMigrationExecuted(migrationId: string): Promise<void> {
    return this.runQuery(
      `INSERT OR REPLACE INTO migrations (id, name, filename, executed, executed_at) 
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [migrationId, migrationId.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_(.+)\.js$/, '$1'), migrationId]
    );
  }

  async markMigrationRolledBack(migrationId: string): Promise<void> {
    return this.runQuery(
      'UPDATE migrations SET executed = 0 WHERE id = ?',
      [migrationId]
    );
  }

  async markSeedExecuted(seedId: string): Promise<void> {
    return this.runQuery(
      `INSERT OR REPLACE INTO seeds (id, name, filename, executed, executed_at) 
       VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [seedId, seedId.replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_(.+)\.js$/, '$1'), seedId]
    );
  }

  private runQuery(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private getDbContext() {
    return {
      run: (sql: string, params: any[] = []) => this.runQuery(sql, params),
      query: (sql: string, params: any[] = []) => this.runQuery(sql, params)
    };
  }
} 
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import { DatabaseAdapter } from '../types';
import { Migration } from '../types';

export class MigrationService {
  private adapter: DatabaseAdapter;
  private migrationsDir: string;

  constructor(adapter: DatabaseAdapter, migrationsDir: string = './migrations') {
    this.adapter = adapter;
    this.migrationsDir = migrationsDir;
  }

  async initialize(): Promise<void> {
    await this.adapter.connect();
    await this.adapter.createMigrationsTable();
    await this.ensureMigrationsDirectory();
  }

  async createMigration(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.js`;
    const filepath = path.join(this.migrationsDir, filename);
    
    const template = this.getMigrationTemplate(name);
    await fs.writeFile(filepath, template);
    
    console.log(chalk.green(`Created migration: ${filename}`));
    return filename;
  }

  async runMigrations(): Promise<void> {
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log(chalk.yellow('No pending migrations'));
      return;
    }

    console.log(chalk.blue(`Running ${pendingMigrations.length} migration(s)`));
    
    for (const migration of pendingMigrations) {
      try {
        console.log(chalk.blue(`Running migration: ${migration.name}`));
        await this.adapter.executeMigration(migration);
        await this.adapter.markMigrationExecuted(migration.id);
        console.log(chalk.green(`✓ Migration ${migration.name} completed`));
      } catch (error) {
        console.error(chalk.red(`✗ Migration ${migration.name} failed:`), error);
        throw error;
      }
    }
  }

  async rollbackMigration(steps: number = 1): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log(chalk.yellow('No migrations to rollback'));
      return;
    }

    const migrationsToRollback = executedMigrations
      .slice(-steps)
      .reverse();

    console.log(chalk.blue(`Rolling back ${migrationsToRollback.length} migration(s)`));
    
    for (const migration of migrationsToRollback) {
      try {
        console.log(chalk.blue(`Rolling back migration: ${migration.name}`));
        await this.adapter.rollbackMigration(migration);
        await this.adapter.markMigrationRolledBack(migration.id);
        console.log(chalk.green(`✓ Migration ${migration.name} rolled back`));
      } catch (error) {
        console.error(chalk.red(`✗ Rollback of ${migration.name} failed:`), error);
        throw error;
      }
    }
  }

  async getMigrationStatus(): Promise<void> {
    const allMigrations = await this.getAllMigrations();
    const executedMigrations = await this.adapter.getMigrations();
    
    console.log(chalk.blue('\nMigration Status:'));
    console.log(chalk.blue('================='));
    
    for (const migration of allMigrations) {
      const isExecuted = executedMigrations.some(em => em.id === migration.id);
      const status = isExecuted ? chalk.green('✓ Executed') : chalk.yellow('✗ Pending');
      console.log(`${status} ${migration.name} (${migration.filename})`);
    }
  }

  private async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = await this.getAllMigrations();
    const executedMigrations = await this.adapter.getMigrations();
    
    return allMigrations.filter(migration => 
      !executedMigrations.some(em => em.id === migration.id)
    );
  }

  private async getExecutedMigrations(): Promise<Migration[]> {
    const allMigrations = await this.getAllMigrations();
    const executedMigrations = await this.adapter.getMigrations();
    
    return allMigrations.filter(migration => 
      executedMigrations.some(em => em.id === migration.id)
    );
  }

  private async getAllMigrations(): Promise<Migration[]> {
    const files = await fs.readdir(this.migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.js'))
      .sort();

    const migrations: Migration[] = [];
    
    for (const file of migrationFiles) {
      const filepath = path.join(this.migrationsDir, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const migration = this.parseMigrationFile(file, content);
      migrations.push(migration);
    }
    
    return migrations;
  }

  private parseMigrationFile(filename: string, content: string): Migration {
    const nameMatch = filename.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_(.+)\.js$/);
    const name = nameMatch ? nameMatch[1] : filename.replace('.js', '');
    
    // Extract up and down functions from the file content
    const upMatch = content.match(/exports\.up\s*=\s*async\s*\([^)]*\)\s*=>\s*{([\s\S]*?)exports\.down/);
    const downMatch = content.match(/exports\.down\s*=\s*async\s*\([^)]*\)\s*=>\s*{([\s\S]*?)$/);
    
    const upCode = upMatch ? upMatch[1].replace(/};[\s]*$/, '').trim() : '';
    const downCode = downMatch ? downMatch[1].replace(/};[\s]*$/, '').trim() : '';
    
    return {
      id: filename, 
      name,
      filename,
      timestamp: new Date(),
      executed: false,
      up: upCode,
      down: downCode
    };
  }

  private getMigrationTemplate(name: string): string {
    return `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */

exports.up = async (db) => {
  // Write your migration logic here
  // Example:
  // await db.query(\`
  //   CREATE TABLE users (
  //     id INT PRIMARY KEY AUTO_INCREMENT,
  //     email VARCHAR(255) UNIQUE NOT NULL,
  //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   )
  // \`);
};

exports.down = async (db) => {
  // Write your rollback logic here
  // Example:
  // await db.query('DROP TABLE users');
};
`;
  }

  private async ensureMigrationsDirectory(): Promise<void> {
    try {
      await fs.access(this.migrationsDir);
    } catch {
      await fs.mkdir(this.migrationsDir, { recursive: true });
      console.log(chalk.green(`Created migrations directory: ${this.migrationsDir}`));
    }
  }

  async cleanup(): Promise<void> {
    await this.adapter.disconnect();
  }
} 
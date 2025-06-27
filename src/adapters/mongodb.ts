import { MongoClient, Db, Collection } from 'mongodb';
import { BaseAdapter } from './base';
import { DatabaseConfig, Migration, Seed } from '../types';

export class MongoDBAdapter extends BaseAdapter {
  private client!: MongoClient;
  private db!: Db;
  private migrationsCollection!: Collection;
  private seedsCollection!: Collection;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    this.client = new MongoClient(this.config.url!);
    await this.client.connect();
    this.db = this.client.db(this.config.database);
    this.migrationsCollection = this.db.collection('migrations');
    this.seedsCollection = this.db.collection('seeds');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  async createMigrationsTable(): Promise<void> {
    // MongoDB collections are created automatically when first document is inserted
    await this.migrationsCollection.createIndex({ id: 1 }, { unique: true });
  }

  async createSeedsTable(): Promise<void> {
    // MongoDB collections are created automatically when first document is inserted
    await this.seedsCollection.createIndex({ id: 1 }, { unique: true });
  }

  async getMigrations(): Promise<Migration[]> {
    const docs = await this.migrationsCollection
      .find({})
      .sort({ executed_at: 1 })
      .toArray();
    
    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      filename: doc.filename,
      timestamp: doc.executed_at,
      executed: doc.executed,
      up: '',
      down: ''
    }));
  }

  async getSeeds(): Promise<Seed[]> {
    const docs = await this.seedsCollection
      .find({})
      .sort({ executed_at: 1 })
      .toArray();
    
    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      filename: doc.filename,
      timestamp: doc.executed_at,
      executed: doc.executed,
      data: ''
    }));
  }

  async executeMigration(migration: Migration): Promise<void> {
    // For MongoDB, we execute the migration as JavaScript code
    const migrationFunction = new Function('db', migration.up);
    await migrationFunction(this.db);
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    // For MongoDB, we execute the rollback as JavaScript code
    const rollbackFunction = new Function('db', migration.down);
    await rollbackFunction(this.db);
  }

  async executeSeed(seed: Seed): Promise<void> {
    // For MongoDB, we execute the seed as JavaScript code
    const seedFunction = new Function('db', seed.data);
    await seedFunction(this.db);
  }

  async markMigrationExecuted(migrationId: string): Promise<void> {
    await this.migrationsCollection.updateOne(
      { id: migrationId },
      { 
        $set: { 
          executed: true, 
          executed_at: new Date() 
        } 
      },
      { upsert: true }
    );
  }

  async markMigrationRolledBack(migrationId: string): Promise<void> {
    await this.migrationsCollection.updateOne(
      { id: migrationId },
      { $set: { executed: false } }
    );
  }

  async markSeedExecuted(seedId: string): Promise<void> {
    await this.seedsCollection.updateOne(
      { id: seedId },
      { 
        $set: { 
          executed: true, 
          executed_at: new Date() 
        } 
      },
      { upsert: true }
    );
  }
} 
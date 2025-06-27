import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import { DatabaseAdapter, Seed } from '../types';

export class SeedService {
  private adapter: DatabaseAdapter;
  private seedsDir: string;

  constructor(adapter: DatabaseAdapter, seedsDir: string = './seeds') {
    this.adapter = adapter;
    this.seedsDir = seedsDir;
  }

  async initialize(): Promise<void> {
    await this.adapter.connect();
    await this.adapter.createSeedsTable();
    await this.ensureSeedsDirectory();
  }

  async createSeed(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${name}.js`;
    const filepath = path.join(this.seedsDir, filename);
    
    const template = this.getSeedTemplate(name);
    await fs.writeFile(filepath, template);
    
    console.log(chalk.green(`Created seed: ${filename}`));
    return filename;
  }

  async runSeeds(): Promise<void> {
    const pendingSeeds = await this.getPendingSeeds();
    
    if (pendingSeeds.length === 0) {
      console.log(chalk.yellow('No pending seeds'));
      return;
    }

    console.log(chalk.blue(`Running ${pendingSeeds.length} seed(s)`));
    
    for (const seed of pendingSeeds) {
      try {
        console.log(chalk.blue(`Running seed: ${seed.name}`));
        await this.adapter.executeSeed(seed);
        await this.adapter.markSeedExecuted(seed.id);
        console.log(chalk.green(`✓ Seed ${seed.name} completed`));
      } catch (error) {
        console.error(chalk.red(`✗ Seed ${seed.name} failed:`), error);
        throw error;
      }
    }
  }

  async runSpecificSeed(seedName: string): Promise<void> {
    const allSeeds = await this.getAllSeeds();
    const seed = allSeeds.find(s => s.name === seedName);
    
    if (!seed) {
      console.error(chalk.red(`Seed not found: ${seedName}`));
      return;
    }

    try {
      console.log(chalk.blue(`Running seed: ${seed.name}`));
      await this.adapter.executeSeed(seed);
      await this.adapter.markSeedExecuted(seed.id);
      console.log(chalk.green(`✓ Seed ${seed.name} completed`));
    } catch (error) {
      console.error(chalk.red(`✗ Seed ${seed.name} failed:`), error);
      throw error;
    }
  }

  async getSeedStatus(): Promise<void> {
    const allSeeds = await this.getAllSeeds();
    const executedSeeds = await this.adapter.getSeeds();
    
    console.log(chalk.blue('\nSeed Status:'));
    console.log(chalk.blue('============'));
    
    for (const seed of allSeeds) {
      const isExecuted = executedSeeds.some(es => es.id === seed.id);
      const status = isExecuted ? chalk.green('✓ Executed') : chalk.yellow('✗ Pending');
      console.log(`${status} ${seed.name} (${seed.filename})`);
    }
  }

  private async getPendingSeeds(): Promise<Seed[]> {
    const allSeeds = await this.getAllSeeds();
    const executedSeeds = await this.adapter.getSeeds();
    
    return allSeeds.filter(seed => 
      !executedSeeds.some(es => es.id === seed.id)
    );
  }

  private async getAllSeeds(): Promise<Seed[]> {
    const files = await fs.readdir(this.seedsDir);
    const seedFiles = files
      .filter(file => file.endsWith('.js'))
      .sort();

    const seeds: Seed[] = [];
    
    for (const file of seedFiles) {
      const filepath = path.join(this.seedsDir, file);
      const content = await fs.readFile(filepath, 'utf-8');
      const seed = this.parseSeedFile(file, content);
      seeds.push(seed);
    }
    
    return seeds;
  }

  private parseSeedFile(filename: string, content: string): Seed {
    const nameMatch = filename.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_(.+)\.js$/);
    const name = nameMatch ? nameMatch[1] : filename.replace('.js', '');
    
    // Extract seed function from the file content
    const seedMatch = content.match(/exports\.seed\s*=\s*async\s*\([^)]*\)\s*=>\s*{([\s\S]*?)$/);
    const seedCode = seedMatch ? seedMatch[1].replace(/};[\s]*$/, '').trim() : '';
    
    return {
      id: filename, // Use filename as ID for consistency
      name,
      filename,
      timestamp: new Date(),
      executed: false,
      data: seedCode
    };
  }

  private getSeedTemplate(name: string): string {
    return `/**
 * Seed: ${name}
 * Created: ${new Date().toISOString()}
 */

exports.seed = async (db) => {
  // Write your seed logic here
  // Example:
  // await db.query(\`
  //   INSERT INTO users (email) VALUES 
  //   ('admin@example.com'),
  //   ('user@example.com')
  // \`);
};
`;
  }

  private async ensureSeedsDirectory(): Promise<void> {
    try {
      await fs.access(this.seedsDir);
    } catch {
      await fs.mkdir(this.seedsDir, { recursive: true });
      console.log(chalk.green(`Created seeds directory: ${this.seedsDir}`));
    }
  }

  async cleanup(): Promise<void> {
    await this.adapter.disconnect();
  }
} 
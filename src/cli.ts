#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { getDatabaseConfig, validateConfig } from './config/database';
import { createAdapter } from './adapters';
import { MigrationService } from './services/migrationService';
import { SeedService } from './services/seedService';

const program = new Command();

program
  .name('dbmigrate')
  .description('Cross-platform database migration and seeding tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize migration environment')
  .action(async () => {
    try {
      console.log(chalk.blue('Initializing migration environment...'));
      
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const migrationService = new MigrationService(adapter);
      const seedService = new SeedService(adapter);
      
      await migrationService.initialize();
      await seedService.initialize();
      
      console.log(chalk.green('✓ Migration environment initialized'));
      
      await migrationService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error initializing migration environment:'), error);
      process.exit(1);
    }
  });

program
  .command('create <name>')
  .description('Create a new migration')
  .action(async (name: string) => {
    try {
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const migrationService = new MigrationService(adapter);
      
      await migrationService.initialize();
      await migrationService.createMigration(name);
      await migrationService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error creating migration:'), error);
      process.exit(1);
    }
  });

program
  .command('up')
  .description('Run pending migrations')
  .action(async () => {
    try {
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const migrationService = new MigrationService(adapter);
      
      await migrationService.initialize();
      await migrationService.runMigrations();
      await migrationService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error running migrations:'), error);
      process.exit(1);
    }
  });

program
  .command('down')
  .description('Rollback migrations')
  .option('-s, --steps <number>', 'Number of migrations to rollback', '1')
  .action(async (options) => {
    try {
      const steps = parseInt(options.steps);
      
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to rollback ${steps} migration(s)?`,
          default: false
        }
      ]);
      
      if (!answer.confirm) {
        console.log(chalk.yellow('Rollback cancelled'));
        return;
      }
      
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const migrationService = new MigrationService(adapter);
      
      await migrationService.initialize();
      await migrationService.rollbackMigration(steps);
      await migrationService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error rolling back migrations:'), error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const migrationService = new MigrationService(adapter);
      
      await migrationService.initialize();
      await migrationService.getMigrationStatus();
      await migrationService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error getting migration status:'), error);
      process.exit(1);
    }
  });

program
  .command('seed:create <name>')
  .description('Create a new seed')
  .action(async (name: string) => {
    try {
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const seedService = new SeedService(adapter);
      
      await seedService.initialize();
      await seedService.createSeed(name);
      await seedService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error creating seed:'), error);
      process.exit(1);
    }
  });

program
  .command('seed:run')
  .description('Run all pending seeds')
  .option('-n, --name <name>', 'Run specific seed by name')
  .action(async (options) => {
    try {
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const seedService = new SeedService(adapter);
      
      await seedService.initialize();
      
      if (options.name) {
        await seedService.runSpecificSeed(options.name);
      } else {
        await seedService.runSeeds();
      }
      
      await seedService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error running seeds:'), error);
      process.exit(1);
    }
  });

program
  .command('seed:status')
  .description('Show seed status')
  .action(async () => {
    try {
      const config = getDatabaseConfig();
      validateConfig(config);
      
      const adapter = createAdapter(config);
      const seedService = new SeedService(adapter);
      
      await seedService.initialize();
      await seedService.getSeedStatus();
      await seedService.cleanup();
    } catch (error) {
      console.error(chalk.red('Error getting seed status:'), error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current database configuration')
  .action(() => {
    try {
      const config = getDatabaseConfig();
      console.log(chalk.blue('\nDatabase Configuration:'));
      console.log(chalk.blue('======================='));
      console.log(`Type: ${config.type}`);
      console.log(`Database: ${config.database}`);
      
      if (config.host) console.log(`Host: ${config.host}`);
      if (config.port) console.log(`Port: ${config.port}`);
      if (config.username) console.log(`Username: ${config.username}`);
      if (config.filename) console.log(`Filename: ${config.filename}`);
      if (config.url) console.log(`URL: ${config.url}`);
      
    } catch (error) {
      console.error(chalk.red('Error getting configuration:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 
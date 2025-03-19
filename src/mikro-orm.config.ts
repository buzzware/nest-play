import { defineConfig } from '@mikro-orm/postgresql';
import { Supplier } from './Supplier/Supplier.entity';
import { Product } from './Product/Product.entity';
import { Order } from './Order/Order.entity';
import { OrderItem } from './Order/OrderItem.entity';
import { TSMigrationGenerator } from '@mikro-orm/migrations';

// Environment detection
const isTest = process.env.NODE_ENV === 'test';

export default defineConfig({

  // Database connection settings
  host: 'localhost',
  port: 5432,
  user: 'gary', // Using the system user that has PostgreSQL access
  password: '', // No password if PostgreSQL is set up with trust authentication for local connections

  // Use different database names for production and test
  dbName: isTest ? 'nest_play_t' : 'nest_play',

  // Entity configuration
  // entities: [Supplier, Product, Order, OrderItem],
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  // Migration configuration
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: './src/database/migrations', // path to the folder with migrations
    pathTs: './src/database/migrations', // path to the folder with TS migrations
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: false, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: false, // save snapshot of the database after migration is executed
    emit: 'ts', // migration generation mode
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },

  // Additional settings
  implicitTransactions: false,
  debug: process.env.NODE_ENV !== 'production', // Only enable debug in non-production environments
  allowGlobalContext: isTest,
  autoJoinOneToOneOwner: true,
});

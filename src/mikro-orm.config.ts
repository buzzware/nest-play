import { defineConfig } from '@mikro-orm/sqlite';
import { Supplier } from './Supplier/Supplier.entity';
import { Product } from './Product/Product.entity';
import { Order } from './Order/Order.entity';
import { OrderItem } from './Order/OrderItem.entity';
import { TSMigrationGenerator } from '@mikro-orm/migrations';

export default defineConfig({
  entities: [Supplier, Product, Order, OrderItem],
  dbName: 'nest-play.db',
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: './src/database/migrations', // path to the folder with migrations
    pathTs: './src/database/migrations', // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: true, // save snapshot of the database after migration is executed
    emit: 'ts', // migration generation mode
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },
});

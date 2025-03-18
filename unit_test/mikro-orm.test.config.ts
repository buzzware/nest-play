import { defineConfig } from '@mikro-orm/sqlite';
import { Supplier } from '../src/Supplier/Supplier.entity';
import { Product } from '../src/Product/Product.entity';
import { Order } from '../src/Order/Order.entity';
import { OrderItem } from '../src/Order/OrderItem.entity';
import { TSMigrationGenerator } from '@mikro-orm/migrations';
import * as path from 'path';

export default defineConfig({
  entities: [Supplier, Product, Order, OrderItem],
  dbName: ':memory:', //'nest-play-test.db',
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: path.join(process.cwd(), 'src/database/migrations'),
    pathTs: path.join(process.cwd(), 'src/database/migrations'),
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: true,
    emit: 'ts',
    generator: TSMigrationGenerator,
  },
  // Ensure SQLite allows foreign keys
  driverOptions: {
    connection: {
      filename: ':memory:'
    }
  },
  // Disable debug logging
  debug: true,
  // Disable automatic schema creation - we'll use migrations
  allowGlobalContext: true,
  // Ensure we can connect to the database
  autoJoinOneToOneOwner: true,
});

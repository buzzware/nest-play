import { AbstractSqlConnection, AnyEntity, MikroORM } from '@mikro-orm/postgresql';
import { DatabaseSeeder } from '../src/database/seeders/DatabaseSeeder';
import { PostgreSqlMikroORM } from '@mikro-orm/postgresql/PostgreSqlMikroORM';
import { EntityName, MikroOrmModule } from '@mikro-orm/nestjs';
import { Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';

async function sqliteDeleteAllTables(connection: AbstractSqlConnection) {
  // 1. First, get a list of all tables in the database
  const tables = await connection.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%'
  `);

  // 2. Disable foreign key constraints temporarily
  await connection.execute('PRAGMA foreign_keys = OFF');

  // 3. Drop each table including the migration tables
  for (const tableRow of tables) {
    const tableName = tableRow.name;
    await connection.execute(`DROP TABLE IF EXISTS "${tableName}"`);
  }

  // 4. Re-enable foreign key constraints
  await connection.execute('PRAGMA foreign_keys = ON');
}

async function postgresqlDeleteAllTables(connection: AbstractSqlConnection) {
  const tables = await connection.execute(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
  `);
  await connection.execute('SET session_replication_role = replica');
  try {
    for (const row of tables) {
      const tableName = row.tablename;
      await connection.execute(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }
  } finally {
    await connection.execute('SET session_replication_role = DEFAULT');
  }
}

export async function setupTestModule(config, entities: EntityName<AnyEntity>[], controllers: Type<any>[]) {
  const module = await Test.createTestingModule({
    imports: [
      MikroOrmModule.forRoot(config),
      MikroOrmModule.forFeature({
        entities,
      }),
    ],
    controllers,
  }).compile();
  return module;
}

export async function migrateAndSeedDatabase(orm: MikroORM) {
  const connection = orm.em.getConnection();
  await postgresqlDeleteAllTables(connection);
  const migrator = orm.getMigrator();
  await migrator.up();
  await orm.getSeeder().seed(DatabaseSeeder);
}

export async function beginTestTransaction(orm: PostgreSqlMikroORM, parent_trx?) {
  const trx = await orm.em.getConnection().begin(parent_trx && { ctx: parent_trx });
  orm.em.setTransactionContext(trx);
  return trx;
}

export async function endTestTransaction(orm: MikroORM, parent_trx?: any) {
  const test_trx = orm.em.getTransactionContext();
  await orm.em.getConnection().rollback(test_trx);
  if (parent_trx)
    orm.em.setTransactionContext(parent_trx);
}

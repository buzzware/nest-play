import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../src/Product/Product.controller';
import { Product } from '../src/Product/Product.entity';
import { ProductRepository } from '../src/Product/Product.repository';
import { AbstractSqlConnection, AnyEntity, EntityManager, MikroORM, Transaction } from '@mikro-orm/postgresql';
import { EntityName, getRepositoryToken, MikroOrmModule } from '@mikro-orm/nestjs';
import { NotFoundException, Type } from '@nestjs/common';
import testConfig from '../src/mikro-orm.config';
import { Supplier } from '../src/Supplier/Supplier.entity';
import { DatabaseSeeder } from '../src/database/seeders/DatabaseSeeder';
import { PostgreSqlMikroORM } from '@mikro-orm/postgresql/PostgreSqlMikroORM';

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

async function setupTestModule(config, entities: EntityName<AnyEntity>[], controllers: Type<any>[]) {
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

async function migrateAndSeedDatabase(orm: MikroORM) {
  const connection = orm.em.getConnection();
  await postgresqlDeleteAllTables(connection);
  const migrator = orm.getMigrator();
  await migrator.up();
  await orm.getSeeder().seed(DatabaseSeeder);
}

async function beginTestTransaction(orm: PostgreSqlMikroORM, parent_trx?) {
  const trx = await orm.em.getConnection().begin(parent_trx && {ctx: parent_trx});
  orm.em.setTransactionContext(trx);
  return trx;
}

async function endTestTransaction(orm: MikroORM, parent_trx?: any) {
  const test_trx = orm.em.getTransactionContext();
  await orm.em.getConnection().rollback(test_trx);
  if (parent_trx)
    orm.em.setTransactionContext(parent_trx);
}

describe('ProductController', () => {
  let productController: ProductController;
  let productRepository: ProductRepository;
  let orm: MikroORM;
  let module: TestingModule;
  //let main_trx: Transaction;

  beforeAll(async () => {
    module  = await setupTestModule(testConfig,[Product],[ProductController]);
    orm = module.get(MikroORM);
    await migrateAndSeedDatabase(orm);

    productRepository = module.get<ProductRepository>(getRepositoryToken(Product));
    productController = module.get<ProductController>(ProductController);

    //main_trx = await beginTestTransaction(orm);
  });

  afterAll(async () => {
    //await endTestTransaction(orm);
    await orm.close(true);
    await module.close();
  });

  beforeEach(async () => {
    const test_trx = await beginTestTransaction(orm);
  });

  afterEach(async () => {
    await endTestTransaction(orm);
    orm.em.clear();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = await productController.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBeDefined();
      expect(result[0].supplier).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a product when it exists', async () => {
      const products = await productRepository.findAll();
      const productId = products[0].id;

      const result = await productController.findOne(productId);

      expect(result).toBeDefined();
      expect(result.id).toBe(productId);
      expect(result.supplier).toBeDefined();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const nonExistentId = 9999;

      await expect(productController.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const suppliers = await orm.em.find(Supplier, {});
      const supplierId = suppliers[0].id;

      const productData = {
        name: 'New Test Product',
        description: 'A brand new test product',
        price: 49.99,
        sku: 'NTP-001',
        stockQuantity: 25,
        supplier: suppliers[0]
      } as Product;

      // Act
      const result = await productController.create(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.price).toBe(productData.price);
      expect(result.sku).toBe(productData.sku);

      // Verify the product was added to the database
      const savedProduct = await productRepository.findOne(result.id);
      expect(savedProduct).toBeDefined();
      expect(savedProduct).not.toBeNull();
      if (savedProduct) {
        expect(savedProduct.name).toBe(productData.name);
      }
    });
  });

  describe('update', () => {

    it('should update and return the product when it exists', async () => {
      const productNames = (await productRepository.findAll()).map(p => p.name);
      expect(productNames).not.toContain('Updated Test Product');

      const products = await productRepository.findAll({orderBy: {id: 'ASC'}});
      const productToUpdate = products[0];
      expect(productToUpdate.name).toBe('Test Product 1');
      const updateData = {
        name: 'Updated Test Product',
        price: 59.99,
        description: 'This product has been updated'
      };

      const result = await productController.update(productToUpdate.id, updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(productToUpdate.id);
      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe(updateData.price);
      expect(result.description).toBe(updateData.description);

      const updatedProduct = await productRepository.findOne(productToUpdate.id);
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct).not.toBeNull();
      if (updatedProduct) {
        expect(updatedProduct.name).toBe(updateData.name);
        expect(updatedProduct.price).toBe(updateData.price);
      }
    });

    it('should be wrapped in a transaction', async ()=> {
      const productNames = (await productRepository.findAll()).map(p => p.name);
      expect(productNames).not.toContain('Updated Test Product');
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const nonExistentId = 9999;
      const updateData = { name: 'Updated Product' };

      await expect(productController.update(nonExistentId, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the product and return confirmation when it exists', async () => {
      const products = await productRepository.findAll();
      const productToDelete = products[0];

      const result = await productController.remove(productToDelete.id);

      expect(result).toEqual({ deleted: true });

      const deletedProduct = await productRepository.findOne(productToDelete.id);
      expect(deletedProduct).toBeNull();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const nonExistentId = 9999;

      await expect(productController.remove(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });
});

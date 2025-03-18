import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../src/Product/Product.controller';
import { Product } from '../src/Product/Product.entity';
import { ProductRepository } from '../src/Product/Product.repository';
import { EntityManager, MikroORM } from '@mikro-orm/sqlite';
import { getRepositoryToken, MikroOrmModule } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import testConfig from './mikro-orm.test.config';
import { Migrator } from '@mikro-orm/migrations';
import { Supplier } from '../src/Supplier/Supplier.entity';
import { DatabaseSeeder } from '../src/database/seeders/DatabaseSeeder';


async function sqliteDeleteAllTables(connection) {
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

describe('ProductController', () => {
  let productController: ProductController;
  let productRepository: ProductRepository;
  //let entityManager: EntityManager;
  let orm: MikroORM;
  let migrator: Migrator;
  let module: TestingModule;

  // Set up the test module once before running any tests
  // beforeAll(async () => {
  //   // Initialize MikroORM with test configuration
  //   orm = await MikroORM.init(testConfig);
  //
  //   migrator = orm.getMigrator();
  //   await migrator.up();
  //
  //   // Seed the database with test data and explicitly flush to ensure it's saved
  //   //const rootEm = orm.em.fork();
  //   await orm.getSeeder().seed(DatabaseSeeder);
  //   //await rootEm.flush();
  //
  //   // Set up the test module with real database connections
  //   const module: TestingModule = await Test.createTestingModule({
  //     imports: [
  //       MikroOrmModule.forRoot(testConfig),
  //       MikroOrmModule.forFeature({
  //         entities: [Product, Supplier],
  //       }),
  //     ],
  //     controllers: [ProductController],
  //   }).compile();
  //
  //   // Get the controller and repository from the test module
  //   productController = module.get<ProductController>(ProductController);
  //   productRepository = module.get<ProductRepository>(getRepositoryToken(Product));
  // });
  //
  // // Clean up after all tests are done
  // afterAll(async () => {
  //   // try {
  //     // Ensure any open transaction is rolled back
  //     // if (entityManager && entityManager.isInTransaction()) {
  //     //   await entityManager.rollback();
  //     // }
  //
  //     // Get the underlying connection
  //     //const connection = orm.em.getConnection();
  //
  //     // Clear entity manager cache
  //     orm.em.clear();
  //
  //     // Execute PRAGMA to release locks
  //     // await connection.execute('PRAGMA busy_timeout = 5000');
  //     // await connection.execute('PRAGMA journal_mode = DELETE');
  //     // await connection.execute('PRAGMA locking_mode = NORMAL');
  //
  //     // Close the ORM connection and force all connections to close
  //     await orm.close(true);
  //   // } catch (error) {
  //   //   console.error('Error during database cleanup:', error);
  //   // }
  // });
  //
  // // Set up fresh database state before each test
  // beforeEach(async () => {
  //   //entityManager = orm.em.fork();
  //   await orm.em.begin();
  // });
  //
  // // Roll back the transaction after each test to keep the database clean
  // afterEach(async () => {
  //   // try {
  //     if (orm.em.isInTransaction()) {
  //       await orm.em.rollback();
  //     }
  //
  //     // Clear entity manager cache
  //     orm.em.clear();
  //
  //     // Get a fresh entity manager for the next test
  //     //entityManager = orm.em.fork();
  //   // } catch (error) {
  //   //   console.error('Error during test cleanup:', error);
  //   // }
  // });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      // Act
      const result = await productController.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBeDefined();
      expect(result[0].supplier).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a product when it exists', async () => {
      // Arrange - get a product ID from the seeded data
      const products = await productRepository.findAll();
      const productId = products[0].id;

      // Act
      const result = await productController.findOne(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(productId);
      expect(result.supplier).toBeDefined();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const nonExistentId = 9999;

      // Act & Assert
      await expect(productController.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  beforeAll(async () => {
    orm = await MikroORM.init(testConfig);
  });

  afterAll(async () => {
    await orm.close(true);
  });

  beforeEach(async () => {
    const connection = orm.em.getConnection();
    await sqliteDeleteAllTables(connection);
    migrator = orm.getMigrator();
    await migrator.up();
    await orm.getSeeder().seed(DatabaseSeeder);

    // Set up the test module with real database connections
    module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(testConfig),
        MikroOrmModule.forFeature({
          entities: [Product, Supplier],
        }),
      ],
      controllers: [ProductController],
    }).compile();

    productRepository = module.get<ProductRepository>(getRepositoryToken(Product));
    productController = module.get<ProductController>(ProductController);
  });

  afterEach(async () => {

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
      // Arrange - get a product ID from the seeded data
      const products = await productRepository.findAll();
      const productToUpdate = products[0];
      const updateData = {
        name: 'Updated Test Product',
        price: 59.99,
        description: 'This product has been updated'
      };

      // Act
      const result = await productController.update(productToUpdate.id, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(productToUpdate.id);
      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe(updateData.price);
      expect(result.description).toBe(updateData.description);

      // Verify the database was updated
      const updatedProduct = await productRepository.findOne(productToUpdate.id);
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct).not.toBeNull();
      if (updatedProduct) {
        expect(updatedProduct.name).toBe(updateData.name);
        expect(updatedProduct.price).toBe(updateData.price);
      }
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const nonExistentId = 9999;
      const updateData = { name: 'Updated Product' };

      // Act & Assert
      await expect(productController.update(nonExistentId, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the product and return confirmation when it exists', async () => {
      // Arrange - get a product ID from the seeded data
      const products = await productRepository.findAll();
      const productToDelete = products[0];

      // Act
      const result = await productController.remove(productToDelete.id);

      // Assert
      expect(result).toEqual({ deleted: true });

      // Verify the product was removed from the database
      const deletedProduct = await productRepository.findOne(productToDelete.id);
      expect(deletedProduct).toBeNull();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const nonExistentId = 9999;

      // Act & Assert
      await expect(productController.remove(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });
});

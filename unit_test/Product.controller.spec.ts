import { TestingModule } from '@nestjs/testing';
import { ProductController } from '../src/Product/Product.controller';
import { Product } from '../src/Product/Product.entity';
import { ProductRepository } from '../src/Product/Product.repository';
import { MikroORM } from '@mikro-orm/postgresql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import testConfig from '../src/mikro-orm.config';
import { Supplier } from '../src/Supplier/Supplier.entity';
import { beginTestTransaction, endTestTransaction, migrateAndSeedDatabase, setupTestModule } from './test_utils';

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
    //const test_trx = await beginTestTransaction(orm,main_trx);
    const test_trx = await beginTestTransaction(orm);
  });

  afterEach(async () => {
    //await endTestTransaction(orm, main_trx);
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

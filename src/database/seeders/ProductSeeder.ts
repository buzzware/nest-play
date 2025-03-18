import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Product } from '../../Product/Product.entity';
import { Supplier } from '../../Supplier/Supplier.entity';

export class ProductSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create a test supplier
    const supplier = em.create(Supplier, {
      name: 'Test Supplier',
      email: 'supplier@test.com',
      phone: '123-456-7890',
      address: '123 Test St, Test City, TC 12345',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.persistAndFlush(supplier);

    // Create test products
    const products = [
      em.create(Product, {
        name: 'Test Product 1',
        description: 'Description for test product 1',
        price: 19.99,
        sku: 'TP-001',
        stockQuantity: 100,
        supplier,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      em.create(Product, {
        name: 'Test Product 2',
        description: 'Description for test product 2',
        price: 29.99,
        sku: 'TP-002',
        stockQuantity: 50,
        supplier,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      em.create(Product, {
        name: 'Test Product 3',
        description: 'Description for test product 3',
        price: 39.99,
        sku: 'TP-003',
        stockQuantity: 75,
        supplier,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];
    await em.persistAndFlush(products);
  }
}

// import { Seeder } from '@mikro-orm/seeder';
// import { EntityManager } from '@mikro-orm/sqlite';
// import { Supplier } from '../../Supplier/Supplier.entity';
// import { Product } from '../../Product/Product.entity';
// import { Order, OrderStatus } from '../../Order/Order.entity';
// import { OrderItem } from '../../Order/OrderItem.entity';
//
// export class FirstSeeder extends Seeder {
//
//   async run(em: EntityManager): Promise<void> {
//
//     // Create suppliers
//     const supplier1 = em.create(Supplier, {
//       name: 'Tech Supplies Co',
//       email: 'contact@techsupplies.com',
//       phone: '555-0123',
//       address: '123 Tech Street, Silicon Valley, CA',
//     },{ partial: true });
//
//     const supplier2 = em.create(Supplier, {
//       name: 'Electronics Wholesale Ltd',
//       email: 'sales@ewholesale.com',
//       phone: '555-0124',
//       address: '456 Electronics Ave, New York, NY',
//     },{ partial: true });
//
//     await em.persistAndFlush([supplier1, supplier2]);
//
//     const product1 = em.create(Product, {
//       name: 'Laptop Pro X1',
//       description: 'High-performance laptop for professionals',
//       price: 1299.99,
//       sku: 'LAP-PRO-X1',
//       stockQuantity: 50,
//       supplier: supplier1,
//     },{ partial: true });
//
//     const product2 = em.create(Product, {
//       name: 'Wireless Mouse M1',
//       description: 'Ergonomic wireless mouse',
//       price: 49.99,
//       sku: 'MOU-WL-M1',
//       stockQuantity: 200,
//       supplier: supplier1,
//     },{ partial: true });
//
//     const product3 = em.create(Product, {
//       name: '4K Monitor 27"',
//       description: 'Professional 4K monitor',
//       price: 499.99,
//       sku: 'MON-4K-27',
//       stockQuantity: 30,
//       supplier: supplier2,
//     },{ partial: true });
//
//     await em.persistAndFlush([product1, product2, product3]);
//
//     // Create orders
//     const order1 = em.create(Order, {
//       customerName: 'John Doe',
//       customerEmail: 'john@example.com',
//       shippingAddress: '789 Customer St, Boston, MA',
//       status: OrderStatus.PROCESSING,
//       totalAmount: 1349.98,
//     },{ partial: true });
//
//     const order2 = em.create(Order, {
//       customerName: 'Jane Smith',
//       customerEmail: 'jane@example.com',
//       shippingAddress: '321 Client Ave, Miami, FL',
//       status: OrderStatus.PENDING,
//       totalAmount: 549.98,
//     },{ partial: true });
//
//     await em.persistAndFlush([order1, order2]);
//
//     // Create order items
//     const orderItem1 = em.create(OrderItem, {
//       order: order1,
//       product: product1,
//       quantity: 1,
//       unitPrice: 1299.99,
//       totalPrice: 1299.99,
//     },{ partial: true });
//
//     const orderItem2 = em.create(OrderItem, {
//       order: order1,
//       product: product2,
//       quantity: 1,
//       unitPrice: 49.99,
//       totalPrice: 49.99,
//     },{ partial: true });
//
//     const orderItem3 = em.create(OrderItem, {
//       order: order2,
//       product: product3,
//       quantity: 1,
//       unitPrice: 499.99,
//       totalPrice: 499.99,
//     },{ partial: true });
//
//     const orderItem4 = em.create(OrderItem, {
//       order: order2,
//       product: product2,
//       quantity: 1,
//       unitPrice: 49.99,
//       totalPrice: 49.99,
//     },{ partial: true });
//
//     await em.persistAndFlush([orderItem1, orderItem2, orderItem3, orderItem4]);
//   }
// }

import { defineConfig } from '@mikro-orm/sqlite';
import { Supplier } from './Supplier/Supplier.entity';
import { Product } from './Product/Product.entity';
import { Order } from './Order/Order.entity';
import { OrderItem } from './Order/OrderItem.entity';

export default defineConfig({
  entities: [Supplier, Product, Order, OrderItem],
  dbName: 'nest-play-db',
});

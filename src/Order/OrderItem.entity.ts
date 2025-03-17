import { PrimaryKey, Property, ManyToOne, Entity, EntityRepositoryType } from '@mikro-orm/core';
import { Order } from './Order.entity';
import { Product } from '../Product/Product.entity';
import { OrderItemRepository } from './OrderItem.repository';

@Entity({ repository: () => OrderItemRepository })
export class OrderItem {
  [EntityRepositoryType]?: OrderItemRepository;

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  quantity!: number;

  @Property()
  unitPrice!: number;

  @Property()
  totalPrice!: number;

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt = new Date();
}

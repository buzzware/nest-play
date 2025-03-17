import { PrimaryKey, Property, Collection, OneToMany, Enum, Entity, EntityRepositoryType } from '@mikro-orm/core';
import { OrderItem } from './OrderItem.entity';
import { OrderRepository } from './Order.repository';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

@Entity({ repository: () => OrderRepository })
export class Order {
  [EntityRepositoryType]?: OrderRepository;

  @PrimaryKey()
  id!: number;

  @Property()
  customerName!: string;

  @Property()
  customerEmail!: string;

  @Property()
  shippingAddress!: string;

  @Enum(() => OrderStatus)
  status = OrderStatus.PENDING;

  @Property()
  totalAmount!: number;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems = new Collection<OrderItem>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt = new Date();
}

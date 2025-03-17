import { Entity, PrimaryKey, Property, ManyToOne, Collection, OneToMany, EntityRepositoryType } from '@mikro-orm/core';
import { Supplier } from '../Supplier/Supplier.entity';
import { OrderItem } from '../Order/OrderItem.entity';
import { ProductRepository } from './Product.repository';

@Entity({ repository: () => ProductRepository })
export class Product {
  [EntityRepositoryType]?: ProductRepository;

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  description?: string;

  @Property()
  price!: number;

  @Property()
  sku!: string;

  @Property()
  stockQuantity!: number;

  @ManyToOne(() => Supplier)
  supplier!: Supplier;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems = new Collection<OrderItem>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt = new Date();
}

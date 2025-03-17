import { PrimaryKey, Property, Collection, OneToMany, Entity, EntityRepositoryType } from '@mikro-orm/core';
import { Product } from '../Product/Product.entity';
import { SupplierRepository } from './Supplier.repository';

@Entity({ repository: () => SupplierRepository })
export class Supplier {
  [EntityRepositoryType]?: SupplierRepository;

  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  phone?: string;

  @Property()
  address?: string;

  @OneToMany(() => Product, (product) => product.supplier)
  products = new Collection<Product>(this);

  @Property({ type: 'datetime' })
  createdAt = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt = new Date();
}

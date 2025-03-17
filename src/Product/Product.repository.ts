import { EntityRepository } from '@mikro-orm/sqlite';
import { Product } from './Product.entity';

export class ProductRepository extends EntityRepository<Product> {}

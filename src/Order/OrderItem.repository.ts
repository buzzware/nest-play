import { EntityRepository } from '@mikro-orm/sqlite';
import { OrderItem } from './OrderItem.entity';

export class OrderItemRepository extends EntityRepository<OrderItem> {

}

import { EntityRepository } from '@mikro-orm/sqlite';
import { Order } from './Order.entity';

export class OrderRepository extends EntityRepository<Order> {

}

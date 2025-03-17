import { EntityRepository } from '@mikro-orm/sqlite';
import { Supplier } from './Supplier.entity';

export class SupplierRepository extends EntityRepository<Supplier> {

}

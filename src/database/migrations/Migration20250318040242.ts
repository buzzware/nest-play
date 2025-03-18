import { Migration } from '@mikro-orm/migrations';

export class Migration20250318040242 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`order\` (\`id\` integer not null primary key autoincrement, \`customer_name\` text not null, \`customer_email\` text not null, \`shipping_address\` text not null, \`status\` text check (\`status\` in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) not null default 'pending', \`total_amount\` integer not null, \`created_at\` datetime not null, \`updated_at\` datetime not null);`);

    this.addSql(`create table \`supplier\` (\`id\` integer not null primary key autoincrement, \`name\` text not null, \`email\` text not null, \`phone\` text not null, \`address\` text not null, \`created_at\` datetime not null, \`updated_at\` datetime not null);`);

    this.addSql(`create table \`product\` (\`id\` integer not null primary key autoincrement, \`name\` text not null, \`description\` text not null, \`price\` integer not null, \`sku\` text not null, \`stock_quantity\` integer not null, \`supplier_id\` integer not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, constraint \`product_supplier_id_foreign\` foreign key(\`supplier_id\`) references \`supplier\`(\`id\`) on update cascade);`);
    this.addSql(`create index \`product_supplier_id_index\` on \`product\` (\`supplier_id\`);`);

    this.addSql(`create table \`order_item\` (\`id\` integer not null primary key autoincrement, \`order_id\` integer not null, \`product_id\` integer not null, \`quantity\` integer not null, \`unit_price\` integer not null, \`total_price\` integer not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, constraint \`order_item_order_id_foreign\` foreign key(\`order_id\`) references \`order\`(\`id\`) on update cascade, constraint \`order_item_product_id_foreign\` foreign key(\`product_id\`) references \`product\`(\`id\`) on update cascade);`);
    this.addSql(`create index \`order_item_order_id_index\` on \`order_item\` (\`order_id\`);`);
    this.addSql(`create index \`order_item_product_id_index\` on \`order_item\` (\`product_id\`);`);
  }

}

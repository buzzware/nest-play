import { Migration } from '@mikro-orm/migrations';

export class Migration20250318040242 extends Migration {

  override async up(): Promise<void> {
    this.addSql('create table "order" ("id" SERIAL PRIMARY KEY, "customer_name" TEXT NOT NULL, "customer_email" TEXT NOT NULL, "shipping_address" TEXT NOT NULL, "status" TEXT CHECK ("status" in (\'pending\', \'processing\', \'shipped\', \'delivered\', \'cancelled\')) NOT NULL DEFAULT \'pending\', "total_amount" INTEGER NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL);');
    this.addSql('create table "supplier" ("id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT NOT NULL, "address" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL);');
    this.addSql('create table "product" ("id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "price" INTEGER NOT NULL, "sku" TEXT NOT NULL, "stock_quantity" INTEGER NOT NULL, "supplier_id" INTEGER NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, constraint "product_supplier_id_foreign" foreign key("supplier_id") references "supplier"("id") on update cascade);');
    this.addSql('create index "product_supplier_id_index" on "product" ("supplier_id");');
    this.addSql('create table "order_item" ("id" SERIAL PRIMARY KEY, "order_id" INTEGER NOT NULL, "product_id" INTEGER NOT NULL, "quantity" INTEGER NOT NULL, "unit_price" INTEGER NOT NULL, "total_price" INTEGER NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, constraint "order_item_order_id_foreign" foreign key("order_id") references "order"("id") on update cascade, constraint "order_item_product_id_foreign" foreign key("product_id") references "product"("id") on update cascade);');
    this.addSql('create index "order_item_order_id_index" on "order_item" ("order_id");');
    this.addSql('create index "order_item_product_id_index" on "order_item" ("product_id");');  }
}

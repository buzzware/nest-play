import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderController } from './Order/Order.controller';
import { OrderItemController } from './Order/OrderItem.controller';
import { ProductController } from './Product/Product.controller';
import { SupplierController } from './Supplier/Supplier.controller';

const mikro_config = require('./mikro-orm.config');

@Module({
  imports: [],
  controllers: [AppController,OrderController,OrderItemController,ProductController,SupplierController],
  providers: [AppService],
})
export class AppModule {}

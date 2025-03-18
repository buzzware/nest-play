import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderController } from './Order/Order.controller';
import { OrderItemController } from './Order/OrderItem.controller';
import { ProductController } from './Product/Product.controller';
import { SupplierController } from './Supplier/Supplier.controller';
import { Product } from './Product/Product.entity';
import { Supplier } from './Supplier/Supplier.entity';
import { Order } from './Order/Order.entity';
import { OrderItem } from './Order/OrderItem.entity';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [Product, Supplier, Order, OrderItem],
    }),
  ],
  controllers: [AppController, OrderController, OrderItemController, ProductController, SupplierController],
  providers: [AppService],
})
export class AppModule {}

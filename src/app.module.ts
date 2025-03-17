import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const mikro_config = require('./mikro-orm.config');

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

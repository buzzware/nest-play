import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/sqlite';
import { OrderItem } from './OrderItem.entity';
import { OrderItemRepository } from './OrderItem.repository';

@Controller('order-items')
export class OrderItemController {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: OrderItemRepository,
    private readonly em: EntityManager
  ) {}

  @Get()
  async findAll() {
    return await this.orderItemRepository.findAll({ populate: ['order', 'product'] });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const orderItem = await this.orderItemRepository.findOne(id, { populate: ['order', 'product'] });
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }
    return orderItem;
  }

  @Post()
  async create(@Body() orderItemData: OrderItem) {
    const orderItem = this.orderItemRepository.create({
      ...orderItemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await this.em.persistAndFlush(orderItem);
    return orderItem;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() orderItemData: Partial<OrderItem>) {
    const orderItem = await this.orderItemRepository.findOne(id);
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }
    this.orderItemRepository.assign(orderItem, orderItemData);
    await this.em.flush();
    return orderItem;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const orderItem = await this.orderItemRepository.findOne(id);
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`);
    }
    this.em.remove(orderItem);
    await this.em.flush();
    return { deleted: true };
  }
}

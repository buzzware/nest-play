import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { OrderRepository } from './Order.repository';
import { Order } from './Order.entity';
import { EntityManager } from '@mikro-orm/sqlite';

@Controller('orders')
export class OrderController {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: OrderRepository,
    private readonly em: EntityManager
  ) {}

  @Get()
  async findAll() {
    return await this.orderRepository.findAll({ populate: ['orderItems'] });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const order = await this.orderRepository.findOne(id, { populate: ['orderItems'] });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  @Post()
  async create(@Body() orderData: Order) {
    const order = this.orderRepository.create({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await this.em.persistAndFlush(order);
    return order;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() orderData: Partial<Order>) {
    const order = await this.orderRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    this.orderRepository.assign(order, orderData);
    await this.em.flush();
    return order;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const order = await this.orderRepository.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    this.em.remove(order);
    await this.em.flush();
    return { deleted: true };
  }
}

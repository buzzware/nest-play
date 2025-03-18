import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product } from './Product.entity';
import { ProductRepository } from './Product.repository';
import { EntityManager } from '@mikro-orm/sqlite';

@Controller('products')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly em: EntityManager
  ) {}

  @Get()
  async findAll() {
    return await this.productRepository.findAll({ populate: ['supplier'] });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const product = await this.productRepository.findOne(id, { populate: ['supplier'] });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Post()
  async create(@Body() productData: Product) {
    const product = this.productRepository.create({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await this.em.persistAndFlush(product);
    return product;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() productData: Partial<Product>) {
    const product = await this.productRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.productRepository.assign(product, productData);
    await this.em.flush();
    return product;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const product = await this.productRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    this.em.remove(product);
    await this.em.flush();
    return { deleted: true };
  }
}

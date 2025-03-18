import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/sqlite';
import { Supplier } from './Supplier.entity';
import { SupplierRepository } from './Supplier.repository';

@Controller('suppliers')
export class SupplierController {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: SupplierRepository,
    private readonly em: EntityManager
  ) {}

  @Get()
  async findAll() {
    return await this.supplierRepository.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  @Post()
  async create(@Body() supplierData: Supplier) {
    const supplier = this.supplierRepository.create({
      ...supplierData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await this.em.persistAndFlush(supplier);
    return supplier;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() supplierData: Partial<Supplier>) {
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    this.supplierRepository.assign(supplier, supplierData);
    await this.em.flush();
    return supplier;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const supplier = await this.supplierRepository.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    this.em.remove(supplier);
    await this.em.flush();
    return { deleted: true };
  }
}

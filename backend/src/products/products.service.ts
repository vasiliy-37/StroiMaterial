import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { toProductDto } from '../common/mappers/catalog.mapper';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto = {}) {
    const where: Prisma.ProductWhereInput = {};
    if (query.activeOnly !== false) {
      where.active = true;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.brand) {
      where.brand = query.brand;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return products.map(toProductDto);
  }

  async findAllAdmin() {
    const products = await this.prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
    return products.map(toProductDto);
  }

  async findOne(id: string, activeOnly = true) {
    const product = await this.prisma.product.findFirst({
      where: activeOnly ? { id, active: true } : { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return toProductDto(product);
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        id: dto.id,
        name: dto.name,
        nameEn: dto.nameEn,
        price: dto.price,
        oldPrice: dto.oldPrice,
        image: dto.image,
        badge: dto.badge,
        stock: dto.stock ?? 100,
        stockLabel: dto.stockLabel,
        stockLabelEn: dto.stockLabelEn,
        brand: dto.brand,
        category: dto.category,
        active: dto.active ?? true,
      },
    });
    return toProductDto(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id, false);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        badge: dto.badge === null ? null : dto.badge,
      },
    });
    return toProductDto(product);
  }

  async remove(id: string) {
    await this.findOne(id, false);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  async getBrands() {
    const rows = await this.prisma.product.findMany({
      where: { active: true },
      distinct: ['brand'],
      select: { brand: true },
      orderBy: { brand: 'asc' },
    });
    return rows.map((r) => r.brand);
  }
}

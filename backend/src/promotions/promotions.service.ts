import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { toPromotionDto } from '../common/mappers/catalog.mapper';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  private includeProducts = { products: { select: { productId: true } } };

  async findAll(activeOnly = true) {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: activeOnly
        ? {
            active: true,
            startDate: { lte: now },
            endDate: { gte: now },
          }
        : undefined,
      include: this.includeProducts,
      orderBy: { createdAt: 'asc' },
    });
    return promotions.map(toPromotionDto);
  }

  async findOne(id: string, activeOnly = true) {
    const now = new Date();
    const promotion = await this.prisma.promotion.findFirst({
      where: activeOnly
        ? { id, active: true, startDate: { lte: now }, endDate: { gte: now } }
        : { id },
      include: this.includeProducts,
    });
    if (!promotion) throw new NotFoundException('Promotion not found');
    return toPromotionDto(promotion);
  }

  async create(dto: CreatePromotionDto) {
    const { productIds = [], ...data } = dto;
    const promotion = await this.prisma.promotion.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        products: {
          create: productIds.map((productId) => ({ productId })),
        },
      },
      include: this.includeProducts,
    });
    return toPromotionDto(promotion);
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.findOne(id, false);
    const { productIds, startDate, endDate, ...rest } = dto;

    if (productIds) {
      await this.prisma.promotionProduct.deleteMany({ where: { promotionId: id } });
      if (productIds.length) {
        await this.prisma.promotionProduct.createMany({
          data: productIds.map((productId) => ({ promotionId: id, productId })),
        });
      }
    }

    const promotion = await this.prisma.promotion.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
      include: this.includeProducts,
    });
    return toPromotionDto(promotion);
  }

  async remove(id: string) {
    await this.findOne(id, false);
    await this.prisma.promotion.delete({ where: { id } });
    return { ok: true };
  }
}

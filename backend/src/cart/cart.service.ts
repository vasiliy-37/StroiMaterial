import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { PricingService } from '../common/pricing.service';

import { AddCartItemDto, MergeCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

import { toProductDto } from '../common/mappers/catalog.mapper';



@Injectable()

export class CartService {

  constructor(

    private readonly prisma: PrismaService,

    private readonly pricing: PricingService,

  ) {}



  private async getOrCreateCart(userId: string) {

    let cart = await this.prisma.cart.findUnique({

      where: { userId },

      include: { items: { include: { product: true } } },

    });

    if (!cart) {

      cart = await this.prisma.cart.create({

        data: { userId },

        include: { items: { include: { product: true } } },

      });

    }

    return cart;

  }



  private assertStock(product: { stockQty: number; name: string }, quantity: number) {

    if (product.stockQty <= 0) {

      throw new BadRequestException(`${product.name} is out of stock`);

    }

    if (quantity > product.stockQty) {

      throw new BadRequestException(

        `Only ${product.stockQty} items available for ${product.name}`,

      );

    }

  }



  private async mapCart(cart: Awaited<ReturnType<typeof this.getOrCreateCart>>) {

    const promotions = await this.pricing.getActivePromotions();

    const items = cart.items.map((item) => {

      const basePrice = Number(item.product.price);

      const unitPrice = this.pricing.getEffectiveUnitPrice(

        item.productId,

        basePrice,

        promotions,

      );

      return {

        id: item.id,

        productId: item.productId,

        quantity: item.quantity,

        unitPrice,

        product: toProductDto(item.product),

        lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,

      };

    });

    const total = Math.round(items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;

    return { id: cart.id, items, total, itemCount: items.reduce((s, i) => s + i.quantity, 0) };

  }



  async getCart(userId: string) {

    const cart = await this.getOrCreateCart(userId);

    return this.mapCart(cart);

  }



  async addItem(userId: string, dto: AddCartItemDto) {

    const product = await this.prisma.product.findFirst({

      where: { id: dto.productId, active: true },

    });

    if (!product) throw new NotFoundException('Product not found');



    const cart = await this.getOrCreateCart(userId);

    const existing = cart.items.find((i) => i.productId === dto.productId);

    const qty = dto.quantity ?? 1;

    const newQty = (existing?.quantity ?? 0) + qty;



    this.assertStock(product, newQty);



    if (existing) {

      await this.prisma.cartItem.update({

        where: { id: existing.id },

        data: { quantity: newQty },

      });

    } else {

      await this.prisma.cartItem.create({

        data: { cartId: cart.id, productId: dto.productId, quantity: qty },

      });

    }

    return this.getCart(userId);

  }



  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {

    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Cart item not found');



    this.assertStock(item.product, dto.quantity);



    await this.prisma.cartItem.update({

      where: { id: itemId },

      data: { quantity: dto.quantity },

    });

    return this.getCart(userId);

  }



  async removeItem(userId: string, itemId: string) {

    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) throw new NotFoundException('Cart item not found');



    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);

  }



  async clearCart(userId: string) {

    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.getCart(userId);

  }



  async merge(userId: string, items: MergeCartItemDto[]) {

    for (const item of items) {

      await this.addItem(userId, { productId: item.productId, quantity: item.quantity });

    }

    return this.getCart(userId);

  }

}



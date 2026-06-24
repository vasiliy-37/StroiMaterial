import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CartService } from '../cart/cart.service';

import { CreateOrderDto } from './dto/order.dto';

import { toOrderDto } from '../common/mappers/catalog.mapper';



@Injectable()

export class OrdersService {

  constructor(

    private readonly prisma: PrismaService,

    private readonly cart: CartService,

  ) {}



  private generateOrderNumber(): string {

    const year = new Date().getFullYear();

    const seq = Math.floor(Math.random() * 90000) + 10000;

    return `BP-${year}-${seq}`;

  }



  async createFromCart(userId: string, dto: CreateOrderDto) {

    const cart = await this.cart.getCart(userId);

    if (!cart.items.length) {

      throw new BadRequestException('Cart is empty');

    }



    const order = await this.prisma.$transaction(async (tx) => {

      for (const item of cart.items) {

        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {

          throw new NotFoundException(`Product ${item.productId} not found`);

        }

        if (product.stockQty < item.quantity) {

          throw new BadRequestException(

            `Insufficient stock for ${product.name}. Available: ${product.stockQty}`,

          );

        }

      }



      const created = await tx.order.create({

        data: {

          orderNumber: this.generateOrderNumber(),

          userId,

          total: cart.total,

          address: dto.address,

          phone: dto.phone,

          comment: dto.comment,

          status: OrderStatus.PENDING,

          items: {

            create: cart.items.map((item) => ({

              productId: item.productId,

              quantity: item.quantity,

              price: item.unitPrice,

              name: item.product.name,

              nameEn: item.product.nameEn,

              image: item.product.image,

            })),

          },

        },

        include: { items: true },

      });



      for (const item of cart.items) {

        await tx.product.update({

          where: { id: item.productId },

          data: { stockQty: { decrement: item.quantity } },

        });

      }



      const dbCart = await tx.cart.findUnique({ where: { userId } });

      if (dbCart) {

        await tx.cartItem.deleteMany({ where: { cartId: dbCart.id } });

      }



      return created;

    });



    return toOrderDto(order);

  }



  async findUserOrders(userId: string) {

    const orders = await this.prisma.order.findMany({

      where: { userId },

      include: { items: true },

      orderBy: { createdAt: 'desc' },

    });

    return orders.map(toOrderDto);

  }



  async findOne(userId: string, id: string) {

    const order = await this.prisma.order.findFirst({

      where: { id, userId },

      include: { items: true },

    });

    if (!order) throw new NotFoundException('Order not found');

    return toOrderDto(order);

  }



  async findAllAdmin() {

    const orders = await this.prisma.order.findMany({

      include: { items: true },

      orderBy: { createdAt: 'desc' },

    });

    return orders.map(toOrderDto);

  }



  async updateStatus(id: string, status: OrderStatus) {

    const existing = await this.prisma.order.findUnique({ where: { id } });

    if (!existing) {

      throw new NotFoundException('Order not found');

    }

    const order = await this.prisma.order.update({

      where: { id },

      data: { status },

      include: { items: true },

    });

    return toOrderDto(order);

  }

}



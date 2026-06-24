import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_CATALOG } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.siteService.deleteMany();
  await prisma.contentEntry.deleteMany();
  await prisma.siteSettings.deleteMany();

  const { products, services, promotions, contentRu, contentEn, heroImage } = SEED_CATALOG;

  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        badge: product.badge,
        stock: product.stock,
        stockLabel: product.stockLabel,
        stockLabelEn: product.stockLabelEn,
        brand: product.brand,
        category: product.category,
        active: product.active,
      },
    });
  }

  for (const [index, service] of services.entries()) {
    await prisma.siteService.create({
      data: {
        id: service.id,
        icon: service.icon,
        titleRu: service.titleRu,
        titleEn: service.titleEn,
        descRu: service.descRu,
        descEn: service.descEn,
        active: service.active,
        sortOrder: index,
      },
    });
  }

  for (const promo of promotions) {
    await prisma.promotion.create({
      data: {
        id: promo.id,
        titleRu: promo.titleRu,
        titleEn: promo.titleEn,
        descriptionRu: promo.descriptionRu,
        descriptionEn: promo.descriptionEn,
        discountPercent: promo.discountPercent,
        type: promo.type,
        startDate: new Date(promo.startDate),
        endDate: new Date(promo.endDate),
        active: promo.active,
        products: {
          create: promo.productIds.map((productId) => ({ productId })),
        },
      },
    });
  }

  for (const [key, value] of Object.entries(contentRu)) {
    await prisma.contentEntry.create({ data: { key, lang: 'ru', value } });
  }
  for (const [key, value] of Object.entries(contentEn)) {
    await prisma.contentEntry.create({ data: { key, lang: 'en', value } });
  }

  await prisma.siteSettings.create({
    data: { id: 'default', heroImage },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@buildpro.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: hash,
      name: 'BuildPro Admin',
      role: Role.ADMIN,
    },
    update: {
      password: hash,
      role: Role.ADMIN,
    },
  });

  console.log(`Done. Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

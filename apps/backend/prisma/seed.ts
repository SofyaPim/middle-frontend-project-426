import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Видеокарта Nova RTX 5070',
    slug: 'nova-rtx-5070',
    category: 'Видеокарты',
    description: 'Производительная видеокарта для современных игр.',
    price: 74990,
  },
  {
    name: 'Процессор CoreForge 7',
    slug: 'coreforge-7',
    category: 'Процессоры',
    description: 'Многоядерный процессор для работы и игр.',
    price: 42990,
  },
];

for (const product of products) {
  await prisma.product.upsert({
    where: { slug: product.slug },
    update: product,
    create: product,
  });
}

await prisma.$disconnect();

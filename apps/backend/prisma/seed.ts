import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CategorySeed = { slug: string; name: string };

type ProductSeed = {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  available?: boolean;
};

const categories: CategorySeed[] = [
  { slug: 'gpus', name: 'Видеокарты' },
  { slug: 'cpus', name: 'Процессоры' },
  { slug: 'ssd', name: 'SSD' },
  { slug: 'ram', name: 'Оперативная память' },
  { slug: 'cases', name: 'Корпуса' },
];

const image = (slug: string) => `https://picsum.photos/seed/${slug}/600/400`;

const products: ProductSeed[] = [
  // Видеокарты
  { name: 'Видеокарта Nova RTX 5070', slug: 'nova-rtx-5070', category: 'gpus', description: 'Производительная видеокарта для современных игр.', price: 74990, imageUrl: image('nova-rtx-5070') },
  { name: 'Видеокарта Nova RTX 4070', slug: 'nova-rtx-4070', category: 'gpus', description: 'Отличный баланс цены и производительности.', price: 54990, imageUrl: image('nova-rtx-4070') },
  { name: 'Видеокарта Nova RTX 3070', slug: 'nova-rtx-3070', category: 'gpus', description: 'Надёжная карта для игр в 1440p.', price: 34990, imageUrl: image('nova-rtx-3070') },
  { name: 'Видеокарта Nova RX 7800 XT', slug: 'nova-rx-7800-xt', category: 'gpus', description: 'Высокая скорость в 4K-играх.', price: 62990, imageUrl: image('nova-rx-7800-xt') },
  { name: 'Видеокарта Nova RX 7600', slug: 'nova-rx-7600', category: 'gpus', description: 'Бюджетная модель для Full HD.', price: 27990, imageUrl: image('nova-rx-7600') },
  { name: 'Видеокарта Nova RTX 5090', slug: 'nova-rtx-5090', category: 'gpus', description: 'Флагман с максимальной производительностью.', price: 189990, imageUrl: image('nova-rtx-5090') },
  { name: 'Видеокарта Nova GTX 1660 Super', slug: 'nova-gtx-1660-super', category: 'gpus', description: 'Простая карта для киберспорта.', price: 18990, imageUrl: image('nova-gtx-1660-super') },
  { name: 'Видеокарта Nova Arc A750', slug: 'nova-arc-a750', category: 'gpus', description: 'Доступная модель с хорошим декодированием видео.', price: 23990, imageUrl: image('nova-arc-a750') },
  { name: 'Видеокарта Nova RTX 5060 Ti', slug: 'nova-rtx-5060-ti', category: 'gpus', description: 'Новинка среднего сегмента.', price: 39990, imageUrl: null, available: false },
  { name: 'Видеокарта Nova Vega 56', slug: 'nova-vega-56', category: 'gpus', description: 'Проверенная временем модель.', price: 25990, imageUrl: image('nova-vega-56') },
  // Процессоры
  { name: 'Процессор CoreForge 7', slug: 'coreforge-7', category: 'cpus', description: 'Многоядерный процессор для работы и игр.', price: 42990, imageUrl: image('coreforge-7') },
  { name: 'Процессор CoreForge 5', slug: 'coreforge-5', category: 'cpus', description: 'Оптимальный выбор для сборки среднего уровня.', price: 27990, imageUrl: image('coreforge-5') },
  { name: 'Процессор CoreForge 3', slug: 'coreforge-3', category: 'cpus', description: 'Бюджетный процессор для офиса.', price: 12990, imageUrl: image('coreforge-3') },
  { name: 'Процессор CoreForge 9', slug: 'coreforge-9', category: 'cpus', description: 'Флагман для тяжёлых вычислений.', price: 74990, imageUrl: image('coreforge-9') },
  { name: 'Процессор ThreadForge 7950X', slug: 'threadforge-7950x', category: 'cpus', description: 'Топ для стриминга и монтажа.', price: 61990, imageUrl: image('threadforge-7950x') },
  { name: 'Процессор ThreadForge 7700X', slug: 'threadforge-7700x', category: 'cpus', description: 'Мощный восьмиядерник.', price: 34990, imageUrl: image('threadforge-7700x') },
  { name: 'Процессор ThreadForge 5600', slug: 'threadforge-5600', category: 'cpus', description: 'Популярный шестиядерник.', price: 16990, imageUrl: image('threadforge-5600') },
  { name: 'Процессор ThreadForge 3100', slug: 'threadforge-3100', category: 'cpus', description: 'Простой процессор для офисных задач.', price: 9490, imageUrl: image('threadforge-3100') },
  { name: 'Процессор CoreForge 5 X', slug: 'coreforge-5-x', category: 'cpus', description: 'Разогнанная версия с повышенной частотой.', price: 31990, imageUrl: null },
  { name: 'Процессор ThreadForge 5600X', slug: 'threadforge-5600x', category: 'cpus', description: 'Лучший выбор для игровых сборок.', price: 19990, imageUrl: image('threadforge-5600x') },
  // SSD
  { name: 'SSD Nova NVMe 1TB', slug: 'nova-nvme-1tb', category: 'ssd', description: 'Быстрый накопитель для системы и игр.', price: 7490, imageUrl: image('nova-nvme-1tb') },
  { name: 'SSD Nova NVMe 500GB', slug: 'nova-nvme-500gb', category: 'ssd', description: 'Компактный накопитель начального уровня.', price: 3990, imageUrl: image('nova-nvme-500gb') },
  { name: 'SSD Nova NVMe 2TB', slug: 'nova-nvme-2tb', category: 'ssd', description: 'Большой объём для библиотек игр.', price: 12990, imageUrl: image('nova-nvme-2tb') },
  { name: 'SSD Nova SATA 1TB', slug: 'nova-sata-1tb', category: 'ssd', description: 'Надёжный классический накопитель.', price: 5490, imageUrl: image('nova-sata-1tb') },
  { name: 'SSD Nova SATA 500GB', slug: 'nova-sata-500gb', category: 'ssd', description: 'Бюджетный вариант для апгрейда ноутбука.', price: 2990, imageUrl: image('nova-sata-500gb') },
  { name: 'SSD Nova NVMe 4TB', slug: 'nova-nvme-4tb', category: 'ssd', description: 'Максимальный объём на одном носителе.', price: 22990, imageUrl: image('nova-nvme-4tb') },
  { name: 'SSD Nova Portable 1TB', slug: 'nova-portable-1tb', category: 'ssd', description: 'Внешний накопитель для переноса данных.', price: 8490, imageUrl: image('nova-portable-1tb') },
  { name: 'SSD Nova NVMe 256GB', slug: 'nova-nvme-256gb', category: 'ssd', description: 'Минимум для офисной системы.', price: 1990, imageUrl: image('nova-nvme-256gb') },
  { name: 'SSD Nova NVMe 2TB Pro', slug: 'nova-nvme-2tb-pro', category: 'ssd', description: 'Повышенная скорость чтения для профессионалов.', price: 15490, imageUrl: image('nova-nvme-2tb-pro') },
  { name: 'SSD Nova SATA 256GB', slug: 'nova-sata-256gb', category: 'ssd', description: 'Минимальный накопитель для офиса.', price: 1590, imageUrl: image('nova-sata-256gb') },
  { name: 'SSD Nova Portable 2TB', slug: 'nova-portable-2tb', category: 'ssd', description: 'Внешний накопитель с защитой от ударов.', price: 12990, imageUrl: image('nova-portable-2tb') },
  { name: 'SSD Nova NVMe 1TB Pro', slug: 'nova-nvme-1tb-pro', category: 'ssd', description: 'Быстрая модель для тяжёлых нагрузок.', price: 8990, imageUrl: image('nova-nvme-1tb-pro') },
    // Оперативная память
  { name: 'Память Nova DDR5 16GB RGB', slug: 'nova-ddr5-16gb-rgb', category: 'ram', description: 'Память с подсветкой для эффектных сборок.', price: 6990, imageUrl: image('nova-ddr5-16gb-rgb') },
  { name: 'Память Nova DDR4 4GB', slug: 'nova-ddr4-4gb', category: 'ram', description: 'Бюджетный модуль для подмены.', price: 1290, imageUrl: image('nova-ddr4-4gb') },
  { name: 'Память Nova DDR5 32GB RGB', slug: 'nova-ddr5-32gb-rgb', category: 'ram', description: 'Большой объём с подсветкой.', price: 12490, imageUrl: image('nova-ddr5-32gb-rgb') },
  { name: 'Память Nova DDR4 16GB RGB', slug: 'nova-ddr4-16gb-rgb', category: 'ram', description: 'Игровой модуль с подсветкой.', price: 4490, imageUrl: image('nova-ddr4-16gb-rgb') },
  { name: 'Память Nova DDR5 16GB', slug: 'nova-ddr5-16gb', category: 'ram', description: 'Быстрая память нового поколения.', price: 5990, imageUrl: image('nova-ddr5-16gb') },
  { name: 'Память Nova DDR5 32GB', slug: 'nova-ddr5-32gb', category: 'ram', description: 'Достаточно для тяжёлых задач.', price: 10990, imageUrl: image('nova-ddr5-32gb') },
  { name: 'Память Nova DDR4 8GB', slug: 'nova-ddr4-8gb', category: 'ram', description: 'Бюджетный модуль для базовой сборки.', price: 2490, imageUrl: image('nova-ddr4-8gb') },
  { name: 'Память Nova DDR4 16GB', slug: 'nova-ddr4-16gb', category: 'ram', description: 'Популярный объём для игр.', price: 3990, imageUrl: image('nova-ddr4-16gb') },
  { name: 'Память Nova DDR5 64GB', slug: 'nova-ddr5-64gb', category: 'ram', description: 'Максимум для рабочих станций.', price: 19990, imageUrl: image('nova-ddr5-64gb') },
  { name: 'Память Nova DDR4 32GB', slug: 'nova-ddr4-32gb', category: 'ram', description: 'Увеличенный объём по доступной цене.', price: 6490, imageUrl: image('nova-ddr4-32gb') },
  // Корпуса
  { name: 'Корпус Nova Tower Slim', slug: 'nova-tower-slim', category: 'cases', description: 'Узкий корпус для компактных решений.', price: 4590, imageUrl: image('nova-tower-slim') },
  { name: 'Корпус Nova Air RGB', slug: 'nova-air-rgb', category: 'cases', description: 'Вариант с вентиляторами и подсветкой.', price: 5890, imageUrl: image('nova-air-rgb') },
  { name: 'Корпус Nova Compact Pro', slug: 'nova-compact-pro', category: 'cases', description: 'Компактный корпус с продуманной вентиляцией.', price: 4290, imageUrl: image('nova-compact-pro') },
  { name: 'Корпус Nova Silent Pro', slug: 'nova-silent-pro', category: 'cases', description: 'Усиленная шумоизоляция для тишины.', price: 9990, imageUrl: image('nova-silent-pro') },
  { name: 'Корпус Nova Air Black', slug: 'nova-air-black', category: 'cases', description: 'Компактный корпус с хорошей вентиляцией.', price: 4990, imageUrl: image('nova-air-black') },
  { name: 'Корпус Nova Air White', slug: 'nova-air-white', category: 'cases', description: 'Белый вариант с панорамным стеклом.', price: 5390, imageUrl: image('nova-air-white') },
  { name: 'Корпус Nova Tower ATX', slug: 'nova-tower-atx', category: 'cases', description: 'Полноразмерный корпус для топовых сборок.', price: 7990, imageUrl: image('nova-tower-atx') },
  { name: 'Корпус Nova Compact Mini', slug: 'nova-compact-mini', category: 'cases', description: 'Маленький корпус для компактных систем.', price: 3490, imageUrl: null },
  { name: 'Корпус Nova Mesh RGB', slug: 'nova-mesh-rgb', category: 'cases', description: 'Сетчатая фронтальная панель и подсветка.', price: 6490, imageUrl: image('nova-mesh-rgb') },
  { name: 'Корпус Nova Silent', slug: 'nova-silent', category: 'cases', description: 'Шумоизоляция для тихих сборок.', price: 8990, imageUrl: image('nova-silent') },
];

const categoryIds = new Map<string, number>();
for (const category of categories) {
  await prisma.category.upsert({
    where: { slug: category.slug },
    update: {},
    create: category,
  });
  categoryIds.set(
    category.slug,
    (await prisma.category.findUnique({ where: { slug: category.slug } }))!.id,
  );
}

for (const product of products) {
  const { category, ...data } = product;
  const categoryId = categoryIds.get(category)!;
  await prisma.product.upsert({
    where: { slug: data.slug },
    update: { ...data, categoryId },
    create: { ...data, categoryId },
  });
}

await prisma.$disconnect();